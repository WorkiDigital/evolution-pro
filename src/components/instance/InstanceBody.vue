<template>
  <div class="instance-body">
    <!-- Premium Tabs -->
    <v-tabs v-model="tab" class="premium-tabs" color="primary" grow>
      <v-tab v-for="t in tabs" :key="t.id" :value="t.id" class="tab-item">
        <div class="tab-content">
          <div class="tab-icon" :class="{ active: tab === t.id }">
            <v-icon size="20">{{ t.icon }}</v-icon>
          </div>
          <span class="tab-label">{{ $t(`instanceTabs.${t.id}`) }}</span>
          <v-chip 
            v-if="t.id === 'crm' && crmLeadCount > 0" 
            size="x-small" 
            class="tab-badge"
          >
            {{ crmLeadCount }}
          </v-chip>
        </div>
      </v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-window v-model="tab" class="tab-window">
      <v-window-item v-for="t in tabs" :key="t.id" :value="t.id">
        <div class="tab-panel">
          <component
            v-for="component in t.components"
            :key="component"
            :is="component"
            :instance="instance"
          />
        </div>
      </v-window-item>
    </v-window>
  </div>
</template>

<script>
import { useCrmStore } from '@/store/crm';

import Options from "./settings/Options.vue";
import Webhook from "./settings/Webhook.vue";
import Websocket from "./settings/Websocket.vue";
import Rabbitmq from "./settings/Rabbitmq.vue";
import Chatwoot from "./settings/Chatwoot.vue";
import Typebot from "./settings/Typebot.vue";

import OpenSendMessage from "./message/OpenSendMessage.vue";
import MyGroups from "./message/MyGroups.vue";
import MyChats from "./message/MyChats.vue";
import MyContacts from "./message/MyContacts.vue";
import HasWhatsapp from "./message/HasWhatsapp.vue";

import ConnectionAlert from "./profile/ConnectionAlert.vue";
import BasicInfo from "./profile/BasicInfo.vue";
import Privacy from "./profile/Privacy.vue";
import ProfilePhoto from "./profile/ProfilePhoto.vue";

import InstanceCRM from "./crm/InstanceCRM.vue";

export default {
  components: {
    Options,
    Webhook,
    Websocket,
    Rabbitmq,
    Chatwoot,
    Typebot,
    OpenSendMessage,
    MyGroups,
    MyChats,
    HasWhatsapp,
    MyContacts,
    ConnectionAlert,
    BasicInfo,
    Privacy,
    ProfilePhoto,
    InstanceCRM,
  },
  setup() {
    const crmStore = useCrmStore();
    return { crmStore };
  },
  data: () => ({
    tab: "settings",
    tabs: [
      {
        id: "settings",
        icon: "mdi-cog",
        components: [
          "Options",
          "Webhook",
          "Websocket",
          "Rabbitmq",
          "Chatwoot",
          "Typebot",
        ],
      },
      {
        id: "message",
        icon: "mdi-message-text",
        components: [
          "OpenSendMessage",
          "HasWhatsapp",
          "MyContacts",
          "MyGroups",
          "MyChats",
        ],
      },
      {
        id: "crm",
        icon: "mdi-view-dashboard",
        components: [
          "InstanceCRM",
        ],
      },
      {
        id: "profile",
        icon: "mdi-account-circle",
        components: [
          "ConnectionAlert",
          "BasicInfo",
          "ProfilePhoto",
          "Privacy",
        ],
      },
    ],
  }),
  props: {
    instance: {
      type: Object,
      required: true,
    },
  },
  computed: {
    crmLeadCount() {
      if (!this.instance?.instance?.instanceName) return 0;
      return this.crmStore.getLeadsByInstance(this.instance.instance.instanceName).length;
    }
  },
  watch: {
    '$route.query.tab': {
      immediate: true,
      handler(tabQuery) {
        if (tabQuery && this.tabs.some(t => t.id === tabQuery)) {
          this.tab = tabQuery;
        }
      }
    }
  },
  mounted() {
    this.crmStore.loadFromLocalStorage();
  }
};
</script>

<style scoped>
.instance-body {
  background: transparent;
}

/* Premium Tabs */
.premium-tabs {
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8));
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.tab-item {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  padding: 0 16px;
  min-width: auto;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.tab-item:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.03);
}

.tab-item.v-tab--selected {
  color: #fff;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.15));
}

.tab-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tab-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.tab-icon.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.tab-label {
  font-size: 0.9rem;
}

.tab-badge {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
  color: #fff !important;
  font-weight: 600;
}

/* Tab Window */
.tab-window {
  background: transparent;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Deep styles for child components */
.tab-panel :deep(.v-card) {
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8)) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-radius: 16px !important;
}

.tab-panel :deep(.v-card-title) {
  font-weight: 600;
  color: #fff;
}

.tab-panel :deep(.v-card-text) {
  color: rgba(255, 255, 255, 0.7);
}

.tab-panel :deep(.v-expansion-panel) {
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8)) !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  margin-bottom: 8px !important;
  border-radius: 12px !important;
}

.tab-panel :deep(.v-expansion-panel-title) {
  font-weight: 500;
  color: #fff;
}

.tab-panel :deep(.v-text-field .v-field) {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.tab-panel :deep(.v-select .v-field) {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

/* Responsive */
@media (max-width: 768px) {
  .premium-tabs {
    padding: 6px;
  }

  .tab-item {
    padding: 0 12px;
  }

  .tab-label {
    display: none;
  }

  .tab-icon {
    width: 32px;
    height: 32px;
  }
}
</style>
