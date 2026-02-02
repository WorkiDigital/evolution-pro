# 💬 Painel de Bate-Papo (Chat) - Guia Completo

## 📍 Onde Encontrar o Chat

O Evolution Manager possui **4 formas** de acessar o chat do WhatsApp:

---

### 1. **📱 Central de Conversas (NOVO!)** ⭐

**Rota:** `/chat`

**Como acessar:**
- Clique em **"Chat"** na sidebar (ícone do WhatsApp)
- Ou acesse diretamente: `http://localhost:5173/chat`

**Recursos:**
- ✅ Lista de todas as conversas
- ✅ Seletor de instâncias
- ✅ Busca de conversas
- ✅ Envio de mensagens
- ✅ Histórico completo
- ✅ Interface estilo WhatsApp Web

**Ideal para:** Gerenciar todas as conversas de forma centralizada

---

### 2. **🎯 Chat no CRM (Sidebar do Lead)**

**Rota:** `/crm` → Abrir Lead → Botão WhatsApp

**Como acessar:**
1. Vá para **CRM** (Funil de Vendas)
2. Clique em qualquer **lead**
3. No modal do lead, clique em **"WhatsApp"** ou **"Abrir Chat"**
4. Um painel lateral de chat abrirá à direita

**Recursos:**
- ✅ Chat contextual do lead
- ✅ Templates de mensagens
- ✅ Envio rápido
- ✅ Histórico de conversas
- ✅ Integrado com dados do lead

**Ideal para:** Conversar com leads específicos durante o processo de vendas

---

### 3. **📋 Chat na Página da Instância**

**Rota:** `/instances` → Clicar em instância → Aba "Chat"

**Como acessar:**
1. Vá para **Instâncias**
2. Clique em uma **instância conectada**
3. Clique na aba **"Chat"**

**Recursos:**
- ✅ Todas as conversas da instância
- ✅ Gerenciamento de contatos
- ✅ Envio de mensagens
- ✅ Informações da instância

**Ideal para:** Gerenciar conversas de uma instância específica

---

### 4. **⚡ Chat Rápido (Ações do Lead)**

**Rota:** Qualquer card de lead → Ícone WhatsApp

**Como acessar:**
- No **Kanban do CRM**, passe o mouse sobre um card de lead
- Clique no ícone do **WhatsApp** (ações rápidas)

**Recursos:**
- ✅ Acesso instantâneo
- ✅ Envio rápido de mensagem
- ✅ Sem sair do funil

**Ideal para:** Mensagens rápidas sem interromper o fluxo de trabalho

---

## 🎨 Interface da Central de Conversas

### **Layout:**

```
┌─────────────────────────────────────────────────────────┐
│  Header: Central de Conversas                           │
├─────────────────────────────────────────────────────────┤
│  Seletor de Instância: [Dropdown]                       │
├──────────────────┬──────────────────────────────────────┤
│  CONVERSAS       │  CHAT ATIVO                          │
│  ┌────────────┐  │  ┌────────────────────────────────┐  │
│  │ 🔍 Buscar  │  │  │ João Silva        [i] [📁]    │  │
│  └────────────┘  │  └────────────────────────────────┘  │
│                  │                                      │
│  • João Silva    │  ┌────────────────────────────────┐  │
│    Oi, tudo bem? │  │                                │  │
│    14:30         │  │  Mensagens aqui                │  │
│                  │  │                                │  │
│  • Maria Santos  │  │                                │  │
│    Obrigada!     │  └────────────────────────────────┘  │
│    13:15         │                                      │
│                  │  [😊] [Mensagem...] [📎] [➤]        │
└──────────────────┴──────────────────────────────────────┘
```

---

## 🚀 Como Usar

### **1. Selecionar Instância:**
- Ao abrir a página, selecione uma instância WhatsApp conectada
- O sistema carrega automaticamente a primeira instância conectada

### **2. Ver Conversas:**
- Lista de conversas aparece à esquerda
- Ordenadas por mensagem mais recente
- Badge mostra mensagens não lidas

### **3. Abrir Conversa:**
- Clique em qualquer conversa da lista
- Mensagens aparecem à direita
- Histórico completo carregado

### **4. Enviar Mensagem:**
- Digite no campo de texto
- Pressione **Enter** ou clique em **➤**
- Mensagem enviada via Evolution API

### **5. Buscar Conversa:**
- Use o campo de busca no topo
- Busca por nome ou número
- Filtragem em tempo real

---

## 🔧 Funcionalidades

### **✅ Implementado:**
- Lista de conversas
- Seleção de instância
- Busca de conversas
- Envio de mensagens de texto
- Interface responsiva
- Status online/offline
- Timestamps formatados
- Avatar de contatos

### **🚧 Em Desenvolvimento:**
- Histórico de mensagens (endpoint da API)
- Envio de mídia (imagens, vídeos, áudios)
- Emojis picker
- Anexar arquivos
- Mensagens de voz
- Status de leitura (✓✓)
- Notificações de novas mensagens
- Arquivar conversas
- Marcar como não lida

---

## 🔌 Integração com Evolution API

### **Endpoints Utilizados:**

```javascript
// Listar conversas
GET /chat/findChats/:instance

// Enviar mensagem
POST /message/sendText/:instance
{
  "number": "5511999999999",
  "text": "Olá!"
}

// Buscar mensagens (em implementação)
GET /chat/findMessages/:instance/:chatId
```

---

## 💡 Dicas de Uso

### **Para Vendas:**
1. Use a **Central de Conversas** para atendimento geral
2. Use o **Chat do CRM** para follow-up de leads
3. Use **Respostas Rápidas** para agilizar

### **Para Suporte:**
1. Monitore todas as conversas na Central
2. Use **Automações** para respostas automáticas
3. Crie **Templates** para perguntas frequentes

### **Para Gestão:**
1. Acompanhe métricas no **Analytics**
2. Revise conversas importantes
3. Exporte relatórios

---

## 🎯 Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Enter` | Enviar mensagem |
| `Ctrl + K` | Buscar conversa |
| `Esc` | Fechar chat |
| `↑` `↓` | Navegar conversas |

---

## 🐛 Troubleshooting

### **Não aparecem conversas:**
- Verifique se a instância está conectada
- Recarregue a página
- Verifique conexão com Evolution API

### **Não consegue enviar mensagem:**
- Verifique se o número está correto
- Confirme que a instância está ativa
- Veja logs no console (F12)

### **Mensagens não aparecem:**
- Endpoint de histórico em implementação
- Use a aba Chat da instância temporariamente

---

## 📊 Comparação das Opções

| Recurso | Central | CRM | Instância | Rápido |
|---------|---------|-----|-----------|--------|
| Lista completa | ✅ | ❌ | ✅ | ❌ |
| Busca | ✅ | ❌ | ✅ | ❌ |
| Templates | ⚠️ | ✅ | ✅ | ❌ |
| Contexto Lead | ❌ | ✅ | ❌ | ✅ |
| Multi-instância | ✅ | ❌ | ❌ | ❌ |

**Legenda:**
- ✅ Disponível
- ⚠️ Parcial
- ❌ Não disponível

---

## 🚀 Próximas Atualizações

- [ ] Histórico completo de mensagens
- [ ] Envio de mídia
- [ ] Mensagens de voz
- [ ] Grupos
- [ ] Status de leitura
- [ ] Notificações push
- [ ] Chat em tempo real (WebSocket)
- [ ] Transferência de atendimento
- [ ] Notas internas
- [ ] Tags de conversa

---

**Desenvolvido por:** Antigravity AI  
**Última atualização:** 02/02/2026  
**Versão:** 1.0
