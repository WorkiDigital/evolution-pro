<template>
  <div class="chat-view">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-content">
        <div>
          <div class="header-badge mb-2">
            <v-icon size="14" class="mr-1">mdi-whatsapp</v-icon>
            WhatsApp Chat
          </div>
          <h1 class="header-title">
            <span class="gradient-text">Central de Conversas</span>
          </h1>
          <p class="header-subtitle">
            Gerencie todas as suas conversas em um só lugar
          </p>
        </div>

        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-refresh"
          @click="refreshChats"
          :loading="loading"
        >
          Atualizar
        </v-btn>
      </div>
    </div>

    <!-- Instance Selector -->
    <div class="instance-selector">
      <v-select
        v-model="selectedInstance"
        :items="instances"
        item-title="name"
        item-value="name"
        label="Selecionar Instância"
        variant="outlined"
        density="comfortable"
        prepend-inner-icon="mdi-cellphone"
        :loading="loadingInstances"
        @update:model-value="loadChats"
        class="instance-select"
      >
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props">
            <template v-slot:prepend>
              <v-avatar :color="item.raw.state === 'open' ? 'success' : 'error'" size="10"></v-avatar>
            </template>
          </v-list-item>
        </template>
      </v-select>
    </div>

    <!-- Main Content -->
    <div class="chat-main" v-if="selectedInstance">
      <div class="chat-layout">
        <!-- Conversations List -->
        <div class="conversations-panel">
          <div class="panel-header">
            <h3 class="panel-title">Conversas</h3>
            <v-chip size="small" color="primary">{{ chats.length }}</v-chip>
          </div>

          <!-- Search -->
          <div class="search-box">
            <v-text-field
              v-model="searchQuery"
              placeholder="Buscar conversa..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
            ></v-text-field>
          </div>

          <!-- Chat List -->
          <div class="chat-list">
            <div
              v-for="chat in filteredChats"
              :key="chat.id"
              class="chat-item"
              :class="{ active: selectedChat?.id === chat.id }"
              @click="selectChat(chat)"
            >
              <v-avatar :image="chat.profilePictureUrl || undefined" size="48" color="primary">
                <v-icon v-if="!chat.profilePictureUrl">mdi-account</v-icon>
              </v-avatar>

              <div class="chat-info">
                <div class="chat-name">{{ chat.pushName || chat.id.split('@')[0] }}</div>
                <div class="chat-last-message">
                  {{ chat.lastMessage?.message || 'Sem mensagens' }}
                </div>
              </div>

              <div class="chat-meta">
                <div class="chat-time">{{ formatTime(chat.lastMessageTimestamp) }}</div>
                <v-badge
                  v-if="chat.unreadCount > 0"
                  :content="chat.unreadCount"
                  color="success"
                  inline
                ></v-badge>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredChats.length === 0" class="empty-state">
              <v-icon size="64" color="grey">mdi-chat-outline</v-icon>
              <p>Nenhuma conversa encontrada</p>
            </div>
          </div>
        </div>

        <!-- Chat Area -->
        <div class="chat-area" v-if="selectedChat">
          <div class="chat-area-header">
            <div class="d-flex align-center gap-3">
              <v-avatar :image="selectedChat.profilePictureUrl || undefined" size="40" color="primary">
                <v-icon v-if="!selectedChat.profilePictureUrl">mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="contact-name">{{ selectedChat.pushName || selectedChat.id.split('@')[0] }}</div>
                <div class="contact-status">
                  <v-icon size="12" color="success">mdi-circle</v-icon>
                  Online
                </div>
              </div>
            </div>

            <div class="d-flex gap-2">
              <v-btn icon variant="text" size="small" @click="openContactInfo">
                <v-icon>mdi-information</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small" @click="archiveChat">
                <v-icon>mdi-archive</v-icon>
              </v-btn>
            </div>
          </div>

          <!-- Messages -->
          <div class="messages-container" ref="messagesContainer">
            <div
              v-for="message in messages"
              :key="message.key.id"
              class="message"
              :class="{ sent: message.key.fromMe, received: !message.key.fromMe }"
            >
              <div class="message-bubble">
                <div class="message-text">{{ message.message?.conversation || message.message?.extendedTextMessage?.text || 'Mensagem sem texto' }}</div>
                <div class="message-time">{{ formatMessageTime(message.messageTimestamp) }}</div>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="loadingMessages" class="loading-messages">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <!-- Empty -->
            <div v-if="messages.length === 0 && !loadingMessages" class="empty-messages">
              <v-icon size="48" color="grey">mdi-message-outline</v-icon>
              <p>Nenhuma mensagem ainda</p>
            </div>
          </div>

          <!-- Input -->
          <div class="message-input-area">
            <v-btn icon variant="text" @click="showEmojiPicker = !showEmojiPicker">
              <v-icon>mdi-emoticon-happy</v-icon>
            </v-btn>

            <v-text-field
              v-model="messageText"
              placeholder="Digite uma mensagem..."
              variant="outlined"
              density="comfortable"
              hide-details
              @keyup.enter="sendMessage"
              class="message-input"
            ></v-text-field>

            <v-btn icon variant="text">
              <v-icon>mdi-paperclip</v-icon>
            </v-btn>

            <v-btn
              icon
              color="primary"
              variant="flat"
              @click="sendMessage"
              :loading="sending"
              :disabled="!messageText.trim()"
            >
              <v-icon>mdi-send</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- No Chat Selected -->
        <div v-else class="no-chat-selected">
          <v-icon size="120" color="grey-darken-2">mdi-chat-outline</v-icon>
          <h3>Selecione uma conversa</h3>
          <p>Escolha uma conversa na lista para começar</p>
        </div>
      </div>
    </div>

    <!-- No Instance Selected -->
    <div v-else class="no-instance">
      <v-icon size="120" color="grey-darken-2">mdi-cellphone-off</v-icon>
      <h3>Selecione uma instância</h3>
      <p>Escolha uma instância WhatsApp para ver as conversas</p>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script>
