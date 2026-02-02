<template>
  <v-card
    class="lead-card"
    :class="{ 'dragging': isDragging, 'priority-high': lead.priority === 'high', 'priority-medium': lead.priority === 'medium' }"
    variant="flat"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @click="$emit('click', lead)"
  >
    <!-- Priority indicator -->
    <div class="priority-indicator" :class="`priority-${lead.priority || 'normal'}`"></div>
    
    <v-card-text class="pa-4">
      <!-- Header with avatar and actions -->
      <div class="d-flex align-center mb-3">
        <div class="avatar-container">
          <v-avatar 
            size="48" 
            :color="getAvatarColor(lead.name)" 
            class="lead-avatar"
          >
            <v-img v-if="lead.profilePictureUrl" :src="lead.profilePictureUrl" />
            <span v-else class="text-white font-weight-bold text-body-1">{{ getInitials(lead.name) }}</span>
          </v-avatar>
          <div class="online-indicator" v-if="isRecentlyActive"></div>
        </div>
        
        <div class="flex-grow-1 ml-3">
          <div class="lead-name text-subtitle-1 font-weight-bold">{{ lead.name }}</div>
          <div class="lead-phone text-caption">
            <v-icon size="12" class="mr-1">mdi-phone</v-icon>
            {{ lead.phone }}
          </div>
        </div>

        <!-- Quick actions -->
        <div class="quick-actions">
          <v-btn
            icon
            size="x-small"
            variant="text"
            class="action-btn"
            :href="`https://wa.me/${cleanPhone(lead.phone)}`"
            target="_blank"
            @click.stop
          >
            <v-icon color="success" size="18">mdi-whatsapp</v-icon>
            <v-tooltip activator="parent" location="top">Enviar WhatsApp</v-tooltip>
          </v-btn>
          <v-btn
            icon
            size="x-small"
            variant="text"
            class="action-btn"
            @click.stop="$emit('quick-call', lead)"
          >
            <v-icon size="18">mdi-phone-outline</v-icon>
            <v-tooltip activator="parent" location="top">Ligar</v-tooltip>
          </v-btn>
        </div>
      </div>

      <!-- Lead info -->
      <div v-if="lead.email" class="info-row mb-2">
        <v-icon size="14" class="mr-2 text-medium-emphasis">mdi-email-outline</v-icon>
        <span class="text-caption text-medium-emphasis text-truncate">{{ lead.email }}</span>
      </div>

      <!-- Value and source -->
      <div class="d-flex align-center justify-space-between mb-3">
        <v-chip
          size="small"
          variant="flat"
          :color="getSourceColor(lead.source)"
          class="source-chip"
        >
          <v-icon start size="12">{{ getSourceIcon(lead.source) }}</v-icon>
          {{ lead.source }}
        </v-chip>
        
        <div v-if="lead.value" class="value-badge">
          <v-icon size="14" class="mr-1">mdi-currency-usd</v-icon>
          {{ formatCurrency(lead.value) }}
        </div>
      </div>

      <!-- Tags -->
      <div v-if="lead.tags && lead.tags.length" class="tags-container mb-3">
        <v-chip
          v-for="tag in visibleTags"
          :key="tag"
          size="x-small"
          variant="tonal"
          class="tag-chip mr-1 mb-1"
          :color="getTagColor(tag)"
        >
          {{ tag }}
        </v-chip>
        <v-chip
          v-if="lead.tags.length > 2"
          size="x-small"
          variant="outlined"
          class="mr-1 mb-1"
        >
          +{{ lead.tags.length - 2 }}
        </v-chip>
      </div>

      <!-- Score and activity -->
      <div class="d-flex align-center justify-space-between">
        <div class="lead-score" v-if="lead.score">
          <v-progress-circular
            :model-value="lead.score"
            :size="24"
            :width="3"
            :color="getScoreColor(lead.score)"
          >
            <span class="text-caption">{{ lead.score }}</span>
          </v-progress-circular>
          <span class="text-caption ml-2 text-medium-emphasis">Score</span>
        </div>
        
        <div class="activity-info text-caption text-medium-emphasis">
          <v-icon size="12" class="mr-1">mdi-clock-outline</v-icon>
          {{ formatDate(lead.updatedAt) }}
        </div>
      </div>

      <!-- Notes indicator -->
      <div v-if="lead.notes && lead.notes.length > 0" class="notes-indicator mt-2">
        <v-icon size="12" class="mr-1">mdi-note-text-outline</v-icon>
        <span class="text-caption">{{ lead.notes.length }} nota(s)</span>
      </div>
    </v-card-text>

    <!-- Bottom gradient -->
    <div class="card-gradient"></div>
  </v-card>
</template>

