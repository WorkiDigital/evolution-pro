<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="rail = false"
    class="nexus-sidebar"
    elevation="0"
  >
    <div class="sidebar-header">
      <v-list-item
        :prepend-avatar="userAvatar"
        :title="userName"
        :subtitle="userEmail"
        nav
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>
    </div>

    <v-divider class="mx-3 my-2 opacity-20"></v-divider>

    <div class="px-3 py-2" v-if="!rail">
      <v-btn
        block
        color="primary"
        prepend-icon="mdi-plus-circle"
        class="new-connection-btn"
        @click="$router.push({ name: 'instances', query: { action: 'add' } })"
      >
        Criar Instância
      </v-btn>
    </div>

    <v-list density="compact" nav class="sidebar-list">
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.value"
        :to="item.to"
        active-color="primary"
        class="menu-item"
      >
        <v-tooltip
          v-if="rail"
          activator="parent"
          location="right"
        >
          {{ item.title }}
        </v-tooltip>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-list-item
          prepend-icon="mdi-logout"
          title="Sair"
          value="logout"
          class="menu-item logout-item"
          @click="handleLogout"
        ></v-list-item>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { useAuthStore } from '@/store/auth'

export default {
  name: "SideBar",
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      drawer: true,
      rail: true,
      menuItems: [
        { title: 'Dashboard', icon: 'mdi-view-dashboard', value: 'dashboard', to: { name: 'dashboard' } },
        { title: 'Funil de Vendas', icon: 'mdi-filter-variant', value: 'funnel', to: { name: 'crm', query: { section: 'funnel' } } },
        { title: 'Tarefas', icon: 'mdi-clipboard-check', value: 'tasks', to: { name: 'crm', query: { section: 'tasks' } } },
        { title: 'Leads', icon: 'mdi-account-group', value: 'leads', to: { name: 'crm', query: { section: 'leads' } } },
        { title: 'Chat', icon: 'mdi-whatsapp', value: 'chat', to: { name: 'chat' } },
        { title: 'Respostas Rápidas', icon: 'mdi-flash', value: 'quick-replies', to: { name: 'crm', query: { section: 'quick-replies' } } },
        { title: 'Automações', icon: 'mdi-robot', value: 'automations', to: { name: 'crm', query: { section: 'automations' } } },
        { title: 'Campanhas', icon: 'mdi-bullhorn', value: 'campaigns', to: { name: 'crm', query: { section: 'campaigns' } } },
        { title: 'Analytics', icon: 'mdi-chart-line', value: 'analytics', to: { name: 'crm', query: { section: 'analytics' } } },
      ],
    };
  },
  computed: {
    userName() {
      return this.authStore.userName || 'Usuário'
    },
    userEmail() {
      return this.authStore.userEmail || ''
    },
    userAvatar() {
      return this.authStore.userAvatar || 'https://randomuser.me/api/portraits/men/85.jpg'
    }
  },
  methods: {
    async handleLogout() {
      if (confirm('Deseja realmente sair?')) {
        const result = await this.authStore.signOut()
        if (result.success) {
          this.$router.push({ name: 'auth' })
        }
      }
    }
  }
}
</script>

<style scoped>
.nexus-sidebar {
  background: #0f0f1a !important;
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.sidebar-header {
  padding: 8px 0;
}

.new-connection-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
  height: 44px;
}

.sidebar-list {
  padding: 0 12px;
}

.menu-item {
  margin-bottom: 4px;
  border-radius: 12px !important;
  color: rgba(255, 255, 255, 0.6) !important;
  transition: all 0.3s ease;
}

.menu-item:hover {
  background: rgba(168, 85, 247, 0.05);
  color: #fff !important;
}

.menu-item.v-list-item--active {
  background: rgba(168, 85, 247, 0.1) !important;
  color: #a855f7 !important;
}

.logout-item:hover {
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.05) !important;
}

:deep(.v-list-item__prepend > .v-icon) {
  opacity: 1;
}

.opacity-20 {
  opacity: 0.08;
}
</style>
