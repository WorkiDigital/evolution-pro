<template>
  <div class="whatsapp-chat">
    <!-- Chat Header -->
    <div class="chat-header">
      <div class="d-flex align-center gap-3">
        <v-avatar size="44" class="chat-avatar">
          <v-img v-if="lead?.profilePictureUrl" :src="lead.profilePictureUrl" cover />
          <span v-else>{{ getInitials(lead?.name) }}</span>
        </v-avatar>
        <div class="chat-info">
          <h4 class="chat-name">{{ lead?.name || 'Contato' }}</h4>
          <span class="chat-status" :class="{ online: isOnline }">
            <span class="status-dot"></span>
            {{ isOnline ? 'Online' : formatLastSeen(lead?.lastMessageDate) }}
          </span>
        </div>
      </div>

      <div class="chat-actions">
        <v-btn icon variant="text" size="small" @click="$emit('call')">
          <v-icon>mdi-phone</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" @click="refreshMessages">
          <v-icon :class="{ 'rotating': loadingMessages }">mdi-refresh</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Templates Quick Access -->
    <div class="templates-bar" v-if="showTemplates">
      <span class="templates-label">Templates:</span>
      <div class="templates-list">
        <v-chip
          v-for="template in messageTemplates"
          :key="template.id"
          size="small"
          variant="tonal"
          @click="useTemplate(template)"
          class="template-chip"
        >
          {{ template.name }}
        </v-chip>
      </div>
      <v-btn icon size="x-small" @click="showTemplates = false">
        <v-icon size="14">mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Messages Container -->
    <div class="messages-container" ref="messagesContainer">
      <div v-if="loadingMessages" class="loading-messages">
        <v-progress-circular indeterminate size="32" color="primary"></v-progress-circular>
        <span>Carregando mensagens...</span>
      </div>

      <div v-else-if="messages.length === 0" class="no-messages">
        <v-icon size="48" color="grey">mdi-message-text-outline</v-icon>
        <p>Inicie uma conversa</p>
      </div>

      <template v-else>
        <div
          v-for="(message, index) in messages"
          :key="message.id || index"
          class="message"
          :class="{ sent: message.fromMe, received: !message.fromMe }"
        >
          <div class="message-bubble">
            <!-- Image Message -->
            <div v-if="message.type === 'image'" class="message-image">
              <v-img :src="message.imageUrl" max-width="250" rounded></v-img>
              <p v-if="message.caption" class="image-caption">{{ message.caption }}</p>
            </div>
            
            <!-- Audio Message -->
            <div v-else-if="message.type === 'audio'" class="message-audio">
              <v-icon>mdi-microphone</v-icon>
              <span>Mensagem de áudio</span>
            </div>
            
            <!-- Document Message -->
            <div v-else-if="message.type === 'document'" class="message-document">
              <v-icon>mdi-file-document</v-icon>
              <span>{{ message.fileName || 'Documento' }}</span>
            </div>
            
            <!-- Text Message -->
            <p v-else class="message-text">{{ message.text || message.body }}</p>
            
            <div class="message-meta">
              <span class="message-time">{{ formatTime(message.timestamp) }}</span>
              <v-icon v-if="message.fromMe" size="14" class="message-status" :class="message.status">
                {{ getStatusIcon(message.status) }}
              </v-icon>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <v-btn icon variant="text" @click="showTemplates = !showTemplates" class="input-action">
        <v-icon>mdi-lightning-bolt</v-icon>
        <v-tooltip activator="parent" location="top">Templates</v-tooltip>
      </v-btn>

      <v-btn icon variant="text" class="input-action">
        <v-icon>mdi-emoticon-outline</v-icon>
      </v-btn>

      <v-btn icon variant="text" class="input-action">
        <v-icon>mdi-attachment</v-icon>
      </v-btn>

      <v-textarea
        v-model="newMessage"
        placeholder="Digite uma mensagem..."
        variant="plain"
        density="compact"
        rows="1"
        auto-grow
        max-rows="4"
        hide-details
        class="message-input"
        @keydown.enter.exact.prevent="sendMessage"
      ></v-textarea>

      <v-btn
        icon
        color="success"
        variant="flat"
        class="send-btn"
        :disabled="!newMessage.trim() || sending"
        :loading="sending"
        @click="sendMessage"
      >
        <v-icon>mdi-send</v-icon>
      </v-btn>
    </div>

    <!-- Templates Manager Dialog -->
    <v-dialog v-model="templatesDialog" max-width="600">
      <v-card class="templates-modal">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Gerenciar Templates</span>
          <v-btn icon variant="text" @click="templatesDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="newTemplate.name"
            label="Nome do template"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          ></v-text-field>
          
          <v-textarea
            v-model="newTemplate.text"
            label="Texto da mensagem"
            placeholder="Use {{nome}} para personalizar"
            variant="outlined"
            rows="3"
          ></v-textarea>

          <v-btn color="primary" variant="flat" @click="addTemplate" class="mt-3" block>
            <v-icon start>mdi-plus</v-icon>
            Adicionar Template
          </v-btn>

          <v-divider class="my-4"></v-divider>

          <div class="saved-templates">
            <div
              v-for="template in messageTemplates"
              :key="template.id"
              class="saved-template"
            >
              <div class="template-info">
                <strong>{{ template.name }}</strong>
                <p>{{ template.text }}</p>
              </div>
              <v-btn icon size="small" color="error" variant="text" @click="deleteTemplate(template.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import instanceController from '@/services/instanceController'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'WhatsAppChat',
  props: {
    lead: {
      type: Object,
      required: true
    },
    instance: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    messages: [],
    newMessage: '',
    loadingMessages: false,
    sending: false,
    showTemplates: false,
    templatesDialog: false,
    messageTemplates: [],
    newTemplate: {
      name: '',
      text: ''
    }
  }),
  computed: {
    isOnline() {
      if (!this.lead?.lastMessageDate) return false
      const lastMsg = new Date(this.lead.lastMessageDate)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return lastMsg > fiveMinutesAgo
    },
    instanceName() {
      return this.instance?.instance?.instanceName
    },
    whatsappNumber() {
      return this.lead?.whatsappNumber || this.lead?.phone?.replace(/\D/g, '')
    }
  },
  methods: {
    async loadMessages() {
      if (!this.instanceName || !this.whatsappNumber) return
      
      try {
        this.loadingMessages = true
        
        // Try to get chat history
        const response = await instanceController.chat.getAllChats(this.instanceName)
        
        // Find the chat with this contact
        const chat = response.find(c => 
          c.id.includes(this.whatsappNumber) || 
          c.remoteJid?.includes(this.whatsappNumber)
        )
        
        if (chat?.messages) {
          this.messages = chat.messages.map(msg => ({
            id: msg.key?.id || uuidv4(),
            text: msg.message?.conversation || msg.message?.extendedTextMessage?.text || '',
            fromMe: msg.key?.fromMe || false,
            timestamp: msg.messageTimestamp,
            status: msg.status || 'sent',
            type: this.getMessageType(msg)
          }))
        } else {
          // If no chat history, start fresh
          this.messages = []
        }
        
        this.$nextTick(() => this.scrollToBottom())
        
      } catch (e) {
        console.error('Error loading messages:', e)
        this.messages = []
      } finally {
        this.loadingMessages = false
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim() || this.sending) return
      if (!this.instanceName || !this.whatsappNumber) {
        alert('Instância ou número não configurados')
        return
      }

      const messageText = this.newMessage.trim()
      this.newMessage = ''
      
      // Add message to UI immediately
      const tempMessage = {
        id: uuidv4(),
        text: messageText,
        fromMe: true,
        timestamp: Date.now() / 1000,
        status: 'pending'
      }
      this.messages.push(tempMessage)
      this.$nextTick(() => this.scrollToBottom())

      try {
        this.sending = true
        
        // Format number for WhatsApp
        let number = this.whatsappNumber.replace(/\D/g, '')
        if (!number.includes('@')) {
          number = number + '@s.whatsapp.net'
        }
        
        await instanceController.chat.sendText(
          this.instanceName,
          number,
          messageText
        )
        
        // Update message status
        tempMessage.status = 'sent'
        
        // Log activity
        this.$emit('message-sent', {
          leadId: this.lead.id,
          message: messageText
        })
        
      } catch (e) {
        console.error('Error sending message:', e)
        tempMessage.status = 'error'
        alert('Erro ao enviar mensagem: ' + (e.message || e))
      } finally {
        this.sending = false
      }
    },
    refreshMessages() {
      this.loadMessages()
    },
    useTemplate(template) {
      let text = template.text
      // Replace placeholders
      text = text.replace(/\{\{nome\}\}/gi, this.lead?.name?.split(' ')[0] || '')
      text = text.replace(/\{\{empresa\}\}/gi, this.lead?.company || '')
      text = text.replace(/\{\{valor\}\}/gi, this.formatCurrency(this.lead?.value) || '')
      
      this.newMessage = text
      this.showTemplates = false
    },
    addTemplate() {
      if (!this.newTemplate.name || !this.newTemplate.text) return
      
      this.messageTemplates.push({
        id: uuidv4(),
        name: this.newTemplate.name,
        text: this.newTemplate.text
      })
      
      this.saveTemplates()
      this.newTemplate = { name: '', text: '' }
    },
    deleteTemplate(id) {
      const index = this.messageTemplates.findIndex(t => t.id === id)
      if (index > -1) {
        this.messageTemplates.splice(index, 1)
        this.saveTemplates()
      }
    },
    saveTemplates() {
      localStorage.setItem('crm-message-templates', JSON.stringify(this.messageTemplates))
    },
    loadTemplates() {
      const saved = localStorage.getItem('crm-message-templates')
      if (saved) {
        this.messageTemplates = JSON.parse(saved)
      } else {
        // Default templates
        this.messageTemplates = [
          { id: uuidv4(), name: 'Boas-vindas', text: 'Olá {{nome}}! Tudo bem? Meu nome é [seu nome] e estou entrando em contato da [empresa]. Como posso ajudá-lo hoje?' },
          { id: uuidv4(), name: 'Follow-up', text: 'Olá {{nome}}! Estou passando para dar continuidade ao nosso contato. Você teve a oportunidade de avaliar nossa proposta?' },
          { id: uuidv4(), name: 'Agradecimento', text: 'Olá {{nome}}! Agradeço pelo contato e pela confiança. Estamos à disposição para qualquer dúvida!' }
        ]
        this.saveTemplates()
      }
    },
    getInitials(name) {
      if (!name) return '?'
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    },
    formatLastSeen(date) {
      if (!date) return 'Offline'
      const d = new Date(date)
      const now = new Date()
      const diffHours = Math.floor((now - d) / (1000 * 60 * 60))
      
      if (diffHours < 1) return 'Visto há pouco'
      if (diffHours < 24) return `Visto há ${diffHours}h`
      return `Visto em ${d.toLocaleDateString('pt-BR')}`
    },
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp * 1000)
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value || 0)
    },
    getStatusIcon(status) {
      const icons = {
        pending: 'mdi-clock-outline',
        sent: 'mdi-check',
        delivered: 'mdi-check-all',
        read: 'mdi-check-all',
        error: 'mdi-alert-circle'
      }
      return icons[status] || 'mdi-check'
    },
    getMessageType(msg) {
      if (msg.message?.imageMessage) return 'image'
      if (msg.message?.audioMessage) return 'audio'
      if (msg.message?.documentMessage) return 'document'
      return 'text'
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  },
  mounted() {
    this.loadTemplates()
    if (this.lead && this.instance) {
      this.loadMessages()
    }
  },
  watch: {
    lead: {
      handler() {
        if (this.lead && this.instance) {
          this.loadMessages()
        }
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.whatsapp-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px;
  background: linear-gradient(180deg, #0b141a 0%, #0d1418 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(180deg, rgba(32, 44, 51, 0.95), rgba(23, 34, 40, 0.95));
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.chat-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-weight: 600;
}

.chat-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.chat-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
}

.chat-status.online .status-dot {
  background: #25D366;
  box-shadow: 0 0 8px rgba(37, 211, 102, 0.5);
}

.chat-actions {
  display: flex;
  gap: 4px;
}

.chat-actions .v-btn {
  color: rgba(255, 255, 255, 0.6);
}

/* Templates Bar */
.templates-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(37, 211, 102, 0.1);
  border-bottom: 1px solid rgba(37, 211, 102, 0.2);
}

.templates-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.templates-list {
  display: flex;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
}

.template-chip {
  cursor: pointer;
}

/* Messages Container */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z' fill='%23ffffff' fill-opacity='0.02'/%3E%3C/svg%3E");
}

