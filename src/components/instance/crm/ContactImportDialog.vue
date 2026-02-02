<template>
  <v-dialog v-model="dialog" max-width="800" persistent scrollable class="import-dialog">
    <v-card class="dialog-card">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-background"></div>
        <div class="header-content">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <div class="header-icon">
                <v-icon size="24">mdi-account-multiple-plus</v-icon>
              </div>
              <div class="ml-4">
                <h2 class="header-title">Importar Contatos para CRM</h2>
                <p class="header-subtitle">Selecione os contatos do WhatsApp para adicionar ao pipeline</p>
              </div>
            </div>
            <v-btn icon variant="text" class="close-btn" @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Content -->
      <v-card-text class="dialog-content">
        <v-alert v-if="error" type="error" class="mb-4" variant="tonal" closable @click:close="error = false">
          {{ error }}
        </v-alert>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <v-progress-circular indeterminate size="48" color="primary" class="mb-4"></v-progress-circular>
          <p>Carregando contatos...</p>
        </div>

        <!-- Contacts List -->
        <div v-else-if="contacts.length > 0">
          <!-- Search and Actions Bar -->
          <div class="actions-bar mb-4">
            <v-text-field
              v-model="search"
              placeholder="Buscar contatos..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              clearable
              hide-details
              class="search-input"
            ></v-text-field>
            
            <v-btn
              variant="tonal"
              color="primary"
              size="small"
              @click="selectAll"
              class="select-btn"
            >
              <v-icon start>{{ selectedContacts.length === filteredContacts.length ? 'mdi-checkbox-multiple-blank-outline' : 'mdi-checkbox-multiple-marked' }}</v-icon>
              {{ selectedContacts.length === filteredContacts.length ? 'Desmarcar' : 'Selecionar' }} Todos
            </v-btn>
          </div>

          <!-- Selected Count -->
          <div class="selection-info mb-4">
            <v-chip color="primary" variant="flat" size="small">
              <v-icon start size="14">mdi-account-check</v-icon>
              {{ selectedContacts.length }} de {{ filteredContacts.length }} selecionados
            </v-chip>
          </div>

          <!-- Contacts Grid -->
          <div class="contacts-grid">
            <div
              v-for="contact in filteredContacts"
              :key="contact.id"
              class="contact-card"
              :class="{ selected: isSelected(contact), 'in-crm': isAlreadyInCRM(contact) }"
              @click="toggleContact(contact)"
            >
              <v-checkbox
                :model-value="isSelected(contact)"
                hide-details
                density="compact"
                class="contact-checkbox"
                @click.stop="toggleContact(contact)"
              ></v-checkbox>

              <v-avatar size="48" class="contact-avatar">
                <v-img
                  v-if="contact.profilePictureUrl"
                  :src="contact.profilePictureUrl"
                  cover
                />
                <span v-else class="avatar-initials">{{ getInitials(contact.pushName || contact.id) }}</span>
              </v-avatar>

              <div class="contact-info">
                <span class="contact-name">{{ contact.pushName || formatPhone(contact.id) }}</span>
                <span class="contact-phone">{{ formatPhone(contact.id) }}</span>
              </div>

              <v-chip
                v-if="isAlreadyInCRM(contact)"
                size="x-small"
                color="warning"
                variant="flat"
                class="crm-badge"
              >
                Já no CRM
              </v-chip>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <v-icon size="64" color="grey">mdi-account-off</v-icon>
          <p class="empty-title">Nenhum contato encontrado</p>
          <p class="empty-subtitle">Esta instância não possui contatos para importar</p>
        </div>
      </v-card-text>

      <!-- Footer -->
      <div class="dialog-footer">
        <v-btn variant="text" @click="close" class="cancel-btn">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="importSelected"
          :disabled="selectedContacts.length === 0 || loading"
          :loading="importing"
          class="import-btn"
        >
          <v-icon start>mdi-download</v-icon>
          Importar {{ selectedContacts.length }} Contato(s)
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import { useCrmStore } from '@/store/crm'
import instanceController from '@/services/instanceController'

