<template>
  <div class="crm-view">
    <!-- Hero Header -->
    <div class="crm-hero">
      <div class="hero-background">
        <div class="hero-orb orb-1"></div>
        <div class="hero-orb orb-2"></div>
        <div class="hero-orb orb-3"></div>
      </div>
      
      <div class="hero-content">
        <div class="d-flex align-center justify-space-between flex-wrap gap-4">
          <div>
            <div class="hero-badge mb-2">
              <v-icon size="14" class="mr-1">mdi-rocket-launch</v-icon>
              CRM Premium
            </div>
            <h1 class="hero-title">
              <span class="gradient-text">Pipeline de Vendas</span>
            </h1>
            <p class="hero-subtitle">
              Gerencie leads, acompanhe oportunidades e feche mais negócios
            </p>
          </div>

          <div class="d-flex gap-3">
            <v-btn
              color="white"
              variant="flat"
              class="action-btn-primary"
              @click="openNewLeadModal"
              size="large"
            >
              <v-icon start>mdi-plus</v-icon>
              Novo Lead
            </v-btn>
            <v-btn
              variant="outlined"
              class="action-btn-secondary"
              @click="toggleFilters"
              size="large"
            >
              <v-icon start>mdi-filter-variant</v-icon>
              Filtros
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="crm-navigation">
      <v-tabs v-model="activeTab" class="nav-tabs" color="primary">
        <v-tab value="pipeline">
          <v-icon start>mdi-view-column</v-icon>
          Pipeline
        </v-tab>
        <v-tab value="analytics">
          <v-icon start>mdi-chart-areaspline</v-icon>
          Analytics
        </v-tab>
        <v-tab value="activities">
          <v-icon start>mdi-calendar-check</v-icon>
          Atividades
          <v-chip v-if="pendingActivitiesCount > 0" size="x-small" color="error" class="ml-2">
            {{ pendingActivitiesCount }}
          </v-chip>
        </v-tab>
        <v-tab value="automations">
          <v-icon start>mdi-robot</v-icon>
          Automações
        </v-tab>
        <v-tab value="quick-replies">
          <v-icon start>mdi-flash</v-icon>
          Respostas Rápidas
        </v-tab>
        <v-tab value="campaigns">
          <v-icon start>mdi-bullhorn</v-icon>
          Campanhas
        </v-tab>
      </v-tabs>
    </div>

    <!-- Main Content Area with Chat Sidebar -->
    <div class="crm-main-layout" :class="{ 'chat-open': showChat }">
      <!-- Main Content -->
      <div class="crm-content">
        <!-- Filters Bar (Collapsible) -->
        <v-expand-transition>
          <div v-if="showFilters" class="filters-bar">
            <v-text-field
              v-model="searchQuery"
              placeholder="Buscar leads..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="search-input"
            ></v-text-field>
            
            <v-select
              v-model="filterSource"
              :items="sourceOptions"
              label="Origem"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="filter-select"
            ></v-select>

            <v-select
              v-model="filterPriority"
              :items="priorityOptions"
              label="Prioridade"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="filter-select"
            ></v-select>

            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Ordenar"
              variant="outlined"
              density="compact"
              hide-details
              class="filter-select"
            ></v-select>

            <v-btn variant="text" color="error" size="small" @click="clearFilters">
              <v-icon start size="16">mdi-close</v-icon>
              Limpar
            </v-btn>
          </div>
        </v-expand-transition>

        <!-- Tab Content -->
        <v-window v-model="activeTab" class="tab-content">
          <!-- Pipeline Tab -->
          <v-window-item value="pipeline">
            <!-- Quick Stats -->
            <div class="quick-stats">
              <div class="quick-stat">
                <v-icon size="16" color="primary">mdi-account-group</v-icon>
                <span>{{ totalLeads }} leads</span>
              </div>
              <div class="quick-stat">
                <v-icon size="16" color="success">mdi-currency-usd</v-icon>
                <span>{{ formatCurrency(totalValue) }}</span>
              </div>
              <div class="quick-stat">
                <v-icon size="16" color="warning">mdi-fire</v-icon>
                <span>{{ hotLeadsCount }} quentes</span>
              </div>
              <div class="quick-stat">
                <v-icon size="16" color="info">mdi-percent</v-icon>
                <span>{{ conversionRate }}% conversão</span>
              </div>
            </div>

            <!-- Kanban Board -->
            <KanbanBoard
              :leads="filteredLeads"
              :columns="columns"
              :search="searchQuery"
              @lead-click="openLeadModal"
              @lead-moved="onLeadMoved"
              @add-lead="openNewLeadModalWithStage"
              @open-chat="openChatWithLead"
            />
          </v-window-item>

          <!-- Analytics Tab -->
          <v-window-item value="analytics">
            <AnalyticsDashboard />
          </v-window-item>

          <!-- Activities Tab -->
          <v-window-item value="activities">
            <ActivitiesPanel 
              ref="activitiesPanel"
              @go-to-lead="goToLead" 
            />
          </v-window-item>

          <!-- Automations Tab -->
          <v-window-item value="automations">
            <AutomationsPanel />
          </v-window-item>

          <!-- Quick Replies Tab -->
          <v-window-item value="quick-replies">
            <QuickRepliesPanel />
          </v-window-item>

          <!-- Campaigns Tab -->
          <v-window-item value="campaigns">
            <CampaignsPanel />
          </v-window-item>
        </v-window>
      </div>

      <!-- Chat Sidebar -->
      <Transition name="slide">
        <div v-if="showChat && selectedLeadForChat" class="chat-sidebar">
          <WhatsAppChat
            :lead="selectedLeadForChat"
            :instance="selectedInstance"
            @close="closeChat"
            @message-sent="onMessageSent"
          />
        </div>
      </Transition>
    </div>

    <!-- Lead Modal -->
    <LeadModal
      ref="leadModal"
      :columns="columns"
      @saved="onLeadSaved"
      @deleted="onLeadDeleted"
      @open-chat="openChatWithLead"
    />

    <!-- FAB Menu -->
    <v-speed-dial location="bottom end" class="fab-menu">
      <template v-slot:activator="{ props: activatorProps }">
        <v-fab
          v-bind="activatorProps"
          size="large"
          color="primary"
          icon="mdi-plus"
        ></v-fab>
      </template>

      <v-btn key="lead" icon="mdi-account-plus" size="small" color="primary" @click="openNewLeadModal">
        <v-tooltip activator="parent" location="start">Novo Lead</v-tooltip>
      </v-btn>
      <v-btn key="activity" icon="mdi-calendar-plus" size="small" color="success" @click="openNewActivity">
        <v-tooltip activator="parent" location="start">Nova Atividade</v-tooltip>
      </v-btn>
      <v-btn key="export" icon="mdi-download" size="small" color="info" @click="exportData">
        <v-tooltip activator="parent" location="start">Exportar Dados</v-tooltip>
      </v-btn>
    </v-speed-dial>

    <!-- Instance Selector Dialog -->
    <v-dialog v-model="instanceDialog" max-width="400">
      <v-card class="instance-dialog">
        <v-card-title>Selecionar Instância WhatsApp</v-card-title>
        <v-card-text>
          <v-select
            v-model="selectedInstanceName"
            :items="availableInstances"
            item-title="name"
            item-value="name"
            label="Instância"
            variant="outlined"
            density="comfortable"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="instanceDialog = false">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="confirmInstance">Abrir Chat</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import { useCrmStore } from '@/store/crm'
