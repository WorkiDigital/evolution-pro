<template>
  <div class="automations-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h3 class="panel-title">
            <v-icon class="mr-2">mdi-robot</v-icon>
            Automações
          </h3>
          <p class="panel-subtitle">{{ activeAutomations.length }} automações ativas</p>
        </div>
        
        <v-btn color="primary" variant="flat" class="add-btn" @click="openAddAutomation">
          <v-icon start>mdi-plus</v-icon>
          Nova Automação
        </v-btn>
      </div>
    </div>

    <!-- Automations List -->
    <div class="automations-list">
      <div
        v-for="automation in automations"
        :key="automation.id"
        class="automation-card"
        :class="{ active: automation.active }"
      >
        <div class="automation-status">
          <v-switch
            :model-value="automation.active"
            @update:model-value="toggleAutomation(automation)"
            hide-details
            density="compact"
            color="success"
          ></v-switch>
        </div>

        <div class="automation-icon" :class="automation.trigger">
          <v-icon size="20">{{ getTriggerIcon(automation.trigger) }}</v-icon>
        </div>

        <div class="automation-content">
          <h4 class="automation-name">{{ automation.name }}</h4>
          
          <div class="automation-flow">
            <div class="flow-item trigger">
              <v-icon size="14">mdi-lightning-bolt</v-icon>
              <span>{{ getTriggerLabel(automation.trigger) }}</span>
              <span class="flow-condition" v-if="automation.triggerValue">
                ({{ automation.triggerValue }})
              </span>
            </div>
            
            <v-icon size="14" color="grey">mdi-arrow-right</v-icon>
            
            <div class="flow-item action">
              <v-icon size="14">mdi-cog</v-icon>
              <span>{{ getActionLabel(automation.action) }}</span>
            </div>
          </div>

          <div class="automation-stats">
            <span class="stat">
              <v-icon size="12">mdi-play</v-icon>
              {{ automation.executionCount || 0 }} execuções
            </span>
            <span class="stat" v-if="automation.lastExecution">
              <v-icon size="12">mdi-clock</v-icon>
              Última: {{ formatDate(automation.lastExecution) }}
            </span>
          </div>
        </div>

        <div class="automation-actions">
          <v-btn icon variant="text" size="small" @click="editAutomation(automation)">
            <v-icon size="18">mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon variant="text" size="small" @click="testAutomation(automation)">
            <v-icon size="18">mdi-play</v-icon>
            <v-tooltip activator="parent" location="top">Testar</v-tooltip>
          </v-btn>
          <v-btn icon variant="text" size="small" color="error" @click="deleteAutomation(automation.id)">
            <v-icon size="18">mdi-delete</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="automations.length === 0" class="empty-state">
        <v-icon size="64" color="grey">mdi-robot-off</v-icon>
        <h4>Nenhuma automação configurada</h4>
        <p>Crie automações para agilizar seu workflow</p>
        <v-btn color="primary" variant="flat" @click="openAddAutomation" class="mt-4">
          <v-icon start>mdi-plus</v-icon>
          Criar Primeira Automação
        </v-btn>
      </div>
    </div>

    <!-- Automation Templates -->
    <div class="templates-section" v-if="automations.length === 0 || showTemplates">
      <h4 class="section-title">Templates Sugeridos</h4>
      <div class="templates-grid">
        <div
          v-for="template in automationTemplates"
          :key="template.id"
          class="template-card"
          @click="createFromTemplate(template)"
        >
          <div class="template-icon" :class="template.trigger">
            <v-icon size="24">{{ getTriggerIcon(template.trigger) }}</v-icon>
          </div>
          <div class="template-info">
            <h5>{{ template.name }}</h5>
            <p>{{ template.description }}</p>
          </div>
          <v-icon class="template-arrow">mdi-chevron-right</v-icon>
        </div>
      </div>
    </div>

    <!-- Add/Edit Automation Dialog -->
    <v-dialog v-model="automationDialog" max-width="650" persistent>
      <v-card class="automation-modal">
        <div class="modal-header">
          <div class="d-flex align-center">
            <div class="modal-icon">
              <v-icon size="24">mdi-robot</v-icon>
            </div>
            <div class="ml-3">
              <h3>{{ editingAutomation ? 'Editar Automação' : 'Nova Automação' }}</h3>
              <p class="modal-subtitle">Configure o gatilho e a ação</p>
            </div>
          </div>
          <v-btn icon variant="text" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="formValid">
            <!-- Automation Name -->
            <v-text-field
              v-model="formData.name"
              label="Nome da Automação"
              :rules="[v => !!v || 'Nome obrigatório']"
              variant="outlined"
              density="comfortable"
              class="mb-6"
            ></v-text-field>

            <!-- Trigger Section -->
            <div class="section-card mb-4">
              <h4 class="section-label">
                <v-icon class="mr-2" color="warning">mdi-lightning-bolt</v-icon>
                Quando isso acontecer (Gatilho)
              </h4>

              <v-select
                v-model="formData.trigger"
                :items="triggers"
                item-title="label"
                item-value="value"
                label="Selecione o gatilho"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              >
                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon>{{ item.raw.icon }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>

              <!-- Trigger Value -->
              <v-select
                v-if="formData.trigger === 'stage_change'"
                v-model="formData.triggerValue"
                :items="stages"
                item-title="name"
                item-value="id"
                label="Para qual estágio?"
                variant="outlined"
                density="comfortable"
              ></v-select>

              <v-text-field
                v-if="formData.trigger === 'inactivity'"
                v-model.number="formData.triggerValue"
                type="number"
                label="Após quantos dias?"
                variant="outlined"
                density="comfortable"
                suffix="dias"
              ></v-text-field>

              <v-select
                v-if="formData.trigger === 'score_threshold'"
                v-model.number="formData.triggerValue"
                :items="[50, 60, 70, 80, 90]"
                label="Score maior que"
                variant="outlined"
                density="comfortable"
              ></v-select>
            </div>

            <!-- Action Section -->
            <div class="section-card">
              <h4 class="section-label">
                <v-icon class="mr-2" color="success">mdi-cog</v-icon>
                Fazer isso (Ação)
              </h4>

              <v-select
                v-model="formData.action"
                :items="actions"
                item-title="label"
                item-value="value"
                label="Selecione a ação"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              >
                <template v-slot:item="{ item, props }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon>{{ item.raw.icon }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>

              <!-- Action Value -->
              <v-select
                v-if="formData.action === 'move_stage'"
                v-model="formData.actionValue"
                :items="stages"
                item-title="name"
                item-value="id"
                label="Mover para qual estágio?"
                variant="outlined"
                density="comfortable"
              ></v-select>

              <v-textarea
                v-if="formData.action === 'send_message'"
                v-model="formData.actionValue"
                label="Mensagem a enviar"
                placeholder="Use {{nome}} para personalizar"
                variant="outlined"
                rows="3"
              ></v-textarea>

              <v-text-field
                v-if="formData.action === 'add_tag'"
                v-model="formData.actionValue"
                label="Tag a adicionar"
                variant="outlined"
                density="comfortable"
              ></v-text-field>

              <v-select
                v-if="formData.action === 'set_priority'"
                v-model="formData.actionValue"
                :items="['high', 'medium', 'normal']"
                label="Definir prioridade como"
                variant="outlined"
                density="comfortable"
              ></v-select>

              <v-text-field
                v-if="formData.action === 'create_activity'"
                v-model="formData.actionValue"
                label="Título da atividade"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
            </div>
          </v-form>
        </v-card-text>

        <div class="modal-footer">
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="saveAutomation" :disabled="!formValid">
            <v-icon start>mdi-check</v-icon>
            {{ editingAutomation ? 'Salvar' : 'Criar Automação' }}
          </v-btn>
        </div>
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
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'AutomationsPanel',
  setup() {
    const crmStore = useCrmStore()
    return { crmStore }
  },
  data: () => ({
    automations: [],
    automationDialog: false,
    editingAutomation: null,
    formValid: false,
    showTemplates: false,
    snackbar: { show: false, text: '', color: 'success' },
    formData: {
      name: '',
      trigger: 'lead_created',
      triggerValue: null,
      action: 'send_message',
      actionValue: null
    },
    triggers: [
      { value: 'lead_created', label: 'Lead criado', icon: 'mdi-account-plus' },
      { value: 'stage_change', label: 'Lead mudou de estágio', icon: 'mdi-swap-horizontal' },
      { value: 'inactivity', label: 'Lead sem atividade', icon: 'mdi-clock-alert' },
      { value: 'score_threshold', label: 'Score atingiu limite', icon: 'mdi-star' },
      { value: 'tag_added', label: 'Tag adicionada', icon: 'mdi-tag-plus' }
    ],
    actions: [
      { value: 'send_message', label: 'Enviar mensagem WhatsApp', icon: 'mdi-whatsapp' },
      { value: 'move_stage', label: 'Mover para estágio', icon: 'mdi-arrow-right-bold' },
      { value: 'add_tag', label: 'Adicionar tag', icon: 'mdi-tag-plus' },
      { value: 'set_priority', label: 'Definir prioridade', icon: 'mdi-flag' },
      { value: 'create_activity', label: 'Criar atividade', icon: 'mdi-calendar-plus' },
      { value: 'notify', label: 'Enviar notificação', icon: 'mdi-bell' }
    ],
    automationTemplates: [
      {
        id: 1,
        name: 'Boas-vindas automático',
        description: 'Envia mensagem quando um novo lead é criado',
        trigger: 'lead_created',
        action: 'send_message',
        actionValue: 'Olá {{nome}}! Obrigado pelo contato. Em breve um de nossos consultores entrará em contato!'
      },
      {
        id: 2,
        name: 'Follow-up de inatividade',
        description: 'Cria atividade quando lead fica 3 dias sem interação',
        trigger: 'inactivity',
        triggerValue: 3,
        action: 'create_activity',
        actionValue: 'Follow-up: Lead sem atividade'
      },
      {
        id: 3,
        name: 'Lead quente',
        description: 'Adiciona tag "Hot" quando score passa de 80',
        trigger: 'score_threshold',
        triggerValue: 80,
        action: 'add_tag',
        actionValue: 'Hot Lead'
      },
      {
        id: 4,
        name: 'Priorizar proposta enviada',
        description: 'Define prioridade alta quando move para proposta',
        trigger: 'stage_change',
        triggerValue: 'proposta',
        action: 'set_priority',
        actionValue: 'high'
      }
    ]
  }),
  computed: {
    stages() {
      return this.crmStore.columns
    },
    activeAutomations() {
      return this.automations.filter(a => a.active)
    }
  },
  methods: {
    openAddAutomation() {
      this.editingAutomation = null
      this.formData = {
        name: '',
        trigger: 'lead_created',
        triggerValue: null,
        action: 'send_message',
        actionValue: null
      }
      this.automationDialog = true
    },
    editAutomation(automation) {
      this.editingAutomation = automation
      this.formData = {
        name: automation.name,
        trigger: automation.trigger,
        triggerValue: automation.triggerValue,
        action: automation.action,
        actionValue: automation.actionValue
      }
      this.automationDialog = true
    },
    closeDialog() {
      this.automationDialog = false
      this.editingAutomation = null
    },
    saveAutomation() {
      if (!this.formValid) return

      const automationData = {
        name: this.formData.name,
        trigger: this.formData.trigger,
        triggerValue: this.formData.triggerValue,
        action: this.formData.action,
        actionValue: this.formData.actionValue,
        active: true,
        executionCount: 0
      }

      if (this.editingAutomation) {
        const index = this.automations.findIndex(a => a.id === this.editingAutomation.id)
        if (index > -1) {
          this.automations[index] = { ...this.automations[index], ...automationData }
        }
      } else {
        this.automations.push({
          id: uuidv4(),
          ...automationData,
          createdAt: new Date().toISOString()
        })
      }

      this.saveToStorage()
      this.closeDialog()
      this.showSnackbar('Automação salva com sucesso!')
    },
    createFromTemplate(template) {
      this.formData = {
        name: template.name,
        trigger: template.trigger,
        triggerValue: template.triggerValue || null,
        action: template.action,
        actionValue: template.actionValue || null
      }
      this.automationDialog = true
    },
    toggleAutomation(automation) {
      automation.active = !automation.active
      this.saveToStorage()
      this.showSnackbar(automation.active ? 'Automação ativada' : 'Automação desativada')
    },
    deleteAutomation(id) {
      if (!confirm('Excluir esta automação?')) return
      const index = this.automations.findIndex(a => a.id === id)
      if (index > -1) {
        this.automations.splice(index, 1)
        this.saveToStorage()
        this.showSnackbar('Automação excluída')
      }
    },
    testAutomation(automation) {
      // Simulate execution
      automation.executionCount = (automation.executionCount || 0) + 1
      automation.lastExecution = new Date().toISOString()
      this.saveToStorage()
      this.showSnackbar(`Automação "${automation.name}" executada!`)
    },
    getTriggerIcon(trigger) {
      const found = this.triggers.find(t => t.value === trigger)
      return found?.icon || 'mdi-lightning-bolt'
    },
    getTriggerLabel(trigger) {
      const found = this.triggers.find(t => t.value === trigger)
      return found?.label || trigger
    },
    getActionLabel(action) {
      const found = this.actions.find(a => a.value === action)
      return found?.label || action
    },
    formatDate(date) {
      return new Date(date).toLocaleString('pt-BR')
    },
    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    },
    saveToStorage() {
      localStorage.setItem('crm-automations', JSON.stringify(this.automations))
    },
    loadFromStorage() {
      const saved = localStorage.getItem('crm-automations')
      if (saved) {
        this.automations = JSON.parse(saved)
      }
    }
  },
  mounted() {
    this.loadFromStorage()
  }
}
</script>

