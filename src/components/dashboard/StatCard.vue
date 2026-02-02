<template>
  <div class="stat-card glass" :class="`stat-card-${color}`">
    <div class="stat-icon-wrapper">
      <div class="stat-icon" :class="`icon-${color}`">
        <v-icon size="28" :color="color">{{ icon }}</v-icon>
      </div>
    </div>
    
    <div class="stat-content">
      <span class="stat-label">{{ title }}</span>
      <div class="stat-value-row">
        <span class="stat-value" ref="valueElement">{{ displayValue }}</span>
        <span v-if="trend" class="stat-trend" :class="trendClass">
          <v-icon size="14">{{ trendIcon }}</v-icon>
          {{ trend }}
        </span>
      </div>
    </div>

    <div class="stat-glow" :class="`glow-${color}`"></div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    title: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    color: {
      type: String,
      default: 'primary'
    },
    trend: {
      type: String,
      default: null
    }
  },
  data: () => ({
    displayValue: 0,
    animationDuration: 1500
  }),
  computed: {
    trendClass() {
      if (!this.trend) return ''
      return this.trend.startsWith('+') ? 'trend-up' : this.trend.startsWith('-') ? 'trend-down' : 'trend-neutral'
    },
    trendIcon() {
      if (!this.trend) return ''
      return this.trend.startsWith('+') ? 'mdi-trending-up' : this.trend.startsWith('-') ? 'mdi-trending-down' : 'mdi-minus'
    }
  },
  methods: {
    animateValue() {
      const numericValue = typeof this.value === 'string' ? parseFloat(this.value.replace(/[^\d.-]/g, '')) : this.value
      
      if (isNaN(numericValue)) {
        this.displayValue = this.value
        return
      }

      const start = 0
      const end = numericValue
      const duration = this.animationDuration
      const startTime = performance.now()

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Easing function (ease-out cubic)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        const current = start + (end - start) * easeOut

        // Format based on original value type
        if (typeof this.value === 'string' && this.value.includes('%')) {
          this.displayValue = `${current.toFixed(1)}%`
        } else if (typeof this.value === 'string' && this.value.includes('R$')) {
          this.displayValue = `R$ ${Math.round(current)}`
        } else {
          this.displayValue = Math.round(current)
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          this.displayValue = this.value
        }
      }

      requestAnimationFrame(animate)
    }
  },
  mounted() {
    this.animateValue()
  },
  watch: {
    value() {
      this.animateValue()
    }
  }
}
</script>

<style scoped>
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(145deg, rgba(26, 26, 46, 0.8), rgba(20, 20, 35, 0.9));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 12px 40px rgba(168, 85, 247, 0.2);
}

.stat-card:hover .stat-glow {
  opacity: 0.6;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

/* Icon Wrapper */
.stat-icon-wrapper {
  flex-shrink: 0;
}

.stat-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  opacity: 0.2;
  filter: blur(10px);
}

.icon-primary {
  background: rgba(168, 85, 247, 0.15);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
}

.icon-success {
  background: rgba(16, 185, 129, 0.15);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
}

.icon-warning {
  background: rgba(245, 158, 11, 0.15);
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
}

.icon-info {
  background: rgba(59, 130, 246, 0.15);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
}

/* Content */
.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  background: linear-gradient(135deg, #fff 0%, rgba(168, 85, 247, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.trend-up {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.trend-down {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.trend-neutral {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
}

/* Glow Effect */
.stat-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(60px);
}

.glow-primary {
  background: radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
}

.glow-success {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%);
}

.glow-warning {
  background: radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 70%);
}

.glow-info {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
}

/* Responsive */
@media (max-width: 768px) {
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 56px;
    height: 56px;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
}
</style>
