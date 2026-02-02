<template>
  <div class="home-view">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
      </div>
      
      <div class="hero-content">
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <div class="hero-badge mb-2">
              <v-icon size="14" class="mr-1">mdi-whatsapp</v-icon>
              Evolution API
            </div>
            <h1 class="hero-title">
              <span class="gradient-text">{{ $t("instance", 2) }}</span>
            </h1>
            <p class="hero-subtitle">
              Gerencie suas instâncias WhatsApp em um só lugar
            </p>
          </div>

          <div class="d-flex gap-3">
            <v-btn
              color="primary"
              variant="tonal"
              class="action-btn-secondary"
              @click="getInstances"
              :loading="loading"
              size="large"
            >
              <v-icon start>mdi-refresh</v-icon>
              Atualizar Lista
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview" v-if="instances.length > 0">
      <div class="mini-stat">
        <div class="mini-stat-icon primary">
          <v-icon size="20">mdi-cellphone-link</v-icon>
        </div>
        <div class="mini-stat-content">
          <span class="mini-stat-value">{{ instances.length }}</span>
          <span class="mini-stat-label">Total</span>
        </div>
      </div>

      <div class="mini-stat">
        <div class="mini-stat-icon success">
          <v-icon size="20">mdi-check-circle</v-icon>
        </div>
        <div class="mini-stat-content">
          <span class="mini-stat-value">{{ connectedCount }}</span>
          <span class="mini-stat-label">Conectadas</span>
        </div>
      </div>

      <div class="mini-stat">
        <div class="mini-stat-icon warning">
          <v-icon size="20">mdi-alert-circle</v-icon>
        </div>
        <div class="mini-stat-content">
          <span class="mini-stat-value">{{ disconnectedCount }}</span>
          <span class="mini-stat-label">Pendentes</span>
        </div>
      </div>

      <div class="mini-stat">
        <div class="mini-stat-icon info">
          <v-icon size="20">mdi-account-group</v-icon>
        </div>
        <div class="mini-stat-content">
          <span class="mini-stat-value">{{ totalLeads }}</span>
          <span class="mini-stat-label">Leads no CRM</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <!-- Filters Section -->
    <div class="filters-section" v-if="!loading && instances.length > 0">
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            :label="$t('search')"
            density="comfortable"
            variant="outlined"
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            class="search-field"
          />
        </v-col>
        <v-col cols="12" sm="6" md="auto">
          <v-btn-toggle
            v-model="statusFilter"
            variant="outlined"
            divided
            mandatory
            class="status-toggle"
          >
            <v-btn :value="false" size="small" class="toggle-btn">
              {{ $t("all") }}
            </v-btn>
            <v-btn
              v-for="[key, item] in Object.entries(statusMapper)"
              :key="item.text"
              :value="key"
              :color="item.color"
              size="small"
              class="toggle-btn"
            >
              <v-icon start size="14">{{ item.icon }}</v-icon>
              {{ $t(`status.${key}`) }}
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </div>

    <!-- Instances Grid -->
    <div class="instances-grid" v-if="filteredInstances.length > 0">
      <div
        v-for="{ instance } in filteredInstances"
        :key="instance.instanceName"
        class="instance-card"
        @click="goToInstance(instance)"
      >
        <div class="card-status-indicator" :class="instance.status"></div>
        
        <div class="card-content">
          <div class="d-flex align-center gap-3">
            <div class="instance-avatar" :class="instance.status">
              <v-img
                v-if="instance.profilePictureUrl"
                :src="instance.profilePictureUrl"
                cover
              />
              <v-icon v-else size="28">{{ statusMapper[instance.status].icon }}</v-icon>
            </div>
            
            <div class="instance-info">
              <v-chip
                :color="statusMapper[instance.status].color"
                size="x-small"
                variant="flat"
                class="status-badge mb-1"
              >
                <v-icon start size="10">{{ statusMapper[instance.status].icon }}</v-icon>
                {{ $t(`status.${instance.status}`) }}
              </v-chip>
              <h4 class="instance-name">{{ instance.instanceName }}</h4>
              <p class="instance-owner" v-if="instance.owner">{{ formatPhone(instance.owner) }}</p>
            </div>
          </div>

          <div class="card-actions">
            <v-btn
              icon
              variant="text"
              size="small"
              class="action-btn"
              @click.stop="openInstanceCRM(instance)"
              v-if="instance.status === 'open'"
            >
              <v-icon>mdi-view-dashboard</v-icon>
              <v-tooltip activator="parent" location="top">CRM</v-tooltip>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              class="action-btn delete-btn"
              :loading="loadingDelete === instance.instanceName"
              @click.stop="deleteInstance(instance.instanceName)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent" location="top">Excluir</v-tooltip>
            </v-btn>
          </div>
        </div>

        <!-- Quick Stats for Connected -->
        <div class="card-footer" v-if="instance.status === 'open'">
          <div class="footer-stat">
            <v-icon size="14">mdi-account-group</v-icon>
            <span>{{ getInstanceLeadCount(instance.instanceName) }} leads</span>
          </div>
          <div class="footer-stat">
            <v-icon size="14">mdi-message</v-icon>
            <span>Ativo</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-else-if="!loading">
      <div class="empty-icon">
        <v-icon size="64">mdi-cellphone-off</v-icon>
      </div>
      <h3 class="empty-title">{{ $t("noInstances") }}</h3>
      <p class="empty-subtitle">Crie sua primeira instância para começar</p>
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        @click="addInstance"
        class="mt-4"
      >
        <v-icon start>mdi-plus</v-icon>
        Criar Instância
      </v-btn>
    </div>

    <!-- Error Alert -->
    <v-alert v-if="error" type="error" class="mt-4" variant="tonal" closable @click:close="error = false">
      {{ error }}
    </v-alert>

    <!-- Create Instance Modal -->
    <CreateInstance ref="createInstanceModal" />
  </div>
