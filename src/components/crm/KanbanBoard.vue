<template>
  <div class="kanban-board-container">
    <!-- Board Header -->
    <div class="board-header mb-4">
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-3">
          <v-btn-toggle v-model="viewMode" mandatory density="comfortable" class="view-toggle">
            <v-btn value="kanban" variant="text">
              <v-icon>mdi-view-column</v-icon>
            </v-btn>
            <v-btn value="table" variant="text">
              <v-icon>mdi-table</v-icon>
            </v-btn>
          </v-btn-toggle>
          
          <v-chip variant="flat" color="primary" size="small">
            <v-icon start size="14">mdi-account-group</v-icon>
            {{ totalLeads }} leads
          </v-chip>
        </div>

        <div class="d-flex align-center gap-2">
          <v-btn 
            variant="tonal" 
            size="small"
            @click="collapseAll = !collapseAll"
            class="action-btn"
          >
            <v-icon start>{{ collapseAll ? 'mdi-expand-all' : 'mdi-collapse-all' }}</v-icon>
            {{ collapseAll ? 'Expandir' : 'Recolher' }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Kanban View -->
    <div v-if="viewMode === 'kanban'" class="kanban-scroll-area">
      <div class="kanban-board">
        <KanbanColumn
          v-for="column in columns"
          :key="column.id"
          :column="column"
          :leads="getLeadsByStage(column.id)"
          :total-leads-count="totalLeads"
          :collapsed="collapseAll"
          @drop="handleDrop"
          @lead-click="openLeadModal"
          @add-lead="addLeadToStage"
        />
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="table-view">
      <v-card class="table-card" variant="flat">
        <v-data-table
          :headers="tableHeaders"
          :items="allLeads"
          :items-per-page="10"
          class="leads-table"
          hover
        >
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center gap-3">
              <v-avatar :color="getAvatarColor(item.name)" size="36">
                <span class="text-white text-caption font-weight-bold">{{ getInitials(item.name) }}</span>
              </v-avatar>
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.phone }}</div>
              </div>
            </div>
          </template>

          <template v-slot:item.stage="{ item }">
            <v-chip 
              :color="getStageColor(item.stage)" 
              size="small" 
              variant="flat"
            >
              {{ getStageName(item.stage) }}
            </v-chip>
          </template>

          <template v-slot:item.value="{ item }">
            <span class="font-weight-medium text-success">
              {{ formatCurrency(item.value) }}
            </span>
          </template>

          <template v-slot:item.priority="{ item }">
            <v-chip 
              :color="getPriorityColor(item.priority)" 
              size="x-small" 
              variant="tonal"
            >
              {{ getPriorityLabel(item.priority) }}
            </v-chip>
          </template>

          <template v-slot:item.score="{ item }">
            <v-progress-circular
              :model-value="item.score || 0"
              :size="32"
              :width="3"
              :color="getScoreColor(item.score)"
            >
              <span class="text-caption">{{ item.score || '-' }}</span>
            </v-progress-circular>
          </template>

          <template v-slot:item.updatedAt="{ item }">
            <span class="text-caption text-medium-emphasis">
              {{ formatDate(item.updatedAt) }}
            </span>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn 
              icon 
              size="small" 
              variant="text"
              @click="openLeadModal(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn 
              icon 
              size="small" 
              variant="text"
              :href="`https://wa.me/${cleanPhone(item.phone)}`"
              target="_blank"
            >
              <v-icon color="success">mdi-whatsapp</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>

<script>
import { useCrmStore } from '@/store/crm'
import KanbanColumn from './KanbanColumn.vue'