<script>
export default {
  name: 'LeadCard',
  props: {
    lead: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    isDragging: false
  }),
  computed: {
    visibleTags() {
      return (this.lead.tags || []).slice(0, 2)
    },
    isRecentlyActive() {
      if (!this.lead.lastMessageDate) return false
      const diff = Date.now() - new Date(this.lead.lastMessageDate).getTime()
      return diff < 24 * 60 * 60 * 1000 // 24 hours
    }
  },
  methods: {
    getInitials(name) {
      return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    },
    getAvatarColor(name) {
      const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', 
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#fa709a', '#fee140', '#a8edea', '#fed6e3'
      ]
      const index = name.charCodeAt(0) % colors.length
      return colors[index]
    },
    getSourceColor(source) {
      const colors = {
        'WhatsApp': 'success',
        'Site': 'info',
        'Indicação': 'purple',
        'Manual': 'grey',
        'Redes Sociais': 'pink',
        'Telefone': 'warning',
        'Email': 'blue'
      }
      return colors[source] || 'grey'
    },
    getSourceIcon(source) {
      const icons = {
        'WhatsApp': 'mdi-whatsapp',
        'Site': 'mdi-web',
        'Indicação': 'mdi-account-arrow-right',
        'Manual': 'mdi-pencil',
        'Redes Sociais': 'mdi-instagram',
        'Telefone': 'mdi-phone',
        'Email': 'mdi-email'
      }
      return icons[source] || 'mdi-help-circle'
    },
    getTagColor(tag) {
      const tagLower = tag.toLowerCase()
      if (tagLower.includes('hot') || tagLower.includes('quente')) return 'error'
      if (tagLower.includes('vip') || tagLower.includes('premium')) return 'warning'
      if (tagLower.includes('novo') || tagLower.includes('new')) return 'success'
      return 'primary'
    },
    getScoreColor(score) {
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
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    },
    formatDate(date) {
      const d = new Date(date)
      const now = new Date()
      const diff = now - d
      const minutes = Math.floor(diff / (1000 * 60))
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutes < 1) return 'Agora'
      if (minutes < 60) return `${minutes}min`
      if (hours < 24) return `${hours}h`
      if (days < 7) return `${days}d`
      return d.toLocaleDateString('pt-BR')
    },
    onDragStart(e) {
      this.isDragging = true
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('leadId', this.lead.id)
      
      // Add custom drag image
      const dragImage = e.target.cloneNode(true)
      dragImage.style.opacity = '0.8'
      dragImage.style.transform = 'rotate(3deg)'
      document.body.appendChild(dragImage)
      e.dataTransfer.setDragImage(dragImage, 50, 50)
      setTimeout(() => document.body.removeChild(dragImage), 0)
    },
    onDragEnd() {
      this.isDragging = false
    }
  }
}
</script>

<style scoped>
.lead-card {
  position: relative;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(145deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 30, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}

.lead-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
}

.lead-card:active {
  cursor: grabbing;
}

.lead-card.dragging {
  opacity: 0.5;
  transform: rotate(3deg) scale(1.05);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}

/* Priority indicator */
.priority-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, transparent);
  transition: all 0.3s ease;
}

.priority-indicator.priority-high {
  background: linear-gradient(90deg, #ff4757, #ff6b81);
  box-shadow: 0 0 20px rgba(255, 71, 87, 0.5);
}

.priority-indicator.priority-medium {
  background: linear-gradient(90deg, #ffa502, #ff7f50);
  box-shadow: 0 0 20px rgba(255, 165, 2, 0.5);
}

.priority-indicator.priority-normal {
  background: linear-gradient(90deg, #2ed573, #7bed9f);
}

/* Avatar */
.avatar-container {
  position: relative;
}

.lead-avatar {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #2ed573, #7bed9f);
  border-radius: 50%;
  border: 2px solid rgba(30, 30, 40, 0.95);
  box-shadow: 0 0 10px rgba(46, 213, 115, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

/* Lead name */
.lead-name {
  color: #fff;
  line-height: 1.3;
}

.lead-phone {
  color: rgba(255, 255, 255, 0.6);
}

/* Quick actions */
.quick-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
}

.lead-card:hover .quick-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Info row */
.info-row {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

/* Source chip */
.source-chip {
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* Value badge */
.value-badge {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  background: linear-gradient(135deg, rgba(46, 213, 115, 0.2), rgba(123, 237, 159, 0.1));
  border: 1px solid rgba(46, 213, 115, 0.3);
  border-radius: 20px;
  color: #7bed9f;
  font-weight: 700;
  font-size: 0.85rem;
}

/* Tags */
.tags-container {
  display: flex;
  flex-wrap: wrap;
}

.tag-chip {
  font-size: 0.7rem;
  font-weight: 500;
}

/* Score */
.lead-score {
  display: flex;
  align-items: center;
}

/* Activity info */
.activity-info {
  display: flex;
  align-items: center;
  opacity: 0.7;
}

/* Notes indicator */
.notes-indicator {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.7);
}

/* Bottom gradient */
.card-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to top, rgba(20, 20, 30, 0.8), transparent);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.lead-card:hover .card-gradient {
  opacity: 1;
}

/* Light theme */
:deep(.v-theme--light) .lead-card {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.98));
  border: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.v-theme--light) .lead-name {
  color: #1a1a2e;
}

:deep(.v-theme--light) .lead-phone {
  color: rgba(0, 0, 0, 0.6);
}
</style>