.loading-messages,
.no-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.4);
  gap: 12px;
}

/* Messages */
.message {
  display: flex;
  margin-bottom: 8px;
}

.message.sent {
  justify-content: flex-end;
}

.message.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 65%;
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
}

.message.sent .message-bubble {
  background: linear-gradient(135deg, #005c4b, #025144);
  border-bottom-right-radius: 4px;
}

.message.received .message-bubble {
  background: #1f2c34;
  border-bottom-left-radius: 4px;
}

.message-text {
  color: #fff;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 4px;
}

.message-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.message-status {
  color: rgba(255, 255, 255, 0.5);
}

.message-status.read {
  color: #53bdeb;
}

.message-status.error {
  color: #ef4444;
}

/* Input Area */
.input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  background: #1e2b32;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.input-action {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  background: #2a3942;
  border-radius: 24px;
  padding: 10px 16px;
}

.message-input :deep(.v-field__input) {
  color: #fff;
  font-size: 0.9rem;
}

.send-btn {
  flex-shrink: 0;
  border-radius: 50%;
}

/* Rotating animation */
.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Templates Modal */
.templates-modal {
  background: linear-gradient(180deg, rgba(25, 25, 40, 0.98), rgba(20, 20, 35, 0.99)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.saved-templates {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.saved-template {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.template-info strong {
  color: #fff;
  font-size: 0.9rem;
}

.template-info p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  margin: 4px 0 0;
}
</style>