import instanceChatController from '@/services/instanceChatController'
import instanceController from '@/services/instanceController'

export default {
  name: 'ChatView',
  data: () => ({
    instances: [],
    selectedInstance: null,
    chats: [],
    selectedChat: null,
    messages: [],
    messageText: '',
    searchQuery: '',
    loading: false,
    loadingInstances: false,
    loadingMessages: false,
    sending: false,
    showEmojiPicker: false,
    snackbar: { show: false, text: '', color: 'success' }
  }),
  computed: {
    filteredChats() {
      if (!this.searchQuery) return this.chats
      const query = this.searchQuery.toLowerCase()
      return this.chats.filter(chat => {
        const name = (chat.pushName || chat.id || '').toLowerCase()
        return name.includes(query)
      })
    }
  },
  methods: {
    async loadInstances() {
      this.loadingInstances = true
      try {
        const response = await instanceController.fetchAll()
        this.instances = response.data || response || []
        
        // Auto-select first connected instance
        const connectedInstance = this.instances.find(i => i.status === 'open' || i.state === 'open')
        if (connectedInstance) {
          this.selectedInstance = connectedInstance.name || connectedInstance.instance.name
          await this.loadChats()
        }
      } catch (error) {
        console.error('Error loading instances:', error)
        this.showSnackbar('Erro ao carregar instâncias', 'error')
      } finally {
        this.loadingInstances = false
      }
    },

    async loadChats() {
      if (!this.selectedInstance) return

      this.loading = true
      try {
        const response = await instanceChatController.getAll(this.selectedInstance)
        this.chats = response.data || response || []
        
        // Sort by last message timestamp
        this.chats.sort((a, b) => {
          const timeA = a.lastMessageTimestamp || 0
          const timeB = b.lastMessageTimestamp || 0
          return timeB - timeA
        })
      } catch (error) {
        console.error('Error loading chats:', error)
        this.showSnackbar('Erro ao carregar conversas', 'error')
      } finally {
        this.loading = false
      }
    },

    async selectChat(chat) {
      this.selectedChat = chat
      await this.loadMessages()
    },

    async loadMessages() {
      if (!this.selectedChat) return

      this.loadingMessages = true
      try {
        // TODO: Implement getMessages endpoint
        // For now, using mock data or empty
        this.messages = []
        
        // Scroll to bottom
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        console.error('Error loading messages:', error)
        this.showSnackbar('Erro ao carregar mensagens', 'error')
      } finally {
        this.loadingMessages = false
      }
    },

    async sendMessage() {
      if (!this.messageText.trim() || !this.selectedChat) return

      this.sending = true
      try {
        // Prepare options exactly as expected by the controller and API
        // Controller: sendMessage(instanceName, options)
        // API expects options to have { number, text } inside options or params
        
        const number = this.selectedChat.id.split('@')[0]
        
        await instanceChatController.sendMessage(
          this.selectedInstance,
          {
            number: number,
            options: {
              delay: 1200,
              presence: "composing",
              linkPreview: false
            },
            textMessage: {
              text: this.messageText
            }
          }
        )

        // Add message to list locally
        this.messages.push({
          key: { id: Date.now(), fromMe: true },
          message: { conversation: this.messageText },
          messageTimestamp: Date.now() / 1000 // timestamps usually seconds in WA
        })

        this.messageText = ''
        this.scrollToBottom()
        this.showSnackbar('Mensagem enviada!', 'success')
      } catch (error) {
        console.error('Error sending message:', error)
        this.showSnackbar('Erro ao enviar mensagem', 'error')
      } finally {
        this.sending = false
      }
    },

    refreshChats() {
      this.loadChats()
    },

    openContactInfo() {
      // TODO: Implement contact info modal
      this.showSnackbar('Em desenvolvimento', 'info')
    },

    archiveChat() {
      // TODO: Implement archive
      this.showSnackbar('Em desenvolvimento', 'info')
    },

    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp * 1000)
      const now = new Date()
      const diff = now - date

      if (diff < 86400000) { // Less than 24 hours
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      } else if (diff < 604800000) { // Less than 7 days
        return date.toLocaleDateString('pt-BR', { weekday: 'short' })
      } else {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }
    },

    formatMessageTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp * 1000)
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    }
  },

  mounted() {
    this.loadInstances()
  }
}
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
}