export default {
  name: 'ContactImportDialog',
  props: {
    instance: {
      type: Object,
      required: true
    }
  },
  setup() {
    const crmStore = useCrmStore()
    return { crmStore }
  },
  data: () => ({
    dialog: false,
    loading: false,
    importing: false,
    error: false,
    contacts: [],
    selectedContacts: [],
    search: ''
  }),
  computed: {
    filteredContacts() {
      if (!this.search) return this.contacts
      
      const query = this.search.toLowerCase()
      return this.contacts.filter(contact => {
        const name = (contact.pushName || '').toLowerCase()
        const id = contact.id.toLowerCase()
        return name.includes(query) || id.includes(query)
      })
    }
  },
  methods: {
    async open() {
      this.dialog = true
      this.selectedContacts = []
      this.search = ''
      await this.loadContacts()
    },
    close() {
      this.dialog = false
      this.contacts = []
      this.selectedContacts = []
      this.error = false
    },
    async loadContacts() {
      try {
        this.loading = true
        this.error = false
        
        const allContacts = await instanceController.chat.getContacts(
          this.instance.instance.instanceName
        )
        
        // Filter out groups (only individual contacts)
        this.contacts = allContacts
          .filter(c => !c.id.includes('@g.us'))
          .filter(c => c.id !== this.instance.instance.owner) // Exclude instance owner
        
      } catch (e) {
        this.error = e.message?.message || e.message || e || 'Erro ao carregar contatos'
      } finally {
        this.loading = false
      }
    },
    toggleContact(contact) {
      const index = this.selectedContacts.findIndex(c => c.id === contact.id)
      if (index > -1) {
        this.selectedContacts.splice(index, 1)
      } else {
        this.selectedContacts.push(contact)
      }
    },
    isSelected(contact) {
      return this.selectedContacts.some(c => c.id === contact.id)
    },
    isAlreadyInCRM(contact) {
      return this.crmStore.leads.some(
        lead => lead.whatsappNumber === contact.id || lead.phone === contact.id
      )
    },
    selectAll() {
      if (this.selectedContacts.length === this.filteredContacts.length) {
        this.selectedContacts = []
      } else {
        this.selectedContacts = [...this.filteredContacts]
      }
    },
    async importSelected() {
      try {
        this.importing = true
        
        const results = this.crmStore.importMultipleContacts(
          this.selectedContacts,
          this.instance.instance.instanceName
        )
        
        this.$emit('imported', results)
        this.close()
        
      } catch (e) {
        this.error = e.message || e || 'Erro ao importar contatos'
      } finally {
        this.importing = false
      }
    },
    getInitials(name) {
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    },
    formatPhone(phone) {
      if (!phone) return ''
      return phone.split('@')[0].replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4')
    }
  }
}
</script>

<style scoped>
.import-dialog :deep(.v-overlay__content) {
  margin: 16px;
}

.dialog-card {
  border-radius: 24px !important;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(25, 25, 40, 0.98), rgba(20, 20, 35, 0.99)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Header */
.dialog-header {
  position: relative;
  padding: 24px 28px;
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

.header-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.header-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.header-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 4px 0 0;
}

.close-btn {
  color: rgba(255, 255, 255, 0.5);
}

/* Content */
.dialog-content {
  padding: 24px 28px;
  max-height: 500px;
  overflow-y: auto;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.5);
}

/* Actions Bar */
.actions-bar {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  flex: 1;
}

.search-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.select-btn {
  text-transform: none;
  font-weight: 500;
  border-radius: 10px;
}

.selection-info {
  display: flex;
  align-items: center;
}

/* Contacts Grid */
.contacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(102, 126, 234, 0.3);
}

.contact-card.selected {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.4);
}

.contact-card.in-crm {
  opacity: 0.6;
}

.contact-checkbox {
  flex-shrink: 0;
}

.contact-avatar {
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  color: #a5b4fc;
  font-weight: 600;
}

.avatar-initials {
  font-size: 0.9rem;
}

.contact-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-phone {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

.crm-badge {
  flex-shrink: 0;
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

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin: 16px 0 8px;
}

.empty-subtitle {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.3);
}

/* Footer */
.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
}

.cancel-btn {
  color: rgba(255, 255, 255, 0.6);
  text-transform: none;
  font-weight: 500;
}

.import-btn {
  text-transform: none;
  font-weight: 600;
  padding: 0 24px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 600px) {
  .contacts-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-bar {
    flex-direction: column;
  }
  
  .select-btn {
    width: 100%;
  }
}
</style>