</template>

<script>
import { useAppStore } from "@/store/app";
import { useCrmStore } from "@/store/crm";
import CreateInstance from "@/components/modal/CreateInstance";
import statusMapper from "@/helpers/mappers/status";
import instanceController from "@/services/instanceController";

export default {
  name: "HomeInstance",
  components: {
    CreateInstance,
  },
  data: () => ({
    AppStore: useAppStore(),
    crmStore: useCrmStore(),
    loadingInner: false,
    loadingDelete: false,
    error: false,
    statusMapper: statusMapper,
    statusFilter: false,
    search: "",
  }),
  methods: {
    addInstance() {
      this.$refs.createInstanceModal.open();
    },
    goToInstance(instance) {
      this.$router.push({
        name: "instance",
        params: { id: instance.instanceName },
      });
    },
    openInstanceCRM(instance) {
      this.$router.push({
        name: "instance",
        params: { id: instance.instanceName },
        query: { tab: 'crm' }
      });
    },
    async deleteInstance(instanceName) {
      try {
        this.loadingDelete = instanceName;
        const confirm = window.confirm(
          `Tem certeza que deseja excluir a instância ${instanceName}?`
        );
        if (!confirm) return;

        await instanceController.logout(instanceName).catch(() => {});
        await instanceController.delete(instanceName);
        await this.AppStore.reconnect();
      } catch (e) {
        this.error = e.message?.message || e.message || e;
      } finally {
        this.loadingDelete = false;
      }
    },
    async getInstances() {
      try {
        this.loadingInner = true;
        this.instances = await this.AppStore.reconnect();
      } catch (e) {
        this.error = e.message?.message || e.message || e;
      } finally {
        this.loadingInner = false;
      }
    },
    formatPhone(phone) {
      if (!phone) return '';
      // Remove @s.whatsapp.net
      return phone.replace('@s.whatsapp.net', '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    },
    getInstanceLeadCount(instanceName) {
      return this.crmStore.getLeadsByInstance(instanceName).length;
    },
    handleQueryParams() {
      if (this.$route.query.action === 'add') {
        this.addInstance();
      }
    }
  },
  computed: {
    loading() {
      return this.loadingInner || this.AppStore.connecting;
    },
    instances() {
      return this.AppStore.instances;
    },
    filteredInstances() {
      const instances = this.instances.filter((instance) => {
        if (!this.statusFilter) return true;
        return instance.instance.status === this.statusFilter;
      });

      if (!this.search) return instances;
      return instances.filter((instance) => {
        const search = this.search.trim().toLowerCase();

        return (
          (instance.instance.instanceName || "")
            .toLowerCase()
            .includes(search) ||
          (instance.instance.owner || "").toLowerCase().includes(search)
        );
      });
    },
    connectedCount() {
      return this.instances.filter(i => i.instance.status === 'open').length;
    },
    disconnectedCount() {
      return this.instances.filter(i => i.instance.status !== 'open').length;
    },
    totalLeads() {
      return this.crmStore.getAllLeads.length;
    }
  },
  mounted() {
    this.crmStore.loadFromLocalStorage();
    this.handleQueryParams();
  },
  watch: {
    '$route.query.action': {
      handler(val) {
        if (val === 'add') this.handleQueryParams();
      }
    }
  }
};
</script>

<style scoped>
.home-view {
  min-height: calc(100vh - 64px);
  background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  padding: 0 24px 40px;
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: 40px 0;
  margin-bottom: 24px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: -24px;
  right: -24px;
  bottom: 0;
  overflow: hidden;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.orb-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #a855f7, #d946ef);
  top: -150px;
  left: -50px;
  animation: float 8s ease-in-out infinite;
}

.orb-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  top: -50px;
  right: -30px;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.02); }
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: rgba(37, 211, 102, 0.15);
  border: 1px solid rgba(37, 211, 102, 0.3);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #25D366;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 800;
  margin-bottom: 8px;
}