/* Header */
.chat-header {
  padding: 24px 32px;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.8), rgba(25, 25, 40, 0.9));
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: rgba(37, 211, 102, 0.1);
  border: 1px solid rgba(37, 211, 102, 0.2);
  border-radius: 20px;
  font-size: 0.75rem;
  color: #25D366;
  font-weight: 600;
}

.header-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 8px 0;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Instance Selector */
.instance-selector {
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.instance-select {
  max-width: 400px;
}

/* Main Layout */
.chat-main {
  flex: 1;
  overflow: hidden;
}

.chat-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  height: calc(100vh - 200px);
}

/* Conversations Panel */
.conversations-panel {
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.6), rgba(25, 25, 40, 0.8));
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.search-box {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.chat-list {
  flex: 1;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.chat-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.chat-item.active {
  background: rgba(102, 126, 234, 0.15);
  border-left: 3px solid #667eea;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}

.chat-last-message {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.chat-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.4);
}

/* Chat Area */
.chat-area {
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, rgba(20, 20, 35, 0.6), rgba(15, 15, 25, 0.8));
}

.chat-area-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.contact-name {
  font-weight: 600;
  color: #fff;
  margin-bottom: 2px;
}

.contact-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Messages */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  display: flex;
  max-width: 70%;
}

.message.sent {
  align-self: flex-end;
}

.message.received {
  align-self: flex-start;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.message.received .message-bubble {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.message-text {
  color: #fff;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.4);
  text-align: right;
}

/* Input */
.message-input-area {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.message-input {
  flex: 1;
}

/* Empty States */
.empty-state,
.no-chat-selected,
.no-instance,
.empty-messages,
.loading-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
}

.no-chat-selected,
.no-instance {
  height: 100%;
}

.no-chat-selected h3,
.no-instance h3 {
  margin: 16px 0 8px;
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive */
@media (max-width: 960px) {
  .chat-layout {
    grid-template-columns: 1fr;
  }

  .conversations-panel {
    display: none;
  }

  .chat-area {
    display: flex;
  }
}
</style>
