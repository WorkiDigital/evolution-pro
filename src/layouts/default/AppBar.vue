<template>
  <v-app-bar flat class="premium-appbar">
    <!-- Logo and Brand -->
    <div class="brand-section">
      <v-btn variant="text" @click="$router.push({ name: 'instances' })" class="brand-btn">
        <div class="logo-container">
          <v-img src="@/assets/logo.png" height="32" width="32" />
        </div>
        <div class="brand-text">
          <span class="brand-name">Evolution</span>
          <span class="brand-label">Manager</span>
        </div>
      </v-btn>
    </div>

    <!-- Connection Status -->
    <div class="connection-status">
      <v-progress-circular v-if="AppStore.connecting" indeterminate size="20" width="2" color="primary" />
      <v-chip
        v-else-if="AppStore.validConnection"
        variant="flat"
        class="status-chip connected"
      >
        <v-icon start size="16" color="success">mdi-check-circle</v-icon>
        <span class="host-name">
          {{ AppStore.connection.host.replace(/https?:\/\//, "").replace(/\/$/, "") }}
        </span>
        <v-chip size="x-small" class="version-chip ml-2">
          v{{ AppStore.version }}
        </v-chip>
      </v-chip>
      <v-chip v-else variant="flat" class="status-chip disconnected">
        <v-icon start size="16" color="error">mdi-alert-circle</v-icon>
        Desconectado
      </v-chip>
    </div>
    
    <v-spacer></v-spacer>

    <v-spacer></v-spacer>

    <!-- Header Actions -->
    <div class="header-actions">
      <v-chip variant="flat" class="user-badge px-4 mr-4">
        <v-icon start size="18" color="primary">mdi-crown</v-icon>
        Nexus Premium
      </v-chip>
    </div>

    <v-divider vertical class="mx-3 divider-styled"></v-divider>

    <!-- Quick Actions -->
    <div class="actions-section">
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="action-btn">
            <v-icon start>mdi-translate</v-icon>
            {{ currentLanguage }}
            <v-icon end size="14">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list class="lang-menu">
          <v-list-item
            v-for="lang in availableLanguages"
            :key="lang"
            @click="changei18n(lang)"
            :active="lang === currentLanguage"
          >
            <v-list-item-title>
              <v-icon v-if="lang === currentLanguage" start color="primary">mdi-check</v-icon>
              {{ getLangLabel(lang) }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      
      <v-btn @click="toggleTheme" icon variant="text" class="action-btn-icon">
        <v-icon>mdi-{{ dark ? "white-balance-sunny" : "weather-night" }}</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ dark ? 'Modo Claro' : 'Modo Escuro' }}</v-tooltip>
      </v-btn>
    </div>
  </v-app-bar>
  
  <SettingsModal ref="settings" />
</template>

<script>
import SettingsModal from "@/components/modal/Settings.vue";
import { useAppStore } from "@/store/app";
import { useCrmStore } from "@/store/crm";
import { useTheme } from "vuetify";

export default {
  name: "AppBar",
  data: () => ({
    AppStore: useAppStore(),
    crmStore: useCrmStore(),
    theme: useTheme(),
  }),
  components: {
    SettingsModal,
  },
  methods: {
    handleOnline() {
      if (this.crmStore.showSnackbar) this.crmStore.showSnackbar('Conexão restabelecida!', 'success');
      console.log("Conexão à internet está ativa.");
    },
    handleOffline() {
      if (this.crmStore.showSnackbar) this.crmStore.showSnackbar('Sem conexão à internet!', 'error');
      console.error("Sem conexão à internet. Verifique sua conexão e tente novamente.");
    },
    isActiveRoute(routeName) {
      return this.$route.name === routeName
    },
    changei18n(locale) {
      this.$vuetify.locale.current = locale;
      window.localStorage.setItem("locale", locale);
    },
    getLangLabel(lang) {
      const labels = { pt: 'Português', en: 'English', es: 'Español' }
      return labels[lang] || lang.toUpperCase()
    },
    toggleTheme() {
      const theme = this.theme.global.current.dark ? "light" : "dark";
      this.theme.global.name = theme;
      localStorage.setItem("theme", theme);
    },
    openSettings() {
      this.$refs.settings.open();
    },
    async loadConnectionFromUrl() {
      try {
        const { connection } = this.$route.query;
        if (!connection) return null;
        this.$router.replace({ query: {} });

        const json = atob(connection);
        const data = JSON.parse(json);
        if (!data.host || !data.globalApiKey) return null;

        await this.AppStore.setConnection(data);
        return data;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  },
  computed: {
    dark() {
      return this.theme.global.current.dark;
    },
    availableLanguages() {
      return this.$i18n.availableLocales;
    },
    currentLanguage() {
      return this.$i18n.locale;
    },
    leadCount() {
      return this.crmStore.getAllLeads?.length || 0
    }
  },
  async mounted() {
    try {
      const urlConnection = await this.loadConnectionFromUrl();
      if (!urlConnection) await this.AppStore.loadConnection();
      
      // Load CRM data
      this.crmStore.loadFromLocalStorage()
    } catch (e) {
      console.error(e);
    }
  },
  created() {
    // Verifique a conexão à internet conforme solicitado
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    if (!navigator.onLine) {
      this.handleOffline();
    } else {
      console.log("Conexão à internet está ativa.");
    }
  },
  beforeUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  },
};
</script>

<style scoped>
.premium-appbar {
  background: linear-gradient(180deg, rgba(15, 15, 26, 0.98), rgba(20, 20, 35, 0.95)) !important;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  padding: 0 16px;
}

/* Brand Section */
.brand-section {
  flex-shrink: 0;
}

.brand-btn {
  padding: 8px 12px !important;
  height: auto !important;
}

.brand-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}

.logo-container {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.brand-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-label {
  font-size: 0.65rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

/* Connection Status */
.connection-status {
  margin-left: 24px;
}

.status-chip {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  height: 36px;
  padding: 0 12px;
}

.status-chip.connected {
  border-color: rgba(52, 211, 153, 0.3);
}

.status-chip.disconnected {
  border-color: rgba(239, 68, 68, 0.3);
}

.host-name {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.version-chip {
  background: rgba(102, 126, 234, 0.2) !important;
  color: #a5b4fc !important;
  font-weight: 600;
}

/* Navigation */
.nav-section {
  display: flex;
  gap: 8px;
}

.nav-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.2px;
  border-radius: 10px;
  padding: 0 16px;
  height: 40px;
}

.nav-btn:not(.v-btn--variant-flat) {
  color: rgba(255, 255, 255, 0.6);
}

.nav-btn:not(.v-btn--variant-flat):hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.user-badge {
  background: rgba(168, 85, 247, 0.1) !important;
  color: #a855f7 !important;
  border: 1px solid rgba(168, 85, 247, 0.2);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.logo-container {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.divider-styled {
  height: 24px;
  opacity: 0.2;
}

/* Actions Section */
.actions-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  text-transform: none;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
}

.action-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.action-btn-icon {
  color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.action-btn-icon:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.lang-menu {
  background: rgba(25, 25, 40, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .brand-text {
    display: none;
  }
  
  .host-name {
    max-width: 100px;
  }
  
  .nav-btn span {
    display: none;
  }
  
  .nav-btn .v-icon {
    margin: 0;
  }
}
</style>
