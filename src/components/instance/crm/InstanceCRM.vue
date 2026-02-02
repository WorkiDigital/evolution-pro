<template>
  <div class="instance-crm">
    <!-- Header Section -->
    <div class="crm-header">
      <div class="header-glow"></div>
      <div class="header-content">
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div class="d-flex align-center">
            <div class="header-icon">
              <v-icon size="24" color="white">mdi-view-dashboard</v-icon>
            </div>
            <div class="ml-4">
              <h3 class="header-title">
                CRM - {{ instance.instance.instanceName }}
              </h3>
              <p class="header-subtitle">
                Gerencie leads e conversas desta instância
              </p>
            </div>
          </div>

          <div class="d-flex gap-2">
            <v-btn
              color="white"
              variant="flat"
              class="action-btn-primary"
              @click="openNewLeadModal"
              size="small"
            >
              <v-icon start>mdi-plus</v-icon>
              Novo Lead
            </v-btn>
            <v-btn
              variant="outlined"
              class="action-btn-secondary"
              @click="openImportDialog"
              size="small"
            >
              <v-icon start>mdi-account-multiple-plus</v-icon>
              Importar Contatos
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="mini-stat">
        <div class="mini-stat-icon primary">
          <v-icon size="18">mdi-account-group</v-icon>
        </div>
        <div class="mini-stat-content">
          <span class="mini-stat-value">{{ instanceLeads.length }}</span>
          <span class="mini-stat-label">Leads</span>
        </div>
      </div>

      <div class="mini-stat">
        <div class="mini-stat-icon success">
          <v-icon size="18">mdi-currency-usd</v-icon>
        </div>
        <div class="mini-stat-content">
          <span class="mini-stat-value">{{ formatCurrency(totalValue) }}</span>
          <span class="mini-stat-label">Pipeline</span>
        </div>
      </div>

      <div class="mini-stat">
        <div class="mini-stat-icon warning">
          <v-icon size="18">mdi-fire</v-icon>
        </div>
        <div class="mini-stat-content">
          <span class="mini-stat-value">{{ hotLeadsCount }}</span>
          <span class="mini-stat-label">Hot Leads</span>
        </div>
      </div>

      <div class="mini-stat">
        <div class="mini-stat-icon info">
          <v-icon size="18">mdi-check-circle</v-icon>
        </div>
        <div class="mini-stat-content">
          <span class="mini-stat-value">{{ closedDealsCount }}</span>
          <span class="mini-stat-label">Fechados</span>
        </div>
      </div>
    </div>

    <!-- Kanban Board -->
    <v-card class="kanban-container" elevation="0" variant="flat">
      <div class="kanban-board-wrapper">
        <div class="kanban-board">
          <div class="board-container">
            <KanbanColumn
              v-for="column in columns"
              :key="column.id"
              :column="column"
              :leads="getLeadsByStage(column.id)"
              :total-leads-count="instanceLeads.length"
              @drop="handleDrop"
              @lead-click="openEditLeadModal"
              @add-lead="openNewLeadForStage"
            />
          </div>
        </div>
      </div>
    </v-card>

    <!-- Modals -->
    <LeadModal 
      ref="leadModal" 
      @saved="onLeadSaved" 
      :instance-id="instance.instance.instanceName" 
    />
    
    <ContactImportDialog 
      ref="importDialog" 
      :instance="instance"
      @imported="onContactsImported"
    />

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbar.icon }}</v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script>
import { useCrmStore } from '@/store/crm'
import KanbanColumn from '@/components/crm/KanbanColumn.vue'
import LeadModal from '@/components/crm/LeadModal.vue'
import ContactImportDialog from './ContactImportDialog.vue'

