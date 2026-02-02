<template>
  <div class="kanban-column" :class="{ 'drag-over': isDragOver }">
    <!-- Column Header -->
    <div class="column-header">
      <div class="header-gradient" :style="{ background: getHeaderGradient() }"></div>
      <div class="header-content">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <div class="column-icon" :style="{ background: getHeaderGradient() }">
              <v-icon size="18" color="white">{{ getColumnIcon() }}</v-icon>
            </div>
            <div class="ml-3">
              <h3 class="column-title">{{ column.name }}</h3>
              <div class="column-subtitle">{{ leads.length }} {{ leads.length === 1 ? 'lead' : 'leads' }}</div>
            </div>
          </div>
          
          <div class="d-flex align-center gap-2">
            <div class="column-value" v-if="totalValue > 0">
              {{ formatCurrency(totalValue) }}
            </div>
            <v-chip 
              size="small" 
              variant="flat" 
              :color="getChipColor()"
              class="count-chip"
            >
              {{ leads.length }}
            </v-chip>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="column-progress mt-3">
          <v-progress-linear
            :model-value="getProgress()"
            :color="column.color"
            height="4"
            rounded
            class="progress-bar"
          ></v-progress-linear>
        </div>
      </div>
    </div>

    <!-- Column Content -->
    <div
      class="column-content"
      @dragover.prevent="onDragOver"
      @drop="onDrop"
      @dragleave="onDragLeave"
    >
      <TransitionGroup name="lead-list" tag="div" class="leads-container">
        <LeadCard
          v-for="lead in leads"
          :key="lead.id"
          :lead="lead"
          @click="$emit('lead-click', lead)"
          class="mb-3"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <div v-if="leads.length === 0" class="empty-state">
        <div class="empty-icon">
          <v-icon size="48">mdi-target</v-icon>
        </div>
        <p class="empty-title">Sem leads aqui</p>
        <p class="empty-subtitle">Arraste leads para esta coluna</p>
      </div>

      <!-- Drop zone indicator -->
      <div v-if="isDragOver" class="drop-zone">
        <v-icon size="32" color="primary">mdi-plus-circle</v-icon>
        <span>Solte aqui</span>
      </div>
    </div>

    <!-- Column Footer -->
    <div class="column-footer">
      <v-btn 
        block 
        variant="text" 
        class="add-lead-btn"
        @click="$emit('add-lead', column.id)"
      >
        <v-icon start>mdi-plus</v-icon>
        Adicionar Lead
      </v-btn>
    </div>
  </div>
</template>

<script>
import LeadCard from './LeadCard.vue'

export default {
  name: 'KanbanColumn',
  components: {
    LeadCard
  },
  props: {
    column: {
      type: Object,
      required: true
    },
    leads: {
      type: Array,
      default: () => []
    },
    totalLeadsCount: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    isDragOver: false
  }),
  computed: {
    totalValue() {
      return this.leads.reduce((sum, lead) => sum + (lead.value || 0), 0)
    }
  },
  methods: {
    getHeaderGradient() {
      const gradients = {
        blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        purple: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
        orange: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
        amber: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        green: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
        red: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
        pink: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
        cyan: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)'
      }
      return gradients[this.column.color] || gradients.blue
    },
    getColumnIcon() {
      const icons = {
        'novo': 'mdi-star-outline',
        'contato': 'mdi-message-outline',
        'proposta': 'mdi-file-document-outline',
        'negociacao': 'mdi-handshake-outline',
        'fechado': 'mdi-check-circle-outline',
        'perdido': 'mdi-close-circle-outline'
      }
      return icons[this.column.id] || 'mdi-folder-outline'
    },
    getChipColor() {
      const colors = {
        blue: 'indigo',
        purple: 'purple',
        orange: 'orange',
        amber: 'amber',
        green: 'success',
        red: 'error',
        pink: 'pink'
      }
      return colors[this.column.color] || 'primary'
    },
    getProgress() {
      if (this.totalLeadsCount === 0) return 0
      return (this.leads.length / this.totalLeadsCount) * 100
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    },
    onDragOver(e) {
      e.preventDefault()
      this.isDragOver = true
    },
    onDragLeave(e) {
      // Only trigger if leaving the column entirely
      if (!e.currentTarget.contains(e.relatedTarget)) {
        this.isDragOver = false
      }
    },
    onDrop(e) {
      e.preventDefault()
      this.isDragOver = false
      
      const leadId = e.dataTransfer.getData('leadId')
      if (leadId) {
        this.$emit('drop', { leadId, targetStage: this.column.id })
      }
    }
  }
}
</script>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  min-width: 320px;
  max-width: 360px;
  height: 100%;
  background: linear-gradient(180deg, rgba(30, 30, 45, 0.6), rgba(20, 20, 35, 0.8));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.kanban-column:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.3);
}

.kanban-column.drag-over {
  border-color: rgba(102, 126, 234, 0.5);
  box-shadow: 
    0 15px 50px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(102, 126, 234, 0.2);
  transform: scale(1.02);
}

/* Column Header */
.column-header {
  position: relative;
  padding: 20px;
  overflow: hidden;
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  opacity: 0.1;
}

.header-content {
  position: relative;
  z-index: 1;
}

.column-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.column-title {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
}

.column-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 2px;
}

.column-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #7bed9f;
  padding: 4px 10px;
  background: rgba(46, 213, 115, 0.15);
  border-radius: 8px;
}

.count-chip {
  font-weight: 700;
}

.column-progress {
  opacity: 0.6;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.1);
}

/* Column Content */
.column-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  min-height: 200px;
}

/* Custom scrollbar */
.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Leads container */
.leads-container {
  position: relative;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
}

.empty-icon .v-icon {
  color: rgba(255, 255, 255, 0.2);
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 4px;
}

.empty-subtitle {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.25);
}

/* Drop zone */
.drop-zone {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed rgba(102, 126, 234, 0.5);
  border-radius: 16px;
  gap: 8px;
  animation: dropZonePulse 1.5s ease-in-out infinite;
}

.drop-zone span {
  font-weight: 600;
  color: rgba(102, 126, 234, 1);
}

@keyframes dropZonePulse {
  0%, 100% { background: rgba(102, 126, 234, 0.1); }
  50% { background: rgba(102, 126, 234, 0.15); }
}

/* Column Footer */
.column-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.add-lead-btn {
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
  border-radius: 12px;
}

.add-lead-btn:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

/* Lead list transitions */
.lead-list-enter-active,
.lead-list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.lead-list-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.lead-list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.lead-list-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Light theme */
:deep(.v-theme--light) .kanban-column {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.98));
  border: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.v-theme--light) .column-title {
  color: #1a1a2e;
}

:deep(.v-theme--light) .column-subtitle {
  color: rgba(0, 0, 0, 0.5);
}
</style>
