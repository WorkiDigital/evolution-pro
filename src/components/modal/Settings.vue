<template>
  <v-dialog
    v-model="dialog"
    max-width="600px"
    :persistent="!AppStore.validConnection"
  >
    <!-- Server Connection Card -->
    <v-card class="premium-card">
      <v-card-text>
        <div class="d-flex align-center mb-6">
          <v-icon color="primary" size="28" class="mr-3">mdi-server-network</v-icon>
          <h2 class="text-h5 font-weight-bold">{{ $t("connection.title") }}</h2>
        </div>
        
        <v-form v-model="valid">
          <v-text-field
            v-model="connection.host"
            label="EVOLUTION_API_URL"
            placeholder="https://sua-api.com"
            required
            variant="outlined"
            density="comfortable"
            :rules="hostRules"
            class="premium-input mb-2"
          />
          <v-text-field
            v-model="connection.globalApiKey"
            label="EVOLUTION_API_KEY"
            placeholder="Sua Global API Key"
            required
            variant="outlined"
            density="comfortable"
            :type="revelPassword ? 'text' : 'password'"
            :append-inner-icon="revelPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="revelPassword = !revelPassword"
            class="premium-input"
          />
        </v-form>

        <v-alert type="error" v-if="error" variant="tonal" class="mt-4">
          {{ Array.isArray(error) ? error.join(", ") : error }}
        </v-alert>
      </v-card-text>
      <v-card-actions class="pa-4 bg-black-o-5">
        <v-btn size="small" variant="text" @click="showAbout">
          Nexus v2.3.7
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!!AppStore.connection.host"
          variant="tonal"
          color="error"
          @click="logout"
          :disabled="loading"
          class="mr-2"
        >
          <v-icon start>mdi-logout</v-icon> Sair
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="save()"
          :disabled="!valid"
          :loading="loading"
        >
          {{ $t("connection.action") }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Instance Creation Card (The New Hero Feature) -->
    <v-card class="premium-card mt-4" v-if="AppStore.validConnection">
      <v-card-text>
        <div class="d-flex align-center mb-6">
          <v-icon color="success" size="28" class="mr-3">mdi-whatsapp</v-icon>
          <h2 class="text-h5 font-weight-bold">Criar & Conectar Instância</h2>
        </div>

        <div v-if="!qrCode && !creating" class="instance-setup-form">
          <p class="text-body-2 text-grey-darken-1 mb-4">
            Gere uma nova instância WhatsApp instantaneamente. O QR Code aparecerá abaixo para ser escaneado.
          </p>
          <v-text-field
            v-model="newInstanceName"
            label="Nome da Instância"
            placeholder="ex: vendas-paints"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-label-outline"
            class="premium-input mb-4"
            hide-details
          />
          <v-btn
            block
            color="success"
            size="large"
            variant="flat"
            class="create-btn"
            @click="handleCreateInstance"
            :disabled="!newInstanceName"
          >
            <v-icon start>mdi-plus-circle</v-icon>
            Gerar Nova Instância
          </v-btn>
        </div>

        <div v-else-if="creating" class="text-center py-10">
          <v-progress-circular indeterminate color="primary" size="64" width="6"></v-progress-circular>
          <p class="mt-4 font-weight-medium">Configurando ambiente Evolution...</p>
        </div>

        <div v-else-if="qrCode" class="text-center py-4">
          <v-alert type="success" variant="tonal" size="small" class="mb-4 text-left">
            Instância <strong>{{ lastCreatedName }}</strong> pronta! <br/>
            Escaneie o QR Code abaixo com seu WhatsApp.
          </v-alert>
          
          <div class="qr-container-settings">
            <img :src="qrCode" alt="WhatsApp QR Code" />
          </div>

          <v-btn variant="text" color="primary" @click="qrCode = null" class="mt-4">
            Criar Outra
          </v-btn>
          <v-btn variant="flat" color="success" @click="dialog = false" class="mt-4 ml-2">
            Finalizar
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Saved Connections List -->
    <v-card class="premium-card mt-4" v-if="connectionsList && connectionsList.length > 1">
      <v-card-text>
        <h3 class="text-subtitle-1 font-weight-bold mb-4">Conexões Salvas</h3>
        <v-list class="bg-transparent pa-0">
          <v-list-item
            v-for="conect in connectionsList"
            :key="conect.host"
            :disabled="loading || (conect.host === AppStore.connection.host && AppStore.validConnection)"
            class="connection-item mb-2"
            @click="save(conect)"
          >
            <template v-slot:prepend>
              <v-icon :color="conect.host === AppStore.connection.host ? 'success' : 'grey'">mdi-database</v-icon>
            </template>
            <v-list-item-title class="font-weight-medium">{{ conect.host.replace(/https?:\/\//, "") }}</v-list-item-title>
            <template v-slot:append>
              <v-btn @click.stop="removeConnection(conect)" icon size="x-small" variant="text" color="grey">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
  <about-modal ref="about" />
</template>

<script>
import { useAppStore } from "@/store/app";
import AboutModal from "./About.vue";

export default {
  components: { AboutModal },
  name: "SettingsModal",
  data: () => ({
    dialog: false,
    valid: false,
    revelPassword: false,
    connection: {
      host: "",
      globalApiKey: "",
    },
    loading: false,
    creating: false,
    error: false,
    AppStore: useAppStore(),
    isHttps: window.location.protocol === "https:",
    
    // Instance creation
    newInstanceName: '',
    qrCode: null,
    lastCreatedName: ''
  }),
  methods: {
    logout() {
      this.AppStore.logout();
      this.connection = { host: "", globalApiKey: "" };
    },
    showAbout() {
      this.$refs.about.open();
    },
    removeConnection(connection) {
      this.AppStore.removeConnection(connection);
    },
    async save(connection) {
      try {
        this.loading = true;
        this.error = false;
        await this.AppStore.setConnection(connection || this.connection);
        // We don't close the dialog automatically if successful, 
        // allowing user to see instance creation or connection status
      } catch (e) {
        this.error = e.message?.message || e.message || e;
      } finally {
        this.loading = false;
      }
    },
    async handleCreateInstance() {
      if (!this.newInstanceName) return;
      this.creating = true;
      this.error = false;
      this.qrCode = null;
      try {
        const result = await this.AppStore.generateLeadInstance(this.newInstanceName);
        this.lastCreatedName = this.newInstanceName;
        if (result.connection && result.connection.code) {
          this.qrCode = result.connection.code;
        } else if (result.connection && result.connection.base64) {
          this.qrCode = result.connection.base64;
        }
        this.newInstanceName = '';
      } catch (e) {
        this.error = "Erro ao criar instância: " + (e.message || e);
      } finally {
        this.creating = false;
      }
    },
    open() {
      this.dialog = true;
      this.connection = Object.assign({}, this.AppStore.connection);
    },
  },
  computed: {
    connectionsList() {
      return this.AppStore.connectionsList;
    },
    hostRules() {
      return [
        (v) => !!v || 'URL é obrigatória',
        (v) => /^https?:\/\//i.test(v) || 'URL deve começar com http:// ou https://',
      ];
    },
  },
  emits: ["close"],
};
</script>

<style scoped>
.premium-card {
  background: linear-gradient(180deg, rgba(23, 23, 35, 0.98), rgba(18, 18, 30, 0.99)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 20px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4) !important;
  overflow: hidden;
}

.premium-input :deep(.v-field) {
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.03) !important;
}

.bg-black-o-5 {
  background: rgba(0, 0, 0, 0.2);
}

.create-btn {
  height: 52px;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
}

.qr-container-settings {
  background: white;
  padding: 12px;
  border-radius: 16px;
  display: inline-block;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  margin: 10px 0;
}

.qr-container-settings img {
  display: block;
  max-width: 200px;
  height: auto;
}

.connection-item {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.connection-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
