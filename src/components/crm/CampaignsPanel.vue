<template>
  <div class="campaigns-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h3 class="panel-title">
            <v-icon class="mr-2">mdi-bullhorn</v-icon>
            Campanhas de Marketing
          </h3>
          <p class="panel-subtitle">{{ campaigns.length }} campanhas • {{ activeCampaigns }} ativas</p>
        </div>
        
        <v-btn color="primary" variant="flat" class="add-btn" @click="openCreateDialog">
          <v-icon start>mdi-plus</v-icon>
          Nova Campanha
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
          <v-icon>mdi-send</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Enviadas</span>
          <span class="stat-value">{{ totalSent }}</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #34d399, #10b981);">
          <v-icon>mdi-check-circle</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">Taxa de Abertura</span>
          <span class="stat-value">{{ openRate }}%</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #fb923c, #f97316);">
          <v-icon>mdi-cursor-default-click</v-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">Taxa de Conversão</span>
          <span class="stat-value">{{ conversionRate }}%</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" class="campaigns-tabs" color="primary">
      <v-tab value="all">Todas</v-tab>
      <v-tab value="active">Ativas</v-tab>
      <v-tab value="scheduled">Agendadas</v-tab>
      <v-tab value="completed">Concluídas</v-tab>
    </v-tabs>

    <!-- Campaigns List -->
    <div class="campaigns-list">
      <div
        v-for="campaign in filteredCampaigns"
        :key="campaign.id"
        class="campaign-card"
        :class="{ active: campaign.status === 'active' }"
      >
        <div class="campaign-header">
          <div class="d-flex align-center gap-3">
            <div class="campaign-icon" :style="{ background: getCampaignColor(campaign.type) }">
              <v-icon>{{ getCampaignIcon(campaign.type) }}</v-icon>
            </div>
            <div>
              <h4 class="campaign-title">{{ campaign.name }}</h4>
              <p class="campaign-meta">
                {{ campaign.type }} • {{ campaign.audience }} leads
              </p>
            </div>
          </div>
          
          <div class="d-flex align-center gap-2">
            <v-chip :color="getStatusColor(campaign.status)" size="small" variant="flat">
              {{ getStatusLabel(campaign.status) }}
            </v-chip>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn icon variant="text" size="small" v-bind="props">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="viewCampaign(campaign)">
                  <v-list-item-title>
                    <v-icon start size="small">mdi-eye</v-icon>
                    Ver Detalhes
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="editCampaign(campaign)">
                  <v-list-item-title>
                    <v-icon start size="small">mdi-pencil</v-icon>
                    Editar
                  </v-list-item-title>
                </v-list-item>
                <v-list-item v-if="campaign.status === 'scheduled'" @click="launchCampaign(campaign)">
                  <v-list-item-title>
                    <v-icon start size="small">mdi-rocket-launch</v-icon>
                    Lançar Agora
                  </v-list-item-title>
                </v-list-item>
                <v-list-item @click="duplicateCampaign(campaign)">
                  <v-list-item-title>
                    <v-icon start size="small">mdi-content-copy</v-icon>
                    Duplicar
                  </v-list-item-title>
                </v-list-item>
                <v-divider></v-divider>
                <v-list-item @click="deleteCampaign(campaign.id)">
                  <v-list-item-title class="text-error">
                    <v-icon start size="small">mdi-delete</v-icon>
                    Excluir
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <p class="campaign-description">{{ campaign.description }}</p>

        <!-- Stats -->
        <div class="campaign-stats">
          <div class="stat-item">
            <v-icon size="16">mdi-send</v-icon>
            <span>{{ campaign.sent || 0 }} enviadas</span>
          </div>
          <div class="stat-item">
            <v-icon size="16">mdi-eye</v-icon>
            <span>{{ campaign.opened || 0 }} aberturas</span>
          </div>
          <div class="stat-item">
            <v-icon size="16">mdi-cursor-default-click</v-icon>
            <span>{{ campaign.clicked || 0 }} cliques</span>
          </div>
          <div class="stat-item">
            <v-icon size="16">mdi-calendar</v-icon>
            <span>{{ formatDate(campaign.scheduledDate) }}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div v-if="campaign.status === 'active'" class="campaign-progress">
          <v-progress-linear
            :model-value="getCampaignProgress(campaign)"
            color="primary"
            height="6"
            rounded
          ></v-progress-linear>
          <span class="progress-label">{{ getCampaignProgress(campaign) }}% concluído</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredCampaigns.length === 0" class="empty-state">
        <v-icon size="64" color="grey">mdi-bullhorn-outline</v-icon>
        <h4>Nenhuma campanha encontrada</h4>
        <p>Crie sua primeira campanha de marketing para engajar seus leads</p>
        <v-btn color="primary" variant="flat" @click="openCreateDialog" class="mt-4">
          <v-icon start>mdi-plus</v-icon>
          Criar Primeira Campanha
        </v-btn>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="700" persistent>
      <v-card class="campaign-modal">
        <div class="modal-header">
          <h3>{{ editingCampaign ? 'Editar Campanha' : 'Nova Campanha' }}</h3>
          <v-btn icon variant="text" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="formValid">
            <v-text-field
              v-model="formData.name"
              label="Nome da Campanha"
              :rules="[v => !!v || 'Nome obrigatório']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="formData.description"
              label="Descrição"
              variant="outlined"
              rows="2"
              class="mb-4"
            ></v-textarea>

            <v-row>
              <v-col cols="6">
                <v-select
                  v-model="formData.type"
                  :items="campaignTypes"
                  label="Tipo de Campanha"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="formData.audience"
                  label="Tamanho da Audiência"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-textarea
              v-model="formData.message"
              label="Mensagem"
              :rules="[v => !!v || 'Mensagem obrigatória']"
              variant="outlined"
              rows="4"
              hint="Use {{nome}}, {{empresa}} para personalizar"
              class="mb-4"
            ></v-textarea>

            <v-text-field
              v-model="formData.scheduledDate"
              label="Data de Agendamento"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <div class="modal-footer">
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="saveCampaign" :disabled="!formValid">
            <v-icon start>mdi-check</v-icon>
            {{ editingCampaign ? 'Salvar' : 'Criar Campanha' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'CampaignsPanel',
  data: () => ({
    campaigns: [],
    dialog: false,
    editingCampaign: null,
    formValid: false,
    activeTab: 'all',
    formData: {
      name: '',
      description: '',
      type: 'WhatsApp',
      audience: 0,
      message: '',
      scheduledDate: ''
    },
    campaignTypes: ['WhatsApp', 'Email', 'SMS', 'Misto']
  }),
  computed: {
    filteredCampaigns() {
      if (this.activeTab === 'all') return this.campaigns
      return this.campaigns.filter(c => c.status === this.activeTab)
    },
    activeCampaigns() {
      return this.campaigns.filter(c => c.status === 'active').length
    },
    totalSent() {
      return this.campaigns.reduce((sum, c) => sum + (c.sent || 0), 0)
    },
    openRate() {
      const total = this.totalSent
      if (total === 0) return 0
      const opened = this.campaigns.reduce((sum, c) => sum + (c.opened || 0), 0)
      return Math.round((opened / total) * 100)
    },
    conversionRate() {
      const total = this.totalSent
      if (total === 0) return 0
      const clicked = this.campaigns.reduce((sum, c) => sum + (c.clicked || 0), 0)
      return Math.round((clicked / total) * 100)
    }
  },
  methods: {
    openCreateDialog() {
      this.editingCampaign = null
      this.formData = {
        name: '',
        description: '',
        type: 'WhatsApp',
        audience: 0,
        message: '',
        scheduledDate: ''
      }
      this.dialog = true
    },
    editCampaign(campaign) {
      this.editingCampaign = campaign
      this.formData = { ...campaign }
      this.dialog = true
    },
    closeDialog() {
      this.dialog = false
      this.editingCampaign = null
    },
    saveCampaign() {
      if (!this.formValid) return

      if (this.editingCampaign) {
        const index = this.campaigns.findIndex(c => c.id === this.editingCampaign.id)
        if (index > -1) {
          this.campaigns[index] = { ...this.campaigns[index], ...this.formData }
        }
      } else {
        this.campaigns.push({
          id: uuidv4(),
          ...this.formData,
          status: 'scheduled',
          sent: 0,
          opened: 0,
          clicked: 0,
          createdAt: new Date().toISOString()
        })
      }

      this.saveToStorage()
      this.closeDialog()
    },
    deleteCampaign(id) {
      if (!confirm('Excluir esta campanha?')) return
      const index = this.campaigns.findIndex(c => c.id === id)
      if (index > -1) {
        this.campaigns.splice(index, 1)
        this.saveToStorage()
      }
    },
    launchCampaign(campaign) {
      campaign.status = 'active'
      this.saveToStorage()
    },
    duplicateCampaign(campaign) {
      const copy = {
        ...campaign,
        id: uuidv4(),
        name: campaign.name + ' (Cópia)',
        status: 'scheduled',
        sent: 0,
        opened: 0,
        clicked: 0
      }
      this.campaigns.push(copy)
      this.saveToStorage()
    },
    viewCampaign(campaign) {
      // TODO: Implement campaign details view
      console.log('View campaign:', campaign)
    },
    getCampaignColor(type) {
      const colors = {
        'WhatsApp': 'linear-gradient(135deg, #25D366, #128C7E)',
        'Email': 'linear-gradient(135deg, #667eea, #764ba2)',
        'SMS': 'linear-gradient(135deg, #fb923c, #f97316)',
        'Misto': 'linear-gradient(135deg, #34d399, #10b981)'
      }
      return colors[type] || colors['WhatsApp']
    },
    getCampaignIcon(type) {
      const icons = {
        'WhatsApp': 'mdi-whatsapp',
        'Email': 'mdi-email',
        'SMS': 'mdi-message-text',
        'Misto': 'mdi-view-grid'
      }
      return icons[type] || 'mdi-bullhorn'
    },
    getStatusColor(status) {
      const colors = {
        'scheduled': 'warning',
        'active': 'success',
        'completed': 'info',
        'paused': 'grey'
      }
      return colors[status] || 'grey'
    },
    getStatusLabel(status) {
      const labels = {
        'scheduled': 'Agendada',
        'active': 'Ativa',
        'completed': 'Concluída',
        'paused': 'Pausada'
      }
      return labels[status] || status
    },
    getCampaignProgress(campaign) {
      if (!campaign.audience) return 0
      return Math.round((campaign.sent / campaign.audience) * 100)
    },
    formatDate(date) {
      if (!date) return 'Não agendada'
      return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    saveToStorage() {
      localStorage.setItem('crm-campaigns', JSON.stringify(this.campaigns))
    },
    loadFromStorage() {
      const saved = localStorage.getItem('crm-campaigns')
      if (saved) {
        this.campaigns = JSON.parse(saved)
      } else {
        this.addSampleCampaigns()
      }
    },
    addSampleCampaigns() {
      this.campaigns = [
        {
          id: uuidv4(),
          name: 'Promoção Black Friday',
          description: 'Campanha especial de descontos para Black Friday',
          type: 'WhatsApp',
          audience: 150,
          message: 'Olá {{nome}}! Aproveite nossa super promoção de Black Friday com até 50% de desconto!',
          status: 'scheduled',
          scheduledDate: new Date(Date.now() + 86400000).toISOString(),
          sent: 0,
          opened: 0,
          clicked: 0
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
.campaigns-panel {
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
}

/* Tabs */
.campaigns-tabs {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 4px;
}

/* Campaigns List */
.campaigns-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.campaign-card {
  padding: 24px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.campaign-card:hover {
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.campaign-card.active {
  border-color: rgba(52, 211, 153, 0.4);
}

.campaign-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.campaign-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.campaign-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.campaign-meta {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0;
}

.campaign-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px;
}

.campaign-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 16px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.campaign-progress {
  margin-top: 16px;
}

.progress-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 8px;
  display: block;
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

/* Modal */
.campaign-modal {
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
</style>
