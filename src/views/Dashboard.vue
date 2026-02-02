<template>
  <div class="dashboard-nexus">
    <!-- Header Stats -->
    <div class="stats-grid">
      <StatCard 
        title="Total de Leads" 
        icon="mdi-account-multiple" 
        :value="crmStats.totalLeads"
        color="primary"
        trend="+12%"
      />
      <StatCard 
        title="Mensagens Ativas" 
        icon="mdi-message-flash" 
        :value="crmStats.activeMessages || 48"
        color="success"
        trend="+8%"
      />
      <StatCard 
        title="Conversão" 
        icon="mdi-chart-line" 
        :value="`${crmStats.conversionRate}%`"
        color="warning"
        trend="+3.2%"
      />
      <StatCard 
        title="Novos Hoje" 
        icon="mdi-account-plus" 
        :value="crmStats.newThisWeek"
        color="info"
        trend="+5"
      />
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Fluxo de Mensagens</h3>
            <p class="chart-subtitle">Últimos 7 dias</p>
          </div>
          <v-btn-toggle v-model="chartPeriod" mandatory density="compact" class="period-toggle">
            <v-btn value="week" size="small">7D</v-btn>
            <v-btn value="month" size="small">30D</v-btn>
            <v-btn value="year" size="small">1A</v-btn>
          </v-btn-toggle>
        </div>
        <ChartLine :series="messageFlowData" :categories="chartCategories" />
      </div>

      <div class="chart-container">
        <div class="chart-header">
          <div>
            <h3 class="chart-title">Taxa de Conversão</h3>
            <p class="chart-subtitle">Por etapa do funil</p>
          </div>
        </div>
        <ChartBar :series="conversionData" :categories="funnelStages" />
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="activity-section">
      <div class="recent-leads-container">
        <div class="section-header">
          <div>
            <h3 class="section-title">Leads Recentes</h3>
            <p class="section-subtitle">Últimas interações</p>
          </div>
          <v-btn variant="text" color="primary" size="small">
            Ver todos
            <v-icon end size="18">mdi-arrow-right</v-icon>
          </v-btn>
        </div>
        <RecentLeads :leads="recentLeads" @lead-click="openLeadDetails" />
      </div>

      <div class="quick-actions-container">
        <div class="section-header">
          <h3 class="section-title">Ações Rápidas</h3>
        </div>
        <div class="quick-actions">
          <div class="action-card" @click="createNewLead">
            <div class="action-icon primary">
              <v-icon size="24">mdi-account-plus</v-icon>
            </div>
            <div class="action-content">
              <h4>Novo Lead</h4>
              <p>Adicionar contato</p>
            </div>
          </div>

          <div class="action-card" @click="sendBroadcast">
            <div class="action-icon success">
              <v-icon size="24">mdi-bullhorn</v-icon>
            </div>
            <div class="action-content">
              <h4>Campanha</h4>
              <p>Enviar mensagem</p>
            </div>
          </div>

          <div class="action-card" @click="viewAnalytics">
            <div class="action-icon warning">
              <v-icon size="24">mdi-chart-box</v-icon>
            </div>
            <div class="action-content">
              <h4>Analytics</h4>
              <p>Ver relatórios</p>
            </div>
          </div>

          <div class="action-card" @click="openAutomations">
            <div class="action-icon info">
              <v-icon size="24">mdi-robot</v-icon>
            </div>
            <div class="action-content">
              <h4>Automação</h4>
              <p>Configurar fluxo</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="metrics-grid">
      <div class="metric-card glass">
        <div class="metric-header">
          <v-icon color="primary" size="20">mdi-clock-outline</v-icon>
          <span class="metric-label">Tempo Médio de Resposta</span>
        </div>
        <div class="metric-value">2.5 min</div>
        <div class="metric-trend positive">
          <v-icon size="14">mdi-trending-down</v-icon>
          <span>15% mais rápido</span>
        </div>
      </div>

      <div class="metric-card glass">
        <div class="metric-header">
          <v-icon color="success" size="20">mdi-check-circle</v-icon>
          <span class="metric-label">Taxa de Fechamento</span>
        </div>
        <div class="metric-value">34.2%</div>
        <div class="metric-trend positive">
          <v-icon size="14">mdi-trending-up</v-icon>
          <span>+5.3% este mês</span>
        </div>
      </div>

      <div class="metric-card glass">
        <div class="metric-header">
          <v-icon color="warning" size="20">mdi-currency-usd</v-icon>
          <span class="metric-label">Ticket Médio</span>
        </div>
        <div class="metric-value">R$ 1.850</div>
        <div class="metric-trend positive">
          <v-icon size="14">mdi-trending-up</v-icon>
          <span>+12% vs mês anterior</span>
        </div>
      </div>

      <div class="metric-card glass">
        <div class="metric-header">
          <v-icon color="info" size="20">mdi-account-group</v-icon>
          <span class="metric-label">Leads Ativos</span>
        </div>
        <div class="metric-value">{{ crmStats.totalLeads - crmStats.closedDeals }}</div>
        <div class="metric-trend neutral">
          <v-icon size="14">mdi-minus</v-icon>
          <span>Estável</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StatCard from '@/components/dashboard/StatCard.vue'