.gradient-text {
  background: linear-gradient(135deg, #fff 0%, #a855f7 50%, #d946ef 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.action-btn-primary {
  color: #1a1a2e !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  border-radius: 12px;
  padding: 0 24px;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.action-btn-icon {
  color: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
}

/* Stats Overview */
.stats-overview {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.8), rgba(25, 25, 40, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  flex: 1;
  min-width: 130px;
  transition: all 0.3s ease;
}

.mini-stat:hover {
  transform: translateY(-2px);
  border-color: rgba(168, 85, 247, 0.3);
}

.mini-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-stat-icon.primary {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(217, 70, 239, 0.2));
  color: #a855f7;
}

.mini-stat-icon.success {
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.2), rgba(18, 140, 126, 0.2));
  color: #25D366;
}

.mini-stat-icon.warning {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
  color: #fcd34d;
}

.mini-stat-icon.info {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.2));
  color: #7dd3fc;
}

.mini-stat-content {
  display: flex;
  flex-direction: column;
}

.mini-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.mini-stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Filters Section */
.filters-section {
  margin-bottom: 24px;
}

.search-field {
  background: rgba(30, 30, 45, 0.6);
  border-radius: 12px;
}

.status-toggle {
  background: rgba(30, 30, 45, 0.6);
  border-radius: 10px;
}

.toggle-btn {
  text-transform: none;
  font-weight: 500;
}

/* Instances Grid */
.instances-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.instance-card {
  position: relative;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.8), rgba(25, 25, 40, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.instance-card:hover {
  transform: translateY(-4px);
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-status-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.card-status-indicator.open {
  background: linear-gradient(90deg, #25D366, #128C7E);
}

.card-status-indicator.close {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.card-status-indicator.connecting {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.instance-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.instance-avatar.open {
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.2), rgba(18, 140, 126, 0.2));
  color: #25D366;
}

.instance-avatar.close {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  color: #ef4444;
}

.instance-avatar.connecting {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
  color: #fbbf24;
}

.instance-info {
  flex: 1;
  min-width: 0;
}

.status-badge {
  font-weight: 600;
}

.instance-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.instance-owner {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 4px 0 0;
}

.card-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.instance-card:hover .card-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  color: rgba(255, 255, 255, 0.6);
}

.action-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
}

.delete-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.card-footer {
  display: flex;
  gap: 16px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.footer-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.footer-stat .v-icon {
  color: rgba(255, 255, 255, 0.4);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.empty-icon .v-icon {
  color: rgba(255, 255, 255, 0.2);
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.empty-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .home-view {
    padding: 0 16px 32px;
  }

  .hero-title {
    font-size: 1.75rem;
  }

  .stats-overview {
    gap: 12px;
  }

  .mini-stat {
    min-width: calc(50% - 6px);
    padding: 12px 16px;
  }

  .instances-grid {
    grid-template-columns: 1fr;
  }
}
</style>