export default {
  name: 'KanbanBoard',
  components: {
    KanbanColumn
  },
  setup() {
    const crmStore = useCrmStore()
    return { crmStore }
  },
  data: () => ({
    viewMode: 'kanban',
    collapseAll: false,
    tableHeaders: [
      { title: 'Lead', key: 'name', sortable: true },
      { title: 'Estágio', key: 'stage', sortable: true },
      { title: 'Valor', key: 'value', sortable: true },
      { title: 'Prioridade', key: 'priority', sortable: true },
      { title: 'Score', key: 'score', sortable: true },
      { title: 'Atualizado', key: 'updatedAt', sortable: true },
      { title: 'Ações', key: 'actions', sortable: false, align: 'end' }
    ]
  }),
  computed: {
    columns() {
      return this.crmStore.columns
    },
    allLeads() {
      return this.crmStore.getAllLeads
    },
    totalLeads() {
      return this.allLeads.length
    }
  },
  methods: {
    getLeadsByStage(stageId) {
      return this.crmStore.getLeadsByStage(stageId)
    },
    handleDrop({ leadId, targetStage }) {
      this.crmStore.moveLead(leadId, targetStage)
    },
    openLeadModal(lead) {
      this.$emit('lead-click', lead)
    },
    addLeadToStage(stageId) {
      this.$emit('add-lead', stageId)
    },
    getInitials(name) {
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    },
    getAvatarColor(name) {
      const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe']
      return colors[name.charCodeAt(0) % colors.length]
    },
    getStageName(stageId) {
      const stage = this.columns.find(c => c.id === stageId)
      return stage ? stage.name : stageId
    },
    getStageColor(stageId) {
      const colors = {
        novo: 'blue',
        contato: 'purple',
        proposta: 'orange',
        negociacao: 'amber',
        fechado: 'success'
      }
      return colors[stageId] || 'grey'
    },
    getPriorityColor(priority) {
      const colors = { high: 'error', medium: 'warning', normal: 'success' }
      return colors[priority] || 'grey'
    },
    getPriorityLabel(priority) {
      const labels = { high: 'Alta', medium: 'Média', normal: 'Normal' }
      return labels[priority] || priority
    },
    getScoreColor(score) {
      if (!score) return 'grey'
      if (score >= 80) return 'success'
      if (score >= 50) return 'warning'
      return 'error'
    },
    cleanPhone(phone) {
      return phone.replace(/\D/g, '')
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0
      }).format(value || 0)
    },
    formatDate(date) {
      if (!date) return '-'
      const d = new Date(date)
      const now = new Date()
      const diff = now - d
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      
      if (hours < 1) return 'Agora'
      if (hours < 24) return `${hours}h atrás`
      if (days < 7) return `${days}d atrás`
      return d.toLocaleDateString('pt-BR')
    }
  }
}
</script>

<style scoped>
.kanban-board-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Board Header */
.board-header {
  flex-shrink: 0;
}

.view-toggle {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.view-toggle .v-btn {
  color: rgba(255, 255, 255, 0.5);
}

.view-toggle .v-btn--active {
  color: #fff;
  background: rgba(102, 126, 234, 0.3);
}

.action-btn {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

/* Kanban Scroll Area */
.kanban-scroll-area {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 16px;
}

.kanban-scroll-area::-webkit-scrollbar {
  height: 10px;
}

.kanban-scroll-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 5px;
}

.kanban-scroll-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.kanban-scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Kanban Board */
.kanban-board {
  display: flex;
  gap: 24px;
  min-height: 500px;
  height: 100%;
  padding: 8px;
}

/* Table View */
.table-view {
  flex: 1;
  overflow: hidden;
}

.table-card {
  background: rgba(30, 30, 45, 0.6);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.leads-table {
  background: transparent;
}

.leads-table :deep(th) {
  background: rgba(255, 255, 255, 0.03) !important;
  color: rgba(255, 255, 255, 0.7) !important;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.leads-table :deep(td) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.04) !important;
}

.leads-table :deep(tr:hover td) {
  background: rgba(102, 126, 234, 0.05) !important;
}

/* Responsive */
@media (max-width: 768px) {
  .kanban-board {
    gap: 16px;
  }
}
</style>
