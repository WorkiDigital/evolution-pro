<template>
  <div class="analytics-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div>
        <h3 class="section-title">
          <v-icon class="mr-2">mdi-chart-areaspline</v-icon>
          Dashboard Analytics
        </h3>
        <p class="section-subtitle">Visão geral do seu pipeline de vendas</p>
      </div>
      
      <div class="d-flex gap-2">
        <v-btn-toggle v-model="period" mandatory density="compact" class="period-toggle">
          <v-btn value="week" size="small">7 dias</v-btn>
          <v-btn value="month" size="small">30 dias</v-btn>
          <v-btn value="quarter" size="small">90 dias</v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon primary">
          <v-icon size="24">mdi-account-group</v-icon>
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ stats.totalLeads }}</span>
          <span class="kpi-label">Total de Leads</span>
          <div class="kpi-trend up" v-if="stats.newThisWeek > 0">
            <v-icon size="12">mdi-trending-up</v-icon>
            +{{ stats.newThisWeek }} esta semana
          </div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon success">
          <v-icon size="24">mdi-currency-usd</v-icon>
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ formatCurrency(stats.totalValue) }}</span>
          <span class="kpi-label">Valor no Pipeline</span>
          <div class="kpi-trend">
            {{ formatCurrency(stats.averageDealSize) }} média
          </div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon warning">
          <v-icon size="24">mdi-trophy</v-icon>
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ stats.closedDeals }}</span>
          <span class="kpi-label">Negócios Fechados</span>
          <div class="kpi-trend up">
            {{ formatCurrency(stats.closedValue) }} total
          </div>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-icon info">
          <v-icon size="24">mdi-percent</v-icon>
        </div>
        <div class="kpi-content">
          <span class="kpi-value">{{ stats.conversionRate }}%</span>
          <span class="kpi-label">Taxa de Conversão</span>
          <v-progress-linear
            :model-value="stats.conversionRate"
            color="info"
            height="4"
            rounded
            class="mt-2"
          ></v-progress-linear>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid">
      <!-- Funnel Chart -->
      <div class="chart-card">
        <h4 class="chart-title">
          <v-icon class="mr-2" size="20">mdi-filter</v-icon>
          Funil de Vendas
        </h4>
        <div class="funnel-chart">
          <div
            v-for="(stage, index) in funnelData"
            :key="stage.id"
            class="funnel-stage"
            :style="{ width: getFunnelWidth(index) + '%' }"
          >
            <div class="funnel-bar" :style="{ background: getStageGradient(stage.color) }">
              <div class="funnel-content">
                <span class="funnel-name">{{ stage.name }}</span>
                <span class="funnel-value">{{ stage.count }} leads</span>
              </div>
            </div>
            <div class="funnel-amount">{{ formatCurrency(stage.value) }}</div>
            <div class="funnel-conversion" v-if="index > 0">
              {{ getConversionRate(index) }}% conv.
            </div>
          </div>
        </div>
      </div>

      <!-- Pipeline Value by Stage -->
      <div class="chart-card">
        <h4 class="chart-title">
          <v-icon class="mr-2" size="20">mdi-chart-donut</v-icon>
          Valor por Estágio
        </h4>
        <apexchart
          type="donut"
          height="280"
          :options="donutOptions"
          :series="donutSeries"
        ></apexchart>
      </div>
    </div>

    <!-- Second Charts Row -->
    <div class="charts-grid">
      <!-- Leads Trend -->
      <div class="chart-card wide">
        <h4 class="chart-title">
          <v-icon class="mr-2" size="20">mdi-chart-line</v-icon>
          Tendência de Leads
        </h4>
        <apexchart
          type="area"
          height="280"
          :options="trendOptions"
          :series="trendSeries"
        ></apexchart>
      </div>

      <!-- Source Distribution -->
      <div class="chart-card">
        <h4 class="chart-title">
          <v-icon class="mr-2" size="20">mdi-source-branch</v-icon>
          Origem dos Leads
        </h4>
        <apexchart
          type="bar"
          height="280"
          :options="sourceOptions"
          :series="sourceSeries"
        ></apexchart>
      </div>
    </div>

    <!-- Performance Metrics -->
    <div class="metrics-section">
      <h4 class="chart-title mb-4">
        <v-icon class="mr-2" size="20">mdi-speedometer</v-icon>
        Métricas de Performance
      </h4>
      
      <div class="metrics-grid">
        <div class="metric-item">
          <div class="metric-header">
            <span class="metric-label">Tempo médio de fechamento</span>
            <span class="metric-value">{{ avgClosingTime }} dias</span>
          </div>
          <v-progress-linear :model-value="getMetricProgress(avgClosingTime, 30)" color="primary" height="6" rounded></v-progress-linear>
        </div>

        <div class="metric-item">
          <div class="metric-header">
            <span class="metric-label">Leads com alta prioridade</span>
            <span class="metric-value">{{ stats.highPriorityCount }}</span>
          </div>
          <v-progress-linear :model-value="(stats.highPriorityCount / stats.totalLeads) * 100" color="error" height="6" rounded></v-progress-linear>
        </div>

        <div class="metric-item">
          <div class="metric-header">
            <span class="metric-label">Score médio dos leads</span>
            <span class="metric-value">{{ stats.averageScore }}/100</span>
          </div>
          <v-progress-linear :model-value="stats.averageScore" color="success" height="6" rounded></v-progress-linear>
        </div>

        <div class="metric-item">
          <div class="metric-header">
            <span class="metric-label">Leads sem atividade (7 dias)</span>
            <span class="metric-value">{{ inactiveLeadsCount }}</span>
          </div>
          <v-progress-linear :model-value="(inactiveLeadsCount / stats.totalLeads) * 100" color="warning" height="6" rounded></v-progress-linear>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useCrmStore } from '@/store/crm'
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'AnalyticsDashboard',
  components: {
    apexchart: VueApexCharts
  },
  setup() {
    const crmStore = useCrmStore()
    return { crmStore }
  },
  data: () => ({
    period: 'month'
  }),
  computed: {
    stats() {
      return this.crmStore.getStats
    },
    funnelData() {
      return this.crmStore.getFunnelData
    },
    avgClosingTime() {
      // Simulated - would calculate from actual data
      return 12
    },
    inactiveLeadsCount() {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return this.crmStore.getAllLeads.filter(l => 
        new Date(l.updatedAt) < weekAgo && l.stage !== 'fechado'
      ).length
    },
    // Donut Chart
    donutSeries() {
      return this.funnelData.map(s => s.value || 0)
    },
    donutOptions() {
      return {
        chart: {
          type: 'donut',
          background: 'transparent'
        },
        labels: this.funnelData.map(s => s.name),
        colors: ['#667eea', '#a855f7', '#fb923c', '#fbbf24', '#34d399'],
        legend: {
          position: 'bottom',
          labels: { colors: '#fff' }
        },
        dataLabels: {
          enabled: true,
          formatter: (val) => val.toFixed(0) + '%',
          style: { colors: ['#fff'] }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '65%',
              labels: {
                show: true,
                total: {
                  show: true,
                  label: 'Total',
                  color: '#fff',
                  formatter: () => this.formatCurrency(this.stats.totalValue)
                }
              }
            }
          }
        },
        stroke: { show: false },
        theme: { mode: 'dark' }
      }
    },
    // Trend Chart
    trendSeries() {
      return [{
        name: 'Leads',
        data: this.generateTrendData()
      }]
    },
    trendOptions() {
      return {
        chart: {
          type: 'area',
          toolbar: { show: false },
          background: 'transparent',
          sparkline: { enabled: false }
        },
        colors: ['#667eea'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.5,
            opacityTo: 0.1,
            stops: [0, 100]
          }
        },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
          categories: this.generateDateLabels(),
          labels: { style: { colors: '#888' } },
          axisBorder: { show: false },
          axisTicks: { show: false }
        },
        yaxis: {
          labels: { style: { colors: '#888' } }
        },
        grid: {
          borderColor: 'rgba(255,255,255,0.05)',
          strokeDashArray: 4
        },
        tooltip: { theme: 'dark' },
        dataLabels: { enabled: false }
      }
    },
    // Source Chart
    sourceSeries() {
      return [{ name: 'Leads', data: this.getSourceData().map(s => s.count) }]
    },
    sourceOptions() {
      return {
        chart: {
          type: 'bar',
          toolbar: { show: false },
          background: 'transparent'
        },
        colors: ['#667eea'],
        plotOptions: {
          bar: {
            borderRadius: 8,
            horizontal: true,
            distributed: true
          }
        },
        xaxis: {
          categories: this.getSourceData().map(s => s.name),
          labels: { style: { colors: '#888' } }
        },
        yaxis: {
          labels: { style: { colors: '#fff' } }
        },
        grid: {
          borderColor: 'rgba(255,255,255,0.05)'
        },
        legend: { show: false },
        tooltip: { theme: 'dark' },
        dataLabels: {
          enabled: true,
          style: { colors: ['#fff'] }
        }
      }
    }
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value || 0)
    },
    getFunnelWidth(index) {
      const base = 100
      const reduction = index * 12
      return Math.max(base - reduction, 40)
    },
    getStageGradient(color) {
      const colors = {
        blue: 'linear-gradient(90deg, #667eea, #764ba2)',
        purple: 'linear-gradient(90deg, #a855f7, #7c3aed)',
        orange: 'linear-gradient(90deg, #fb923c, #f97316)',
        amber: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
        green: 'linear-gradient(90deg, #34d399, #10b981)'
      }
      return colors[color] || colors.blue
    },
    getConversionRate(index) {
      if (index === 0) return 100
      const prev = this.funnelData[index - 1]?.count || 1
      const current = this.funnelData[index]?.count || 0
      return prev > 0 ? Math.round((current / prev) * 100) : 0
    },
    getMetricProgress(value, max) {
      return Math.min((value / max) * 100, 100)
    },
    generateTrendData() {
      // Generate realistic trend data based on period
      const days = this.period === 'week' ? 7 : this.period === 'month' ? 30 : 90
      const data = []
      const baseLeads = this.stats.totalLeads
      
      for (let i = 0; i < Math.min(days, 12); i++) {
        const variation = Math.floor(Math.random() * 5) - 2
        data.push(Math.max(0, Math.floor(baseLeads / 10) + variation))
      }
      return data
    },
    generateDateLabels() {
      const days = this.period === 'week' ? 7 : this.period === 'month' ? 30 : 90
      const labels = []
      const step = Math.ceil(days / 12)
      
      for (let i = 0; i < Math.min(days, 12); i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - (i * step)))
        labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }))
      }
      return labels
    },
    getSourceData() {
      const sources = {}
      this.crmStore.getAllLeads.forEach(lead => {
        const source = lead.source || 'Outro'
        sources[source] = (sources[source] || 0) + 1
      })
      
      return Object.entries(sources)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
    }
  }
}
</script>

