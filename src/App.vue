<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initialize()
})
</script>

<style lang="scss">
// Gap utilities
@for $i from 0 through 8 {
  .gap-x-#{$i} {
    column-gap: #{$i * 0.25}rem;
  }
  .gap-y-#{$i} {
    row-gap: #{$i * 0.25}rem;
  }
  .gap-#{$i} {
    gap: #{$i * 0.25}rem;
  }
}

// Premium Global Styles
:root {
  // Colors
  --color-bg-primary: #0f0f1a;
  --color-bg-secondary: #1a1a2e;
  --color-bg-tertiary: #16213e;
  --color-accent-primary: #a855f7;
  --color-accent-secondary: #d946ef;
  --color-success: #10b981;
  --color-error: #ef4444;
  --color-warning: #f59e0b;
  --color-info: #3b82f6;
  
  // Premium card styles
  --card-bg: linear-gradient(145deg, rgba(30, 30, 45, 0.8), rgba(25, 25, 40, 0.9));
  --card-border: 1px solid rgba(255, 255, 255, 0.06);
  --card-radius: 16px;
  
  // Glassmorphism
  --glass-blur: blur(20px);
}

// Global scrollbar styling
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(168, 85, 247, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.5);
}

// Premium selection
::selection {
  background: rgba(102, 126, 234, 0.3);
  color: #fff;
}

// Body styling for dark theme
body {
  background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: 100vh;
}

// V-App dark theme enhancements
.v-application {
  background: transparent !important;
}

// Premium transitions
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

// Premium card global styles
.v-theme--dark {
  .v-card {
    background: var(--card-bg) !important;
    border: var(--card-border) !important;
    border-radius: var(--card-radius) !important;
    backdrop-filter: var(--glass-blur);
  }
  
  .v-expansion-panel {
    background: var(--card-bg) !important;
    border: var(--card-border) !important;
    border-radius: 12px !important;
    margin-bottom: 8px;
  }
  
  .v-dialog .v-card {
    background: linear-gradient(180deg, rgba(25, 25, 40, 0.98), rgba(20, 20, 35, 0.99)) !important;
  }
  
  .v-text-field .v-field,
  .v-select .v-field,
  .v-textarea .v-field {
    background: rgba(255, 255, 255, 0.03) !important;
    border-radius: 12px !important;
  }
  
  .v-list {
    background: rgba(25, 25, 40, 0.98) !important;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    backdrop-filter: blur(20px);
  }
  
  .v-menu > .v-overlay__content {
    border-radius: 12px !important;
  }
  
  .v-btn {
    text-transform: none;
    font-weight: 500;
    letter-spacing: 0.2px;
  }
}

// Premium button animations
.v-btn:not(.v-btn--icon):not(.v-btn--disabled) {
  transition: all 0.3s ease !important;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

// Premium chip styles
.v-chip {
  font-weight: 500 !important;
}

// Premium alert styles
.v-theme--dark .v-alert {
  background: var(--card-bg) !important;
  border: var(--card-border) !important;
  border-radius: var(--card-radius) !important;
}

// Utility classes
.gradient-text {
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #c4b5fd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-card {
  background: var(--card-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--card-border);
  border-radius: var(--card-radius);
}

.premium-shadow {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

// Animation keyframes
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-15px) scale(1.02); }
}

@keyframes pulse-glow {
  0%, 100% { 
    opacity: 1;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  }
  50% { 
    opacity: 0.8;
    box-shadow: 0 0 30px rgba(102, 126, 234, 0.8);
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
</style>