import ChartLine from '@/components/dashboard/ChartLine.vue'
import ChartBar from '@/components/dashboard/ChartBar.vue'
import RecentLeads from '@/components/dashboard/RecentLeads.vue'
import { useCrmStore } from '@/store/crm'

export default {
  name: 'DashboardNexus',
  components: {
    StatCard,
    ChartLine,
    ChartBar,
    RecentLeads
  },
  setup() {
    const crmStore = useCrmStore()
    return { crmStore }
  },
  data: () => ({
    chartPeriod: 'week',
    messageFlowData: [
      {
        name: 'Mensagens',
        data: [45, 52, 38, 65, 49, 58, 72]
      }
    ],
  }),
  computed: {
    crmStats() {
      return this.crmStore.getStats
    },
    conversionData() {
      const data = this.crmStore.getFunnelData
      return [
        {
          name: 'Leads',
          data: data.map(d => d.count)
        }
      ]
    },
    funnelStages() {
      return this.crmStore.columns.map(c => c.name)
    },
    recentLeads() {
      return [...this.crmStore.getAllLeads]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(l => ({
          ...l,
          avatar: l.name?.charAt(0) || '?',
          status: this.crmStore.getColumnName(l.stage),
          timestamp: this.formatRelativeTime(l.updatedAt),
          color: this.getLeadColor(l.stage)
        }))
    },
    chartCategories() {
      if (this.chartPeriod === 'week') {
        return ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
      } else if (this.chartPeriod === 'month') {
        return Array.from({ length: 30 }, (_, i) => `${i + 1}`)
      } else {
        return ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      }
    }
  },
  methods: {
    formatRelativeTime(date) {
      const d = new Date(date)
      const now = new Date()
      const diff = now - d
      const minutes = Math.floor(diff / 60000)
      if (minutes < 1) return 'agora'
      if (minutes < 60) return `há ${minutes} min`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `há ${hours} h`
      return d.toLocaleDateString('pt-BR')
    },
    getLeadColor(stage) {
      const colors = {
        novo: '#a855f7',
        contato: '#3b82f6',
        proposta: '#10b981',
        negociacao: '#f59e0b',
        fechado: '#10b981'
      }
      return colors[stage] || '#a855f7'
    },
    openLeadDetails(lead) {
      this.$router.push({ name: 'crm', query: { leadId: lead.id } })
    },
    createNewLead() {
      this.$router.push({ name: 'crm', query: { action: 'new-lead' } })
    },
    sendBroadcast() {
      this.$router.push({ name: 'crm', query: { tab: 'automations' } })
    },
    viewAnalytics() {
      this.$router.push({ name: 'crm', query: { tab: 'analytics' } })
    },
    openAutomations() {
      this.$router.push({ name: 'crm', query: { tab: 'automations' } })
    }
  },
  mounted() {
    this.crmStore.loadFromLocalStorage()
  }
}
</script>

<style scoped>
.dashboard-nexus {
  min-height: 100vh;
  padding: 24px;
  background: #0f0f1a;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.chart-container {
  background: linear-gradient(145deg, rgba(26, 26, 46, 0.8), rgba(20, 20, 35, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.chart-container:hover {
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.chart-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.chart-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0;
}

.period-toggle {
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 8px;
}

.period-toggle :deep(.v-btn) {
  color: rgba(255, 255, 255, 0.6);
  text-transform: none;
  font-weight: 500;
}

.period-toggle :deep(.v-btn--active) {
  background: rgba(168, 85, 247, 0.3);
  color: #a855f7;
}

/* Activity Section */
.activity-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.recent-leads-container,
.quick-actions-container {
  background: linear-gradient(145deg, rgba(26, 26, 46, 0.8), rgba(20, 20, 35, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.section-subtitle {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  background: rgba(168, 85, 247, 0.08);
  border-color: rgba(168, 85, 247, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.15);
}

.action-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.action-icon.primary {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}

.action-icon.success {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.action-icon.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.action-icon.info {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.action-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 4px;
}

.action-content p {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.metric-card {
  background: linear-gradient(145deg, rgba(26, 26, 46, 0.8), rgba(20, 20, 35, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 0 8px 32px rgba(168, 85, 247, 0.1);
  transform: translateY(-2px);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.metric-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.metric-trend.positive {
  color: #10b981;
}

.metric-trend.negative {
  color: #ef4444;
}

.metric-trend.neutral {
  color: rgba(255, 255, 255, 0.5);
}

/* Glass Effect */
.glass {
  background: linear-gradient(145deg, rgba(26, 26, 46, 0.6), rgba(20, 20, 35, 0.8));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Responsive */
@media (max-width: 1200px) {
  .activity-section {
    grid-template-columns: 1fr;
  }
  
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-nexus {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}
</style>
