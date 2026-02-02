<template>
  <div class="activities-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h3 class="panel-title">
            <v-icon class="mr-2">mdi-calendar-check</v-icon>
            Atividades & Follow-ups
          </h3>
          <p class="panel-subtitle">{{ pendingCount }} pendentes hoje</p>
        </div>
        
        <v-btn color="primary" variant="flat" class="add-btn" @click="openAddActivity">
          <v-icon start>mdi-plus</v-icon>
          Nova Atividade
        </v-btn>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" class="activity-tabs" color="primary">
      <v-tab value="pending">
        Pendentes
        <v-chip size="x-small" class="ml-2" color="error" v-if="pendingActivities.length">
          {{ pendingActivities.length }}
        </v-chip>
      </v-tab>
      <v-tab value="today">Hoje</v-tab>
      <v-tab value="upcoming">Próximas</v-tab>
      <v-tab value="completed">Concluídas</v-tab>
    </v-tabs>

    <!-- Activities List -->
    <div class="activities-list">
      <TransitionGroup name="activity-list">
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="activity-card"
          :class="{ overdue: isOverdue(activity), completed: activity.completed }"
        >
          <div class="activity-checkbox">
            <v-checkbox
              :model-value="activity.completed"
              @update:model-value="toggleComplete(activity)"
              hide-details
              density="compact"
              color="success"
            ></v-checkbox>
          </div>

          <div class="activity-type-icon" :class="activity.type">
            <v-icon size="18">{{ getTypeIcon(activity.type) }}</v-icon>
          </div>

          <div class="activity-content">
            <div class="activity-header">
              <span class="activity-title">{{ activity.title }}</span>
              <v-chip
                v-if="activity.leadName"
                size="x-small"
                variant="tonal"
                color="primary"
                @click="goToLead(activity.leadId)"
              >
                {{ activity.leadName }}
              </v-chip>
            </div>
            
            <p class="activity-description" v-if="activity.description">
              {{ activity.description }}
            </p>

            <div class="activity-meta">
              <span class="activity-date" :class="{ overdue: isOverdue(activity) }">
                <v-icon size="12">mdi-clock-outline</v-icon>
                {{ formatDate(activity.dueDate) }}
              </span>
              
              <v-chip
                size="x-small"
                :color="getPriorityColor(activity.priority)"
                variant="flat"
              >
                {{ getPriorityLabel(activity.priority) }}
              </v-chip>
            </div>
          </div>

          <div class="activity-actions">
            <v-btn icon variant="text" size="small" @click="editActivity(activity)">
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon variant="text" size="small" color="error" @click="deleteActivity(activity.id)">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </TransitionGroup>

      <!-- Empty State -->
      <div v-if="filteredActivities.length === 0" class="empty-state">
        <v-icon size="48" color="grey">mdi-calendar-blank</v-icon>
        <p>Nenhuma atividade {{ activeTab === 'completed' ? 'concluída' : 'pendente' }}</p>
      </div>
    </div>

    <!-- Add/Edit Activity Modal -->
    <v-dialog v-model="activityDialog" max-width="500" persistent>
      <v-card class="activity-modal">
        <div class="modal-header">
          <h3>{{ editingActivity ? 'Editar Atividade' : 'Nova Atividade' }}</h3>
          <v-btn icon variant="text" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="formValid">
            <v-select
              v-model="formData.type"
              :items="activityTypes"
              item-title="label"
              item-value="value"
              label="Tipo de Atividade"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            >
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <v-text-field
              v-model="formData.title"
              label="Título"
              :rules="[v => !!v || 'Título obrigatório']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="formData.description"
              label="Descrição (opcional)"
              variant="outlined"
              density="comfortable"
              rows="2"
              class="mb-4"
            ></v-textarea>

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.dueDate"
                  label="Data"
                  type="date"
                  :rules="[v => !!v || 'Data obrigatória']"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="formData.dueTime"
                  label="Hora"
                  type="time"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-select
              v-model="formData.priority"
              :items="priorities"
              item-title="label"
              item-value="value"
              label="Prioridade"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-select>

            <v-autocomplete
              v-model="formData.leadId"
              :items="allLeads"
              item-title="name"
              item-value="id"
              label="Vincular a Lead (opcional)"
              variant="outlined"
              density="comfortable"
              clearable
            ></v-autocomplete>
          </v-form>
        </v-card-text>

        <div class="modal-footer">
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="saveActivity" :disabled="!formValid">
            <v-icon start>mdi-check</v-icon>
            {{ editingActivity ? 'Salvar' : 'Criar' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { useCrmStore } from '@/store/crm'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'ActivitiesPanel',
  setup() {
    const crmStore = useCrmStore()
    return { crmStore }
  },
  data: () => ({
    activeTab: 'pending',
    activityDialog: false,
    editingActivity: null,
    formValid: false,
    formData: {
      type: 'call',
      title: '',
      description: '',
      dueDate: '',
      dueTime: '09:00',
      priority: 'normal',
      leadId: null
    },
    activities: [],
    activityTypes: [
      { value: 'call', label: 'Ligação', icon: 'mdi-phone', color: 'success' },
      { value: 'message', label: 'Mensagem', icon: 'mdi-message', color: 'info' },
      { value: 'meeting', label: 'Reunião', icon: 'mdi-account-group', color: 'primary' },
      { value: 'email', label: 'Email', icon: 'mdi-email', color: 'warning' },
      { value: 'task', label: 'Tarefa', icon: 'mdi-checkbox-marked', color: 'purple' },
      { value: 'followup', label: 'Follow-up', icon: 'mdi-clock-alert', color: 'error' }
    ],
    priorities: [
      { value: 'high', label: 'Alta' },
      { value: 'normal', label: 'Normal' },
      { value: 'low', label: 'Baixa' }
    ]
  }),
  computed: {
    allLeads() {
      return this.crmStore.getAllLeads
    },
    pendingActivities() {
      return this.activities.filter(a => !a.completed && this.isOverdue(a))
    },
    pendingCount() {
      const today = new Date().toISOString().split('T')[0]
      return this.activities.filter(a => 
        !a.completed && a.dueDate.split('T')[0] === today
      ).length
    },
    filteredActivities() {
      const today = new Date().toISOString().split('T')[0]
      const now = new Date()

      switch (this.activeTab) {
        case 'pending':
          return this.activities
            .filter(a => !a.completed && new Date(a.dueDate) <= now)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        
        case 'today':
          return this.activities
            .filter(a => a.dueDate.split('T')[0] === today)
            .sort((a, b) => a.completed - b.completed)
        
        case 'upcoming':
          return this.activities
            .filter(a => !a.completed && new Date(a.dueDate) > now)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        
        case 'completed':
          return this.activities
            .filter(a => a.completed)
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        
        default:
          return this.activities
      }
    }
  },
  methods: {
    openAddActivity(leadId = null) {
      this.editingActivity = null
      this.formData = {
        type: 'call',
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: '09:00',
        priority: 'normal',
        leadId: leadId
      }
      this.activityDialog = true
    },
    editActivity(activity) {
      this.editingActivity = activity
      const date = new Date(activity.dueDate)
      this.formData = {
        type: activity.type,
        title: activity.title,
        description: activity.description || '',
        dueDate: date.toISOString().split('T')[0],
        dueTime: date.toTimeString().slice(0, 5),
        priority: activity.priority,
        leadId: activity.leadId
      }
      this.activityDialog = true
    },
    closeDialog() {
      this.activityDialog = false
      this.editingActivity = null
    },
    saveActivity() {
      if (!this.formValid) return

      const dueDate = new Date(`${this.formData.dueDate}T${this.formData.dueTime || '09:00'}`)
      const lead = this.formData.leadId ? this.allLeads.find(l => l.id === this.formData.leadId) : null

      const activityData = {
        type: this.formData.type,
        title: this.formData.title,
        description: this.formData.description,
        dueDate: dueDate.toISOString(),
        priority: this.formData.priority,
        leadId: this.formData.leadId,
        leadName: lead?.name || null,
        completed: false
      }

      if (this.editingActivity) {
        const index = this.activities.findIndex(a => a.id === this.editingActivity.id)
        if (index > -1) {
          this.activities[index] = { ...this.activities[index], ...activityData }
        }
      } else {
        this.activities.push({
          id: uuidv4(),
          ...activityData,
          createdAt: new Date().toISOString()
        })
      }

      this.saveToStorage()
      this.closeDialog()
    },
    toggleComplete(activity) {
      activity.completed = !activity.completed
      activity.completedAt = activity.completed ? new Date().toISOString() : null
      this.saveToStorage()
    },
    deleteActivity(id) {
      const index = this.activities.findIndex(a => a.id === id)
      if (index > -1) {
        this.activities.splice(index, 1)
        this.saveToStorage()
      }
    },
    goToLead(leadId) {
      this.$emit('go-to-lead', leadId)
    },
    isOverdue(activity) {
      if (activity.completed) return false
      return new Date(activity.dueDate) < new Date()
    },
    getTypeIcon(type) {
      const found = this.activityTypes.find(t => t.value === type)
      return found?.icon || 'mdi-checkbox-marked'
    },
    getPriorityColor(priority) {
      const colors = { high: 'error', normal: 'primary', low: 'grey' }
      return colors[priority] || 'primary'
    },
    getPriorityLabel(priority) {
      const labels = { high: 'Alta', normal: 'Normal', low: 'Baixa' }
      return labels[priority] || priority
    },
    formatDate(date) {
      const d = new Date(date)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const activityDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      
      const diffDays = Math.floor((activityDate - today) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) return `Hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
      if (diffDays === 1) return `Amanhã às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
      if (diffDays === -1) return `Ontem às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
      
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    },
    saveToStorage() {
      localStorage.setItem('crm-activities', JSON.stringify(this.activities))
    },
    loadFromStorage() {
      const saved = localStorage.getItem('crm-activities')
      if (saved) {
        this.activities = JSON.parse(saved)
      } else {
        // Add sample activities
        this.addSampleActivities()
      }
    },
    addSampleActivities() {
      const now = new Date()
      const leads = this.allLeads.slice(0, 3)
      
      this.activities = [
        {
          id: uuidv4(),
          type: 'call',
          title: 'Ligar para acompanhar proposta',
          description: 'Verificar se recebeu a proposta e tirar dúvidas',
          dueDate: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          priority: 'high',
          leadId: leads[0]?.id,
          leadName: leads[0]?.name,
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          type: 'meeting',
          title: 'Reunião de apresentação',
          dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          priority: 'normal',
          leadId: leads[1]?.id,
          leadName: leads[1]?.name,
          completed: false,
          createdAt: new Date().toISOString()
        },
        {
          id: uuidv4(),
          type: 'followup',
          title: 'Follow-up do contato inicial',
          dueDate: new Date().toISOString(),
          priority: 'normal',
          leadId: leads[2]?.id,
          leadName: leads[2]?.name,
          completed: false,
          createdAt: new Date().toISOString()
        }
      ]
      this.saveToStorage()
    }
  },
  mounted() {
    this.loadFromStorage()
  }
}
</script>

<style scoped>
.activities-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.panel-header {
  padding: 20px 24px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.8), rgba(25, 25, 40, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.panel-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
}

.panel-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.add-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 10px;
}

/* Tabs */
.activity-tabs {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 4px;
}

.activity-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
  border-radius: 8px;
}

/* Activities List */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
}

.activity-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.activity-card:hover {
  border-color: rgba(102, 126, 234, 0.3);
}

.activity-card.overdue {
  border-left: 3px solid #ef4444;
}

.activity-card.completed {
  opacity: 0.6;
}

.activity-card.completed .activity-title {
  text-decoration: line-through;
}

.activity-checkbox {
  flex-shrink: 0;
}

.activity-type-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-type-icon.call { background: rgba(52, 211, 153, 0.2); color: #6ee7b7; }
.activity-type-icon.message { background: rgba(79, 172, 254, 0.2); color: #7dd3fc; }
.activity-type-icon.meeting { background: rgba(102, 126, 234, 0.2); color: #a5b4fc; }
.activity-type-icon.email { background: rgba(251, 191, 36, 0.2); color: #fcd34d; }
.activity-type-icon.task { background: rgba(168, 85, 247, 0.2); color: #c4b5fd; }
.activity-type-icon.followup { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.activity-title {
  font-weight: 600;
  color: #fff;
}

.activity-description {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 6px 0;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.activity-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.activity-date.overdue {
  color: #ef4444;
}

.activity-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.activity-card:hover .activity-actions {
  opacity: 1;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: rgba(255, 255, 255, 0.4);
}

/* Modal */
.activity-modal {
  border-radius: 20px !important;
  background: linear-gradient(180deg, rgba(25, 25, 40, 0.98), rgba(20, 20, 35, 0.99)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
}

/* Transitions */
.activity-list-enter-active,
.activity-list-leave-active {
  transition: all 0.3s ease;
}

.activity-list-enter-from,
.activity-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
