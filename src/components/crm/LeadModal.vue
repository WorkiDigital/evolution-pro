<template>
  <v-dialog v-model="dialog" max-width="800" persistent class="lead-modal">
    <v-card class="modal-card">
      <!-- Header -->
      <div class="modal-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <div class="modal-icon" :class="{ 'editing': isEditing }">
                <v-icon size="24">{{ isEditing ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
              </div>
              <div class="ml-4">
                <h2 class="modal-title">{{ isEditing ? 'Editar Lead' : 'Novo Lead' }}</h2>
                <p class="modal-subtitle">{{ isEditing ? 'Atualize as informações do lead' : 'Adicione um novo lead ao pipeline' }}</p>
              </div>
            </div>
            <div class="header-actions" v-if="isEditing">
              <v-btn 
                icon 
                variant="tonal" 
                color="success" 
                size="small" 
                @click="openChat"
                class="action-btn"
              >
                <v-icon>mdi-whatsapp</v-icon>
                <v-tooltip activator="parent" location="bottom">Abrir Chat</v-tooltip>
              </v-btn>
              <v-btn 
                icon 
                variant="tonal" 
                color="primary" 
                size="small" 
                :href="'tel:' + formData.phone"
                class="action-btn"
              >
                <v-icon>mdi-phone</v-icon>
                <v-tooltip activator="parent" location="bottom">Ligar</v-tooltip>
              </v-btn>
              <v-btn 
                v-if="formData.email"
                icon 
                variant="tonal" 
                color="info" 
                size="small" 
                :href="'mailto:' + formData.email"
                class="action-btn"
              >
                <v-icon>mdi-email</v-icon>
                <v-tooltip activator="parent" location="bottom">Email</v-tooltip>
              </v-btn>
            </div>
            <v-btn icon variant="text" class="close-btn" @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Content -->
      <v-card-text class="modal-content">
        <v-form ref="form" v-model="valid">
          <!-- Tabs for sections -->
          <v-tabs v-model="activeTab" class="section-tabs mb-6" color="primary" grow>
            <v-tab value="info">
              <v-icon start>mdi-account</v-icon>
              Informações
            </v-tab>
            <v-tab value="business">
              <v-icon start>mdi-briefcase</v-icon>
              Negócio
            </v-tab>
            <v-tab value="notes" v-if="isEditing">
              <v-icon start>mdi-note-text</v-icon>
              Notas
              <v-chip v-if="lead?.notes?.length" size="x-small" class="ml-2">
                {{ lead.notes.length }}
              </v-chip>
            </v-tab>
            <v-tab value="activity" v-if="isEditing">
              <v-icon start>mdi-history</v-icon>
              Atividade
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <!-- Info Tab -->
            <v-window-item value="info">
              <div class="form-section">
                <h3 class="section-title">
                  <v-icon class="mr-2" size="20">mdi-card-account-details</v-icon>
                  Dados Pessoais
                </h3>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.name"
                      label="Nome completo"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-account"
                      class="premium-input"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.phone"
                      label="Telefone / WhatsApp"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-whatsapp"
                      class="premium-input"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.email"
                      label="E-mail"
                      :rules="[rules.email]"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-email"
                      class="premium-input"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.company"
                      label="Empresa"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-domain"
                      class="premium-input"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="formData.address"
                      label="Endereço"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-map-marker"
                      rows="2"
                      class="premium-input"
                    ></v-textarea>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Business Tab -->
            <v-window-item value="business">
              <div class="form-section">
                <h3 class="section-title">
                  <v-icon class="mr-2" size="20">mdi-chart-timeline-variant</v-icon>
                  Informações do Negócio
                </h3>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.source"
                      :items="sources"
                      label="Origem do Lead"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-source-branch"
                      class="premium-input"
                    >
                      <template v-slot:item="{ item, props }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-icon :color="getSourceColor(item.value)">{{ getSourceIcon(item.value) }}</v-icon>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.stage"
                      :items="stages"
                      item-title="name"
                      item-value="id"
                      label="Estágio no Pipeline"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-flag"
                      class="premium-input"
                    >
                      <template v-slot:item="{ item, props }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <div class="stage-dot" :style="{ background: getStageColor(item.raw.color) }"></div>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="formData.value"
                      label="Valor Estimado do Negócio"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-currency-usd"
                      prefix="R$"
                      class="premium-input"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.priority"
                      :items="priorities"
                      item-title="title"
                      item-value="value"
                      label="Prioridade"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-alert-circle"
                      class="premium-input"
                    >
                      <template v-slot:item="{ item, props }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-icon :color="item.raw.color">mdi-circle</v-icon>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="formData.score"
                      label="Score do Lead"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-star"
                      suffix="/100"
                      :rules="[rules.score]"
                      class="premium-input"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.expectedCloseDate"
                      label="Previsão de Fechamento"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-calendar"
                      class="premium-input"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-combobox
                      v-model="formData.tags"
                      label="Tags"
                      multiple
                      chips
                      closable-chips
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-tag-multiple"
                      hint="Pressione Enter para adicionar tags personalizadas"
                      class="premium-input"
                    >
                      <template v-slot:chip="{ item, props }">
                        <v-chip v-bind="props" :color="getTagColor(item)" variant="flat" size="small">
                          {{ item }}
                        </v-chip>
                      </template>
                    </v-combobox>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Notes Tab -->
            <v-window-item value="notes" v-if="isEditing">
              <div class="form-section">
                <h3 class="section-title">
                  <v-icon class="mr-2" size="20">mdi-note-multiple</v-icon>
                  Notas e Observações
                </h3>

                <!-- Add note -->
                <div class="add-note-section mb-4">
                  <v-textarea
                    v-model="newNote"
                    label="Adicionar nova nota..."
                    variant="outlined"
                    density="comfortable"
                    rows="3"
                    prepend-inner-icon="mdi-pencil"
                    class="premium-input"
                  ></v-textarea>
                  <v-btn
                    color="primary"
                    variant="flat"
                    @click="addNote"
                    :disabled="!newNote"
                    class="mt-2 add-note-btn"
                  >
                    <v-icon start>mdi-plus</v-icon>
                    Adicionar Nota
                  </v-btn>
                </div>

                <!-- Notes timeline -->
                <div class="notes-timeline">
                  <div
                    v-for="note in lead?.notes || []"
                    :key="note.id"
                    class="note-item"
                  >
                    <div class="note-avatar">
                      <v-avatar size="32" color="primary">
                        <span class="text-white text-caption font-weight-bold">{{ getInitials(note.user) }}</span>
                      </v-avatar>
                    </div>
                    <div class="note-content">
                      <div class="note-header">
                        <span class="note-author">{{ note.user }}</span>
                        <span class="note-date">{{ formatDate(note.date) }}</span>
                      </div>
                      <p class="note-text">{{ note.text }}</p>
                    </div>
                  </div>

                  <div v-if="!lead?.notes?.length" class="empty-notes">
                    <v-icon size="48" color="grey">mdi-note-text-outline</v-icon>
                    <p>Nenhuma nota registrada</p>
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- Activity Tab -->
            <v-window-item value="activity" v-if="isEditing">
              <div class="form-section">
                <h3 class="section-title">
                  <v-icon class="mr-2" size="20">mdi-timeline</v-icon>
                  Histórico de Atividades
                </h3>

                <div class="activity-timeline">
                  <div class="activity-item">
                    <div class="activity-icon created">
                      <v-icon size="16">mdi-plus-circle</v-icon>
                    </div>
                    <div class="activity-content">
                      <span class="activity-text">Lead criado</span>
                      <span class="activity-date">{{ formatDate(lead?.createdAt) }}</span>
                    </div>
                  </div>

                  <div class="activity-item">
                    <div class="activity-icon updated">
                      <v-icon size="16">mdi-pencil</v-icon>
                    </div>
                    <div class="activity-content">
                      <span class="activity-text">Última atualização</span>
                      <span class="activity-date">{{ formatDate(lead?.updatedAt) }}</span>
                    </div>
                  </div>

                  <div v-if="lead?.stage === 'fechado'" class="activity-item">
                    <div class="activity-icon closed">
                      <v-icon size="16">mdi-check-circle</v-icon>
                    </div>
                    <div class="activity-content">
                      <span class="activity-text">Negócio fechado!</span>
                      <span class="activity-date">{{ formatCurrency(lead?.value) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-window-item>
          </v-window>
        </v-form>
      </v-card-text>

      <!-- Footer -->
      <div class="modal-footer">
        <v-btn
          v-if="isEditing"
          variant="text"
          color="error"
          @click="deleteLead"
          class="delete-btn"
        >
          <v-icon start>mdi-delete</v-icon>
          Excluir Lead
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="close" class="cancel-btn">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="save"
          :disabled="!valid"
          class="save-btn"
        >
          <v-icon start>mdi-check</v-icon>
          {{ isEditing ? 'Salvar Alterações' : 'Criar Lead' }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { useCrmStore } from '@/store/crm'

export default {
  name: 'LeadModal',
  props: {
    instanceId: {
      type: String,
      default: null
    }
  },
  setup() {
    const crmStore = useCrmStore()
    return { crmStore }
  },
  data: () => ({
    dialog: false,
    valid: false,
    isEditing: false,
    lead: null,
    newNote: '',
    activeTab: 'info',
    formData: {
      name: '',
      phone: '',
      email: '',
      company: '',
      address: '',
      source: 'WhatsApp',
      stage: 'novo',
      value: null,
      priority: 'normal',
      score: null,
      expectedCloseDate: null,
      tags: []
    },
    sources: ['WhatsApp', 'Site', 'Indicação', 'Manual', 'Redes Sociais', 'Telefone', 'Email', 'Evento'],
    priorities: [
      { title: 'Alta', value: 'high', color: 'error' },
      { title: 'Média', value: 'medium', color: 'warning' },
      { title: 'Normal', value: 'normal', color: 'success' }
    ],
    rules: {
      required: v => !!v || 'Campo obrigatório',
      email: v => !v || /.+@.+\..+/.test(v) || 'E-mail inválido',
      score: v => !v || (v >= 0 && v <= 100) || 'Score deve ser entre 0 e 100'
    }
  }),
  computed: {
    stages() {
      return this.crmStore.columns
    }
  },
  methods: {
    open(lead = null, instanceId = null, defaultStage = null) {
      this.isEditing = !!lead
      this.lead = lead
      this.activeTab = 'info'

      if (lead) {
        this.formData = {
          name: lead.name,
          phone: lead.phone,
          email: lead.email || '',
          company: lead.company || '',
          address: lead.address || '',
          source: lead.source,
          stage: lead.stage,
          value: lead.value,
          priority: lead.priority || 'normal',
          score: lead.score || null,
          expectedCloseDate: lead.expectedCloseDate || null,
          tags: [...(lead.tags || [])]
        }
      } else {
        this.resetForm()
        if (defaultStage) {
          this.formData.stage = defaultStage
        }
        if (instanceId || this.instanceId) {
          this.formData.instanceId = instanceId || this.instanceId
        }
      }

      this.dialog = true
    },
    close() {
      this.dialog = false
      setTimeout(() => this.resetForm(), 300)
    },
    openChat() {
      if (this.lead) {
        this.$emit('open-chat', this.lead)
        this.close()
      }
    },
    resetForm() {
      this.formData = {
        name: '',
        phone: '',
        email: '',
        company: '',
        address: '',
        source: 'WhatsApp',
        stage: 'novo',
        value: null,
        priority: 'normal',
        score: null,
        expectedCloseDate: null,
        tags: [],
        instanceId: this.instanceId || null
      }
      this.newNote = ''
      this.lead = null
      this.isEditing = false
      this.activeTab = 'info'
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },
    save() {
      if (!this.valid) return

      if (this.isEditing) {
        this.crmStore.updateLead(this.lead.id, this.formData)
      } else {
        this.crmStore.createLead(this.formData)
      }

      this.$emit('saved')
      this.close()
    },
    deleteLead() {
      if (confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
        this.crmStore.deleteLead(this.lead.id)
        this.$emit('deleted')
        this.close()
      }
    },
    addNote() {
      if (!this.newNote) return
      this.crmStore.addNote(this.lead.id, this.newNote)
      this.newNote = ''
      this.lead = this.crmStore.getLeadById(this.lead.id)
    },
    getInitials(name) {
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    },
    getSourceColor(source) {
      const colors = { 'WhatsApp': 'success', 'Site': 'info', 'Indicação': 'purple', 'Email': 'blue' }
      return colors[source] || 'grey'
    },
    getSourceIcon(source) {
      const icons = {
        'WhatsApp': 'mdi-whatsapp', 'Site': 'mdi-web', 'Indicação': 'mdi-account-arrow-right',
        'Manual': 'mdi-pencil', 'Redes Sociais': 'mdi-instagram', 'Telefone': 'mdi-phone', 'Email': 'mdi-email', 'Evento': 'mdi-calendar'
      }
      return icons[source] || 'mdi-help-circle'
    },
    getStageColor(color) {
      const colors = { blue: '#667eea', purple: '#a855f7', orange: '#fb923c', amber: '#fbbf24', green: '#34d399' }
      return colors[color] || '#667eea'
    },
    getTagColor(tag) {
      const tagLower = tag.toLowerCase()
      if (tagLower.includes('hot') || tagLower.includes('quente')) return 'error'
      if (tagLower.includes('vip')) return 'warning'
      return 'primary'
    },
    formatDate(date) {
      if (!date) return '-'
      return new Date(date).toLocaleString('pt-BR')
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
    }
  }
}
</script>

<style scoped>
.lead-modal :deep(.v-overlay__content) {
  margin: 16px;
}

.modal-card {
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(25, 25, 40, 0.98), rgba(20, 20, 35, 0.99));
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
}

/* Header */
.modal-header {
  position: relative;
  padding: 28px 32px;
  overflow: hidden;
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1));
}

.header-content {
  position: relative;
  z-index: 1;
}

.modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.modal-icon.editing {
  background: linear-gradient(135deg, #fb923c, #f97316);
  box-shadow: 0 8px 20px rgba(251, 146, 60, 0.4);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.close-btn {
  color: rgba(255, 255, 255, 0.5);
}

.header-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
  margin-right: 16px;
}

.header-actions .action-btn {
  border-radius: 10px;
}

/* Content */
.modal-content {
  padding: 24px 32px;
  max-height: 60vh;
  overflow-y: auto;
}

.section-tabs {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 4px;
}

.section-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  border-radius: 8px;
}

.form-section {
  padding: 8px 0;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.premium-input {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
}

.premium-input :deep(.v-field) {
  border-radius: 12px;
}

.stage-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 12px;
}

/* Notes */
.notes-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.note-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border-left: 3px solid rgba(102, 126, 234, 0.5);
}

.note-content {
  flex: 1;
}

.note-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.note-author {
  font-weight: 600;
  color: #fff;
  font-size: 0.9rem;
}

.note-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.note-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.5;
}

.empty-notes {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.3);
}

.add-note-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 10px;
}

/* Activity Timeline */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.created {
  background: rgba(102, 126, 234, 0.2);
  color: #a5b4fc;
}

.activity-icon.updated {
  background: rgba(251, 146, 60, 0.2);
  color: #fdba74;
}

.activity-icon.closed {
  background: rgba(52, 211, 153, 0.2);
  color: #6ee7b7;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-text {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.activity-date {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Footer */
.modal-footer {
  display: flex;
  align-items: center;
  padding: 20px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
}

.delete-btn {
  text-transform: none;
  font-weight: 500;
}

.cancel-btn {
  color: rgba(255, 255, 255, 0.6);
  text-transform: none;
  font-weight: 500;
}

.save-btn {
  text-transform: none;
  font-weight: 600;
  padding: 0 24px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
</style>
