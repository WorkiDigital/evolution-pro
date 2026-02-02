<template>
  <div class="recent-leads-list">
    <div v-for="lead in leads" :key="lead.id" class="lead-item" @click="$emit('lead-click', lead)">
      <v-avatar :color="lead.color || 'primary'" size="40" class="lead-avatar">
        <span class="text-white text-subtitle-2">{{ lead.avatar }}</span>
      </v-avatar>
      
      <div class="lead-info">
        <div class="lead-name-row">
          <span class="lead-name">{{ lead.name }}</span>
          <span class="lead-time">{{ lead.timestamp }}</span>
        </div>
        <div class="lead-status-row">
          <v-chip size="x-small" :color="getStatusColor(lead.status)" variant="flat" class="status-chip">
            {{ lead.status }}
          </v-chip>
          <div v-if="lead.priority === 'high'" class="priority-indicator">
            <v-icon size="12" color="error">mdi-fire</v-icon>
            Alta Prioridade
          </div>
        </div>
      </div>

      <v-btn icon="mdi-whatsapp" variant="text" size="small" color="success" class="action-btn"></v-btn>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecentLeads',
  props: {
    leads: {
      type: Array,
      required: true
    }
  },
  methods: {
    getStatusColor(status) {
      const colors = {
        'Em atendimento': 'primary',
        'Aguardando resposta': 'warning',
        'Proposta enviada': 'success',
        'Novo contato': 'info',
        'Em negociação': 'secondary'
      }
      return colors[status] || 'grey'
    }
  }
}
</script>

<style scoped>
.recent-leads-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lead-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lead-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(168, 85, 247, 0.3);
  transform: translateX(4px);
}

.lead-avatar {
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.lead-info {
  flex: 1;
  min-width: 0;
}

.lead-name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.lead-name {
  font-weight: 600;
  color: #fff;
  font-size: 0.95rem;
}

.lead-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

.lead-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-chip {
  font-weight: 600;
  letter-spacing: 0.2px;
}

.priority-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: #ef4444;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-btn {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lead-item:hover .action-btn {
  opacity: 1;
}
</style>