import { useAppStore } from '@/store/app'
import KanbanBoard from '@/components/crm/KanbanBoard.vue'
import LeadModal from '@/components/crm/LeadModal.vue'
import AnalyticsDashboard from '@/components/crm/AnalyticsDashboard.vue'
import ActivitiesPanel from '@/components/crm/ActivitiesPanel.vue'
import AutomationsPanel from '@/components/crm/AutomationsPanel.vue'
import QuickRepliesPanel from '@/components/crm/QuickRepliesPanel.vue'
import CampaignsPanel from '@/components/crm/CampaignsPanel.vue'
import WhatsAppChat from '@/components/crm/WhatsAppChat.vue'

export default {
  name: 'CRMView',
  components: {
    KanbanBoard,
    LeadModal,
    AnalyticsDashboard,
    ActivitiesPanel,
    AutomationsPanel,
    QuickRepliesPanel,
    CampaignsPanel,
    WhatsAppChat
  },
  setup() {
    const crmStore = useCrmStore()
    const appStore = useAppStore()
    return { crmStore, appStore }
  },
  data: () => ({
    activeTab: 'pipeline',
    showFilters: false,
    showChat: false,
    selectedLeadForChat: null,
    selectedInstance: null,
    selectedInstanceName: null,
    instanceDialog: false,
    pendingChatLead: null,
    searchQuery: '',
    filterSource: null,
    filterPriority: null,
    sortBy: 'recent',
    snackbar: { show: false, text: '', color: 'success' },
    sourceOptions: [
      { title: 'WhatsApp', value: 'whatsapp' },
      { title: 'Website', value: 'website' },
      { title: 'Indicação', value: 'referral' },
      { title: 'Outro', value: 'other' }
    ],
    priorityOptions: [
      { title: 'Alta', value: 'high' },
      { title: 'Média', value: 'medium' },
      { title: 'Normal', value: 'normal' }
    ],
    sortOptions: [
      { title: 'Mais recentes', value: 'recent' },
      { title: 'Maior valor', value: 'value' },
      { title: 'Nome A-Z', value: 'name' },
      { title: 'Score', value: 'score' }
    ]
  }),
  computed: {
    columns() {
      return this.crmStore.columns
    },
    allLeads() {
      return this.crmStore.getAllLeads
    },
    filteredLeads() {
      let leads = [...this.allLeads]
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        leads = leads.filter(l => 
          l.name?.toLowerCase().includes(query) ||
          l.email?.toLowerCase().includes(query) ||
          l.phone?.includes(query)
        )
      }
      
      // Source filter
      if (this.filterSource) {
        leads = leads.filter(l => l.source === this.filterSource)
      }
      
      // Priority filter
      if (this.filterPriority) {
        leads = leads.filter(l => l.priority === this.filterPriority)
      }
      
      // Sort
      switch (this.sortBy) {
        case 'value':
          leads.sort((a, b) => (b.value || 0) - (a.value || 0))
          break
        case 'name':
          leads.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          break
        case 'score':
          leads.sort((a, b) => (b.score || 0) - (a.score || 0))
          break
        default:
          leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }
      
      return leads
    },
    totalLeads() {
      return this.allLeads.length
    },
    totalValue() {
      return this.allLeads.reduce((sum, l) => sum + (l.value || 0), 0)
    },
    hotLeadsCount() {
      return this.allLeads.filter(l => l.priority === 'high' || l.score >= 80).length
    },
    conversionRate() {
      const closed = this.allLeads.filter(l => l.stage === 'fechado').length
      return this.totalLeads > 0 ? Math.round((closed / this.totalLeads) * 100) : 0
    },
    pendingActivitiesCount() {
      const activities = JSON.parse(localStorage.getItem('crm-activities') || '[]')
      const now = new Date()
      return activities.filter(a => !a.completed && new Date(a.dueDate) <= now).length
    },
    availableInstances() {
      return (this.appStore.instances || []).map(i => ({
        name: i.instance?.instanceName,
        instance: i
      }))
    }
  },
  methods: {
    toggleFilters() {
      this.showFilters = !this.showFilters
    },
    clearFilters() {
      this.searchQuery = ''
      this.filterSource = null
      this.filterPriority = null
      this.sortBy = 'recent'
    },
    openNewLeadModal() {
      this.$refs.leadModal.open()
    },
    openNewLeadModalWithStage(stage) {
      this.$refs.leadModal.open(null, stage)
    },
    openLeadModal(lead) {
      this.$refs.leadModal.open(lead)
    },
    onLeadSaved(lead) {
      this.showSnackbar(lead.id ? 'Lead atualizado!' : 'Lead criado com sucesso!')
    },
    onLeadDeleted(lead) {
      this.showSnackbar('Lead excluído')
    },
    onLeadMoved({ lead, newStage }) {
      this.crmStore.updateLead(lead.id, { stage: newStage })
    },
    goToLead(leadId) {
      const lead = this.allLeads.find(l => l.id === leadId)
      if (lead) {
        this.activeTab = 'pipeline'
        this.$nextTick(() => this.openLeadModal(lead))
      }
    },
    openChatWithLead(lead) {
      if (this.availableInstances.length === 0) {
        this.showSnackbar('Nenhuma instância WhatsApp disponível', 'error')
        return
      }
      
      if (this.availableInstances.length === 1) {
        this.selectedInstance = this.availableInstances[0].instance
        this.selectedLeadForChat = lead
        this.showChat = true
      } else {
        this.pendingChatLead = lead
        this.instanceDialog = true
      }
    },
    confirmInstance() {
      const instance = this.availableInstances.find(i => i.name === this.selectedInstanceName)
      if (instance) {
        this.selectedInstance = instance.instance
        this.selectedLeadForChat = this.pendingChatLead
        this.showChat = true
        this.instanceDialog = false
      }
    },
    closeChat() {
      this.showChat = false
      this.selectedLeadForChat = null
    },
    onMessageSent({ leadId, message }) {
      this.crmStore.addNote(leadId, {
        content: `Mensagem enviada: "${message.substring(0, 50)}..."`,
        type: 'message'
      })
    },
    openNewActivity() {
      this.activeTab = 'activities'
      this.$nextTick(() => {
        this.$refs.activitiesPanel?.openAddActivity()
      })
    },
    exportData() {
      const data = {
        leads: this.allLeads,
        columns: this.columns,
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `crm-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      this.showSnackbar('Dados exportados com sucesso!')
    },
    refreshData() {
      this.crmStore.loadFromLocalStorage()
      this.showSnackbar('Dados atualizados')
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value || 0)
    },
    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    },
    handleQueryParams() {
      const { tab, leadId, action, section } = this.$route.query
      
      if (tab) {
        this.activeTab = tab
      } else if (section) {
        const sectionMap = {
          'funnel': 'pipeline',
          'leads': 'pipeline',
          'tasks': 'activities',
          'analytics': 'analytics',
          'automations': 'automations',
          'quick-replies': 'quick-replies',
          'campaigns': 'campaigns'
        }
        if (sectionMap[section]) {
          this.activeTab = sectionMap[section]
        }
      }

      if (leadId) {
        this.activeTab = 'pipeline'
        this.$nextTick(() => {
          const lead = this.allLeads.find(l => l.id === leadId)
          if (lead) this.openLeadModal(lead)
        })
      }

      if (action === 'new-lead') {
        this.activeTab = 'pipeline'
        this.$nextTick(() => this.openNewLeadModal())
      }
    }
  },
  mounted() {
    this.crmStore.loadFromLocalStorage()
    this.handleQueryParams()
  },
  watch: {
    '$route.query': {
      handler() {
        this.handleQueryParams()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.crm-view {
  min-height: 100vh;
  padding: 0 24px 100px;
}

/* Hero */
.crm-hero {
  position: relative;
  padding: 40px 32px;
  margin: 0 -24px 24px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(217, 70, 239, 0.1));
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.orb-1 { width: 300px; height: 300px; background: rgba(168, 85, 247, 0.3); top: -100px; left: -100px; }
.orb-2 { width: 250px; height: 250px; background: rgba(217, 70, 239, 0.3); bottom: -80px; right: 10%; }
.orb-3 { width: 150px; height: 150px; background: rgba(16, 185, 129, 0.2); top: 20%; right: -50px; }

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.3);
  font-size: 0.75rem;
  font-weight: 600;
  color: #a855f7;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
}

.gradient-text {
  background: linear-gradient(135deg, #fff 0%, #a855f7 50%, #d946ef 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 8px;
}

.action-btn-primary {
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
  color: #1a1a2e !important;
}

.action-btn-secondary {
  text-transform: none;
  font-weight: 500;
  border-radius: 12px;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #fff !important;
}

/* Navigation */
.crm-navigation {
  margin-bottom: 24px;
}

.nav-tabs {
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8));
  border-radius: 14px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
  border-radius: 10px;
  min-width: 120px;
}

/* Main Layout */
.crm-main-layout {
  display: flex;
  gap: 24px;
  transition: all 0.3s ease;
}

.crm-content {
  flex: 1;
  min-width: 0;
}

.chat-sidebar {
  width: 400px;
  flex-shrink: 0;
}

/* Filters */
.filters-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  min-width: 140px;
}

/* Quick Stats */
.quick-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.quick-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Tab Content */
.tab-content {
  background: transparent;
}

/* FAB */
.fab-menu {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 100;
}

/* Instance Dialog */
.instance-dialog {
  background: linear-gradient(180deg, rgba(25, 25, 40, 0.98), rgba(20, 20, 35, 0.99)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive */
@media (max-width: 1200px) {
  .chat-sidebar {
    position: fixed;
    top: 64px;
    right: 0;
    bottom: 0;
    z-index: 200;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
  }
}

@media (max-width: 768px) {
  .crm-hero {
    padding: 24px 16px;
  }
  
  .hero-title {
    font-size: 1.6rem;
  }
  
  .filters-bar {
    flex-direction: column;
  }
  
  .search-input,
  .filter-select {
    width: 100%;
  }
  
  .chat-sidebar {
    width: 100%;
  }
}
</style>
