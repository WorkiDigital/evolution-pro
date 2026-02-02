<template>
  <div class="instance-header">
    <div class="header-background">
      <div class="header-orb orb-1"></div>
      <div class="header-orb orb-2"></div>
    </div>

    <div class="header-content">
      <div class="d-flex align-center gap-4 flex-wrap">
        <!-- Avatar -->
        <div class="instance-avatar" :class="instance.instance.status">
          <v-icon
            v-if="
              (instance.instance.status != 'open' ||
                instance.instance.profilePictureUrl == null) &&
              statusMapper[instance.instance.status].icon
            "
            size="48"
          >
            {{ statusMapper[instance.instance.status].icon }}
          </v-icon>
          <v-img v-else :src="instance.instance.profilePictureUrl" cover />
          <div class="status-indicator" :class="instance.instance.status"></div>
        </div>

        <!-- Instance Info -->
        <div class="instance-info">
          <div class="status-row">
            <v-chip
              :color="statusMapper[instance.instance.status].color"
              size="x-small"
              variant="flat"
              class="status-chip"
            >
              <v-icon start size="10">{{ statusMapper[instance.instance.status].icon }}</v-icon>
              {{ $t(`status.${instance.instance.status}`) }}
            </v-chip>
            
            <v-chip
              v-if="instance?.instance?.apikey"
              color="info"
              size="x-small"
              variant="tonal"
              @click="copyApikey"
              class="apikey-chip"
            >
              <v-icon start size="12">mdi-key</v-icon>
              {{
                (instance.instance?.apikey || "").slice(
                  0,
                  apikeyReveled ? undefined : 7
                )
              }}{{ apikeyReveled ? "" : "..." }}
              <v-btn
                icon
                @click.stop="toggleReveled"
                density="comfortable"
                class="ml-1"
                variant="text"
                size="x-small"
              >
                <v-icon size="12">
                  {{ apikeyReveled ? "mdi-eye-off" : "mdi-eye" }}
                </v-icon>
              </v-btn>
              <v-icon size="12" class="ml-1">
                {{ copied ? "mdi-check" : "mdi-content-copy" }}
              </v-icon>
            </v-chip>
          </div>
          
          <h2 class="instance-name">
            {{ instance.instance.instanceName }}
          </h2>
          
          <div class="instance-meta">
            <span class="owner-text" v-if="owner">
              <v-icon size="14" class="mr-1">mdi-phone</v-icon>
              {{ formatPhone(owner) }}
            </span>
            <span class="status-text" v-if="instance.instance.profileStatus">
              <v-icon size="14" class="mr-1">mdi-message-text</v-icon>
              {{ instance.instance.profileStatus }}
            </span>
          </div>
        </div>

        <v-spacer></v-spacer>

        <!-- Actions -->
        <div class="header-actions">
          <v-btn
            @click="refresh"
            :disabled="disconnect.loading || restart.loading || restart.success || reload"
            :loading="reload"
            variant="text"
            class="action-btn"
            icon
          >
            <v-icon>mdi-refresh</v-icon>
            <v-tooltip activator="parent" location="bottom">Atualizar</v-tooltip>
          </v-btn>
          
          <v-btn
            @click="restartInstance"
            :disabled="disconnect.loading || restart.success || reload"
            :loading="restart.loading"
            variant="tonal"
            color="primary"
            class="action-btn-labeled"
          >
            <v-icon start>mdi-restart</v-icon>
            {{ restart.success ? `${$t("restarted")}` : `${$t("restart")}` }}
          </v-btn>
          
          <v-btn
            @click="disconnectInstance"
            :disabled="instance.instance.status === 'close' || restart.loading || reload"
            :loading="disconnect.loading"
            variant="tonal"
            color="error"
            class="action-btn-labeled"
          >
            <v-icon start>mdi-cellphone-nfc-off</v-icon>
            {{ disconnect.confirm ? `${$t("sure")}` : `${$t("disconnect")}` }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppStore } from "@/store/app";