export default {
  name: 'InstanceCRM',
  components: {
    KanbanColumn,
    LeadModal,
    ContactImportDialog
  },
  props: {
    instance: {
      type: Object,
      required: true
    }
  },
  setup() {
    const crmStore = useCrmStore()
    return { crmStore }
  },
  data: () => ({
    snackbar: {
      show: false,
      text: '',
      color: 'success',
      icon: 'mdi-check-circle'
    }
  }),
  computed: {
    columns() {
      return this.crmStore.columns
    },
    instanceLeads() {
      return this.crmStore.getLeadsByInstance(this.instance.instance.instanceName)
    },
    totalValue() {
      return this.instanceLeads.reduce((sum, lead) => sum + (lead.value || 0), 0)
    },
    hotLeadsCount() {
      return this.instanceLeads.filter(l => l.priority === 'high').length
    },
    closedDealsCount() {
      return this.instanceLeads.filter(l => l.stage === 'fechado').length
    }
  },
  methods: {
    getLeadsByStage(stageId) {
      return this.crmStore.getLeadsByInstanceAndStage(
        this.instance.instance.instanceName,
        stageId
      )
    },
    handleDrop({ leadId, targetStage }) {
      this.crmStore.moveLead(leadId, targetStage)
      this.showSnackbar('Lead movido com sucesso!', 'success', 'mdi-check-circle')
    },
    openNewLeadModal() {
      this.$refs.leadModal.open(null, this.instance.instance.instanceName)
    },
    openNewLeadForStage(stageId) {
      this.$refs.leadModal.open(null, this.instance.instance.instanceName, stageId)
    },
    openEditLeadModal(lead) {
      this.$refs.leadModal.open(lead)
    },
    openImportDialog() {
      this.$refs.importDialog.open()
    },
    onLeadSaved() {
      this.showSnackbar('Lead salvo com sucesso!', 'success', 'mdi-check-circle')
    },
    onContactsImported(results) {
      let message = `${results.success} contato(s) importado(s)!`
      if (results.alreadyExists > 0) {
        message += ` (${results.alreadyExists} já existia(m))`
      }
      this.showSnackbar(message, 'success', 'mdi-account-multiple-check')
    },
    showSnackbar(text, color, icon) {
      this.snackbar = { show: true, text, color, icon }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    }
  },
  mounted() {
    this.crmStore.loadFromLocalStorage()
  }
}
</script>

<style scoped>
.instance-crm {
  padding: 0;
}

/* Header Section */
.crm-header {
  position: relative;
  padding: 24px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1));
  border-radius: 20px;
  overflow: hidden;
}

.header-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.3), transparent);
  filter: blur(60px);
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.header-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.action-btn-primary {
  color: #1a1a2e !important;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.3px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.action-btn-secondary {
  color: rgba(255, 255, 255, 0.8) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  font-weight: 500;
  text-transform: none;
  border-radius: 10px;
}

/* Stats Row */
.stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
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
  min-width: 140px;
  transition: all 0.3s ease;
}

.mini-stat:hover {
  transform: translateY(-2px);
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  color: #a5b4fc;
}

.mini-stat-icon.success {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.2));
  color: #6ee7b7;
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

/* Kanban Container */
.kanban-container {
  background: transparent;
  max-height: calc(100vh - 450px);
  overflow: hidden;
}

.kanban-board-wrapper {
  height: 100%;
  overflow: hidden;
}

.kanban-board {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px;
}

.kanban-board::-webkit-scrollbar {
  height: 8px;
}

.kanban-board::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.kanban-board::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.kanban-board::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

.board-container {
  display: flex;
  gap: 20px;
  height: 100%;
  min-height: 400px;
}

/* Responsive */
@media (max-width: 768px) {
  .crm-header {
    padding: 16px;
  }

  .header-title {
    font-size: 1.1rem;
  }

  .stats-row {
    gap: 12px;
  }

  .mini-stat {
    min-width: calc(50% - 6px);
    padding: 12px 16px;
  }

  .mini-stat-value {
    font-size: 1.1rem;
  }

  .board-container {
    gap: 14px;
    min-height: 350px;
  }
}
</style>
