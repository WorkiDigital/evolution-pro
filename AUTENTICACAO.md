# 🔐 Sistema de Autenticação - Evolution Manager

## 📋 Visão Geral

O Evolution Manager agora possui um sistema completo de autenticação integrado com **Supabase Auth**, oferecendo:

- ✅ Login com email e senha
- ✅ Registro de novos usuários
- ✅ Recuperação de senha
- ✅ Login com Google (OAuth)
- ✅ Proteção de rotas
- ✅ Gestão de sessão
- ✅ Perfil de usuário

---

## 🚀 Como Usar

### 1. **Primeiro Acesso**

Ao acessar o sistema pela primeira vez, você será redirecionado para a tela de login (`/auth`).

#### **Criar Nova Conta:**

1. Clique na aba **"Criar Conta"**
2. Preencha os dados:
   - Nome completo
   - E-mail
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
3. Aceite os termos de uso
4. Clique em **"Criar Conta"**
5. Verifique seu e-mail para confirmar o cadastro

#### **Fazer Login:**

1. Digite seu e-mail e senha
2. (Opcional) Marque "Lembrar-me"
3. Clique em **"Entrar"**

#### **Login com Google:**

1. Clique em **"Continuar com Google"**
2. Autorize o acesso
3. Será redirecionado automaticamente

---

## 🔧 Configuração do Supabase

### **1. Habilitar Autenticação por Email**

No painel do Supabase:

1. Vá em **Authentication** → **Providers**
2. Habilite **Email**
3. Configure:
   - ✅ Enable email confirmations
   - ✅ Enable password recovery

### **2. Configurar Google OAuth (Opcional)**

1. Vá em **Authentication** → **Providers**
2. Habilite **Google**
3. Adicione suas credenciais OAuth:
   - Client ID
   - Client Secret
4. Configure URLs autorizadas:
   - `http://localhost:5173` (desenvolvimento)
   - Seu domínio de produção

### **3. Configurar Email Templates**

1. Vá em **Authentication** → **Email Templates**
2. Personalize os templates:
   - Confirmação de email
   - Recuperação de senha
   - Mudança de email

---

## 📁 Arquivos Criados

### **1. `src/views/Auth.vue`**
Tela de autenticação com design premium:
- Formulários de login e registro
- Validações em tempo real
- Animações e transições
- Integração com Supabase Auth

### **2. `src/store/auth.js`**
Store Pinia para gerenciamento de autenticação:
- Estado do usuário
- Métodos de login/logout
- Gestão de sessão
- Atualização de perfil

### **3. Router Guard**
Proteção automática de rotas em `src/router/index.js`:
- Redireciona para login se não autenticado
- Redireciona para dashboard se já logado
- Suporta redirect após login

---

## 🔒 Rotas Protegidas

### **Públicas (sem autenticação):**
- `/auth` - Login/Registro
- `/doc` - Documentação

### **Protegidas (requer autenticação):**
- `/dashboard` - Dashboard principal
- `/instances` - Gerenciamento de instâncias
- `/crm` - CRM completo
- `/instance/:id` - Detalhes da instância

---

## 👤 Perfil do Usuário

### **Dados Armazenados:**

```javascript
{
  id: "uuid",
  email: "usuario@email.com",
  user_metadata: {
    name: "Nome do Usuário",
    avatar_url: "https://..."
  },
  created_at: "2026-02-02T...",
  last_sign_in_at: "2026-02-02T..."
}
```

### **Acessar Dados do Usuário:**

```javascript
import { useAuthStore } from '@/store/auth'

const authStore = useAuthStore()

// Verificar se está autenticado
console.log(authStore.isAuthenticated)

// Obter dados do usuário
console.log(authStore.userName)
console.log(authStore.userEmail)
console.log(authStore.userAvatar)
```

---

## 🔄 Fluxo de Autenticação

### **1. Inicialização**

```javascript
// App.vue
onMounted(() => {
  authStore.initialize() // Verifica sessão existente
})
```

### **2. Login**

```javascript
const result = await authStore.signIn(email, password)
if (result.success) {
  router.push('/dashboard')
}
```

### **3. Registro**

```javascript
const result = await authStore.signUp(email, password, {
  name: 'Nome do Usuário'
})
```

### **4. Logout**

```javascript
const result = await authStore.signOut()
if (result.success) {
  router.push('/auth')
}
```

### **5. Recuperação de Senha**

```javascript
const result = await authStore.resetPassword(email)
// Email enviado com link de recuperação
```

---

## 🎨 Personalização

### **Alterar Logo/Branding**

Edite `src/views/Auth.vue`:

```vue
<div class="brand-icon">
  <v-icon size="48" color="white">mdi-seu-icone</v-icon>
</div>
<h1 class="brand-title">
  <span class="gradient-text">Seu Nome</span>
</h1>
```

### **Alterar Cores**

Edite as variáveis CSS em `Auth.vue`:

```css
.orb-1 {
  background: linear-gradient(135deg, #sua-cor1, #sua-cor2);
}
```

---

## 🔐 Segurança

### **Boas Práticas Implementadas:**

✅ **Senhas Criptografadas** - Supabase usa bcrypt  
✅ **Tokens JWT** - Sessões seguras  
✅ **HTTPS Obrigatório** - Em produção  
✅ **Rate Limiting** - Proteção contra brute force  
✅ **Email Verification** - Confirmação de cadastro  
✅ **Password Reset** - Recuperação segura  

### **Políticas de Senha:**

- Mínimo 6 caracteres
- Recomendado: letras, números e símbolos
- Não reutilizar senhas antigas

---

## 🐛 Troubleshooting

### **Erro: "Invalid login credentials"**

- Verifique email e senha
- Confirme que o email foi verificado
- Tente recuperar a senha

### **Erro: "Email not confirmed"**

- Verifique sua caixa de entrada
- Procure na pasta de spam
- Reenvie o email de confirmação

### **Não recebe emails do Supabase**

1. Verifique configurações de SMTP no Supabase
2. Configure um provedor de email (SendGrid, etc)
3. Teste com email diferente

### **Redirect loop após login**

- Limpe cookies e localStorage
- Verifique configuração de rotas
- Reinicie o servidor de desenvolvimento

---

## 📊 Monitoramento

### **Ver Usuários Cadastrados:**

1. Acesse o painel do Supabase
2. Vá em **Authentication** → **Users**
3. Veja lista completa de usuários

### **Logs de Autenticação:**

1. **Authentication** → **Logs**
2. Filtre por tipo de evento
3. Analise tentativas de login

---

## 🚀 Próximos Passos

### **Funcionalidades Futuras:**

- [ ] Autenticação de dois fatores (2FA)
- [ ] Login com redes sociais (Facebook, GitHub)
- [ ] Gestão de permissões (roles)
- [ ] Auditoria de ações
- [ ] Sessões múltiplas
- [ ] Notificações de login

### **Melhorias Planejadas:**

- [ ] Avatar upload
- [ ] Edição de perfil
- [ ] Preferências de usuário
- [ ] Histórico de atividades
- [ ] Temas personalizados por usuário

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Consulte a [documentação do Supabase Auth](https://supabase.com/docs/guides/auth)
2. Verifique os logs do navegador (F12)
3. Revise as configurações do Supabase
4. Entre em contato com o suporte

---

**Desenvolvido com ❤️ por Antigravity AI**  
**Última atualização:** 02/02/2026