import statusMapper from "@/helpers/mappers/status";
import copyToClipboard from "@/helpers/copyToClipboard";
import instanceController from "@/services/instanceController";

export default {
  name: "InstanceHeader",
  data: () => ({
    disconnect: { confirm: false, loading: false },
    restart: { loading: false, success: false },
    reload: false,
    copied: false,
    apikeyReveled: false,
    statusMapper: statusMapper,
    AppStore: useAppStore(),
  }),
  methods: {
    copyApikey() {
      if (this.copied) return;
      copyToClipboard(this.instance.instance.apikey);
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 5000);
    },
    async refresh() {
      try {
        this.reload = true;
        await this.AppStore.reconnect();
      } catch (e) {
        console.log(e);
        alert(e.message || e.error || "Erro desconhecido");
      } finally {
        this.reload = false;
      }
    },
    async restartInstance() {
      this.restart.loading = true;
      try {
        await instanceController.restart(this.instance.instance.instanceName);
        this.restart.success = true;

        setTimeout(() => {
          this.restart.success = false;
        }, 5000);
      } catch (e) {
        console.log(e);
        alert(e.message || e.error || "Erro desconhecido");
      } finally {
        this.restart.loading = false;
      }
    },
    async disconnectInstance() {
      if (!this.disconnect.confirm) return (this.disconnect.confirm = true);

      this.disconnect.loading = true;
      try {
        this.disconnect.confirm = false;
        await instanceController.logout(this.instance.instance.instanceName);
        await this.AppStore.reconnect();
      } catch (e) {
        console.log(e);
        alert(e.message || e.error || "Erro desconhecido");
      } finally {
        this.disconnect.loading = false;
      }
    },
    toggleReveled() {
      this.apikeyReveled = !this.apikeyReveled;
    },
    formatPhone(phone) {
      if (!phone) return '';
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  },
  computed: {
    owner() {
      if (!this.instance?.instance?.owner) return null;
      return (this.instance?.instance?.owner || "").split("@")[0];
    },
  },
  props: {
    instance: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>
.instance-header {
  position: relative;
  padding: 32px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.8), rgba(25, 25, 40, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Background Orbs */
.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.header-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.3;
}

.orb-1 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  top: -100px;
  left: -50px;
}

.orb-2 {
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #25D366, #128C7E);
  bottom: -50px;
  right: -30px;
}

.header-content {
  position: relative;
  z-index: 1;
}

/* Instance Avatar */
.instance-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.instance-avatar.open {
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.2), rgba(18, 140, 126, 0.2));
  color: #25D366;
  border: 2px solid rgba(37, 211, 102, 0.3);
}

.instance-avatar.close {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2));
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.3);
}

.instance-avatar.connecting {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
  color: #fbbf24;
  border: 2px solid rgba(251, 191, 36, 0.3);
}

.status-indicator {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(30, 30, 45, 0.9);
}

.status-indicator.open {
  background: linear-gradient(135deg, #25D366, #128C7E);
  box-shadow: 0 0 10px rgba(37, 211, 102, 0.5);
}

.status-indicator.close {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.status-indicator.connecting {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(0.9); }
}

/* Instance Info */
.instance-info {
  flex: 1;
  min-width: 0;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.status-chip {
  font-weight: 600;
}

.apikey-chip {
  cursor: pointer;
}

.instance-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
  line-height: 1.2;
}

.instance-meta {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.owner-text,
.status-text {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
}

.owner-text .v-icon,
.status-text .v-icon {
  color: rgba(255, 255, 255, 0.4);
}

/* Actions */
.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.action-btn {
  color: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
}

.action-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.action-btn-labeled {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0.2px;
  border-radius: 12px;
  padding: 0 20px;
}

/* Responsive */
@media (max-width: 768px) {
  .instance-header {
    padding: 20px;
  }

  .instance-avatar {
    width: 64px;
    height: 64px;
    border-radius: 14px;
  }

  .instance-name {
    font-size: 1.25rem;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
    margin-top: 16px;
  }

  .action-btn-labeled {
    flex: 1;
  }
}
</style>