<style scoped>
.automations-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

/* Automations List */
.automations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.automation-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.automation-card:hover {
  border-color: rgba(102, 126, 234, 0.3);
}

.automation-card.active {
  border-left: 3px solid #34d399;
}

.automation-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.automation-icon.lead_created { background: rgba(102, 126, 234, 0.2); color: #a5b4fc; }
.automation-icon.stage_change { background: rgba(168, 85, 247, 0.2); color: #c4b5fd; }
.automation-icon.inactivity { background: rgba(251, 191, 36, 0.2); color: #fcd34d; }
.automation-icon.score_threshold { background: rgba(52, 211, 153, 0.2); color: #6ee7b7; }
.automation-icon.tag_added { background: rgba(79, 172, 254, 0.2); color: #7dd3fc; }

.automation-content {
  flex: 1;
  min-width: 0;
}

.automation-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.automation-flow {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.flow-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
}

.flow-item.trigger {
  background: rgba(251, 191, 36, 0.15);
  color: #fcd34d;
}

.flow-item.action {
  background: rgba(52, 211, 153, 0.15);
  color: #6ee7b7;
}

.flow-condition {
  opacity: 0.7;
}

.automation-stats {
  display: flex;
  gap: 16px;
  margin-top: 10px;
}

.automation-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.automation-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.automation-card:hover .automation-actions {
  opacity: 1;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state h4 {
  color: rgba(255, 255, 255, 0.6);
  margin: 16px 0 8px;
}

.empty-state p {
  color: rgba(255, 255, 255, 0.3);
}

/* Templates Section */
.templates-section {
  margin-top: 16px;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 16px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.template-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-card:hover {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

.template-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(102, 126, 234, 0.2);
  color: #a5b4fc;
}

.template-info {
  flex: 1;
}

.template-info h5 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px;
}

.template-info p {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.template-arrow {
  color: rgba(255, 255, 255, 0.3);
}

/* Modal */
.automation-modal {
  border-radius: 24px !important;
  background: linear-gradient(180deg, rgba(25, 25, 40, 0.98), rgba(20, 20, 35, 0.99)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.modal-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0;
}

.section-card {
  padding: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.section-label {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
}
</style>