<style scoped>
.analytics-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
}

.section-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 4px;
}

.period-toggle {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  padding: 4px;
}

.period-toggle .v-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 8px !important;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.kpi-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.8), rgba(25, 25, 40, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(102, 126, 234, 0.3);
}

.kpi-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon.primary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  color: #a5b4fc;
}

.kpi-icon.success {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(16, 185, 129, 0.2));
  color: #6ee7b7;
}

.kpi-icon.warning {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2));
  color: #fcd34d;
}

.kpi-icon.info {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.2));
  color: #7dd3fc;
}

.kpi-content {
  display: flex;
  flex-direction: column;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.kpi-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 6px;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 8px;
}

.kpi-trend.up {
  color: #6ee7b7;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-card {
  padding: 24px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.8), rgba(25, 25, 40, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.chart-card.wide {
  grid-column: span 2;
}

.chart-title {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 20px;
}

/* Funnel Chart */
.funnel-chart {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.funnel-stage {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 auto;
  transition: width 0.3s ease;
}

.funnel-bar {
  flex: 1;
  padding: 16px 20px;
  border-radius: 10px;
  min-height: 50px;
}

.funnel-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.funnel-name {
  font-weight: 600;
  color: #fff;
}

.funnel-value {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}

.funnel-amount {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6ee7b7;
  min-width: 80px;
  text-align: right;
}

.funnel-conversion {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
  min-width: 60px;
}

/* Metrics Section */
.metrics-section {
  padding: 24px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.8), rgba(25, 25, 40, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.metric-item {
  padding: 16px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.metric-value {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
}

/* Responsive */
@media (max-width: 900px) {
  .chart-card.wide {
    grid-column: span 1;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
