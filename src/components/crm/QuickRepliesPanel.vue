<template>
  <div class="quick-replies-panel">
    <!-- Header -->
    <div class="panel-header">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h3 class="panel-title">
            <v-icon class="mr-2">mdi-flash</v-icon>
            Respostas Rápidas
          </h3>
          <p class="panel-subtitle">{{ replies.length }} respostas cadastradas</p>
        </div>
        
        <v-btn color="primary" variant="flat" class="add-btn" @click="openAddDialog">
          <v-icon start>mdi-plus</v-icon>
          Nova Resposta
        </v-btn>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-section mb-4">
      <v-text-field
        v-model="search"
        placeholder="Buscar respostas rápidas..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="comfortable"
        clearable
        hide-details
        class="search-input"
      ></v-text-field>
    </div>

    <!-- Replies Grid -->
    <div class="replies-grid">
      <div
        v-for="reply in filteredReplies"
        :key="reply.id"
        class="reply-card"
      >
        <div class="reply-header">
          <div class="d-flex align-center gap-2">
            <v-chip size="small" :color="getCategoryColor(reply.category)" variant="flat">
              {{ reply.category }}
            </v-chip>
            <span class="reply-shortcut">/{{ reply.shortcut }}</span>
          </div>
          <div class="reply-actions">
            <v-btn icon variant="text" size="small" @click="copyToClipboard(reply.message)">
              <v-icon size="18">mdi-content-copy</v-icon>
              <v-tooltip activator="parent" location="top">Copiar</v-tooltip>
            </v-btn>
            <v-btn icon variant="text" size="small" @click="editReply(reply)">
              <v-icon size="18">mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon variant="text" size="small" color="error" @click="deleteReply(reply.id)">
              <v-icon size="18">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
        
        <h4 class="reply-title">{{ reply.title }}</h4>
        <p class="reply-message">{{ reply.message }}</p>
        
        <div class="reply-footer">
          <span class="usage-count">
            <v-icon size="14">mdi-send</v-icon>
            {{ reply.usageCount || 0 }} usos
          </span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredReplies.length === 0" class="empty-state">
        <v-icon size="64" color="grey">mdi-flash-off</v-icon>
        <h4>Nenhuma resposta rápida encontrada</h4>
        <p>Crie respostas rápidas para agilizar seu atendimento</p>
        <v-btn color="primary" variant="flat" @click="openAddDialog" class="mt-4">
          <v-icon start>mdi-plus</v-icon>
          Criar Primeira Resposta
        </v-btn>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600" persistent>
      <v-card class="reply-modal">
        <div class="modal-header">
          <h3>{{ editingReply ? 'Editar Resposta Rápida' : 'Nova Resposta Rápida' }}</h3>
          <v-btn icon variant="text" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="formValid">
            <v-text-field
              v-model="formData.title"
              label="Título"
              :rules="[v => !!v || 'Título obrigatório']"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="formData.shortcut"
              label="Atalho"
              :rules="[v => !!v || 'Atalho obrigatório']"
              variant="outlined"
              density="comfortable"
              prefix="/"
              hint="Ex: ola, obrigado, horario"
              class="mb-4"
            ></v-text-field>

            <v-select
              v-model="formData.category"
              :items="categories"
              label="Categoria"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-select>

            <v-textarea
              v-model="formData.message"
              label="Mensagem"
              :rules="[v => !!v || 'Mensagem obrigatória']"
              variant="outlined"
              rows="4"
              hint="Use {{nome}}, {{empresa}} para personalizar"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <div class="modal-footer">
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" @click="saveReply" :disabled="!formValid">
            <v-icon start>mdi-check</v-icon>
            {{ editingReply ? 'Salvar' : 'Criar' }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'QuickRepliesPanel',
  data: () => ({
    replies: [],
    dialog: false,
    editingReply: null,
    formValid: false,
    search: '',
    snackbar: { show: false, text: '', color: 'success' },
    formData: {
      title: '',
      shortcut: '',
      category: 'Geral',
      message: ''
    },
    categories: ['Geral', 'Saudação', 'Despedida', 'Informações', 'Agendamento', 'Suporte', 'Vendas']
  }),
  computed: {
    filteredReplies() {
      if (!this.search) return this.replies
      const query = this.search.toLowerCase()
      return this.replies.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.shortcut.toLowerCase().includes(query) ||
        r.message.toLowerCase().includes(query)
      )
    }
  },
  methods: {
    openAddDialog() {
      this.editingReply = null
      this.formData = { title: '', shortcut: '', category: 'Geral', message: '' }
      this.dialog = true
    },
    editReply(reply) {
      this.editingReply = reply
      this.formData = { ...reply }
      this.dialog = true
    },
    closeDialog() {
      this.dialog = false
      this.editingReply = null
    },
    saveReply() {
      if (!this.formValid) return

      if (this.editingReply) {
        const index = this.replies.findIndex(r => r.id === this.editingReply.id)
        if (index > -1) {
          this.replies[index] = { ...this.replies[index], ...this.formData }
        }
      } else {
        this.replies.push({
          id: uuidv4(),
          ...this.formData,
          usageCount: 0,
          createdAt: new Date().toISOString()
        })
      }

      this.saveToStorage()
      this.closeDialog()
      this.showSnackbar('Resposta rápida salva com sucesso!')
    },
    deleteReply(id) {
      if (!confirm('Excluir esta resposta rápida?')) return
      const index = this.replies.findIndex(r => r.id === id)
      if (index > -1) {
        this.replies.splice(index, 1)
        this.saveToStorage()
        this.showSnackbar('Resposta excluída')
      }
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text)
      this.showSnackbar('Copiado para área de transferência!', 'info')
    },
    getCategoryColor(category) {
      const colors = {
        'Geral': 'primary',
        'Saudação': 'success',
        'Despedida': 'info',
        'Informações': 'warning',
        'Agendamento': 'purple',
        'Suporte': 'orange',
        'Vendas': 'error'
      }
      return colors[category] || 'primary'
    },
    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    },
    saveToStorage() {
      localStorage.setItem('crm-quick-replies', JSON.stringify(this.replies))
    },
    loadFromStorage() {
      const saved = localStorage.getItem('crm-quick-replies')
      if (saved) {
        this.replies = JSON.parse(saved)
      } else {
        this.addDefaultReplies()
      }
    },
    addDefaultReplies() {
      this.replies = [
        {
          id: uuidv4(),
          title: 'Saudação Inicial',
          shortcut: 'ola',
          category: 'Saudação',
          message: 'Olá {{nome}}! Tudo bem? Meu nome é [seu nome] e estou aqui para ajudá-lo. Como posso auxiliar você hoje?',
          usageCount: 0
        },
        {
          id: uuidv4(),
          title: 'Horário de Atendimento',
          shortcut: 'horario',
          category: 'Informações',
          message: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h. Aos sábados, das 9h às 13h.',
          usageCount: 0
        },
        {
          id: uuidv4(),
          title: 'Agradecimento',
          shortcut: 'obrigado',
          category: 'Despedida',
          message: 'Muito obrigado pelo contato, {{nome}}! Estamos à disposição sempre que precisar. Tenha um ótimo dia! 😊',
          usageCount: 0
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
.quick-replies-panel {
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

.add-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 10px;
}

/* Search */
.search-input {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
}

/* Replies Grid */
.replies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.reply-card {
  padding: 20px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8));
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.reply-card:hover {
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.reply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.reply-shortcut {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 8px;
  border-radius: 6px;
}

.reply-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.reply-card:hover .reply-actions {
  opacity: 1;
}

.reply-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px;
}

.reply-message {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reply-footer {
  display: flex;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.usage-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
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
.reply-modal {
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
