# 🚀 Deploy na Vercel - Evolution Manager

## 📋 Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

- ✅ Conta na [Vercel](https://vercel.com)
- ✅ Projeto Supabase configurado
- ✅ Evolution API rodando (URL acessível)
- ✅ Repositório Git (GitHub, GitLab ou Bitbucket)

---

## 🔧 Passo 1: Preparar o Projeto

### 1.1 Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (se ainda não existir):

```bash
# Supabase
VITE_SUPABASE_URL=https://oolhnfcsbfzmaijkodhl.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key-aqui

# Evolution API
VITE_EVOLUTION_API_URL=https://sua-evolution-api.com
VITE_EVOLUTION_API_KEY=sua-api-key-aqui
```

### 1.2 Testar Build Local

```bash
npm run build
```

Se houver erros, corrija antes de continuar.

### 1.3 Testar Preview Local

```bash
npm run preview
```

Acesse `http://localhost:4173` e teste a aplicação.

---

## 📤 Passo 2: Fazer Deploy

### Opção A: Deploy via Git (Recomendado)

#### 1. Fazer Push para o GitHub

```bash
git add .
git commit -m "Preparar para deploy na Vercel"
git push origin main
```

#### 2. Importar no Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório
4. Configure o projeto:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

#### 3. Adicionar Variáveis de Ambiente

Na página de configuração do projeto:

1. Vá em **"Environment Variables"**
2. Adicione cada variável:

```
VITE_SUPABASE_URL = https://oolhnfcsbfzmaijkodhl.supabase.co
VITE_SUPABASE_ANON_KEY = seu-anon-key
VITE_EVOLUTION_API_URL = https://sua-evolution-api.com
VITE_EVOLUTION_API_KEY = sua-api-key
```

3. Clique em **"Deploy"**

---

### Opção B: Deploy via CLI

#### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login

```bash
vercel login
```

#### 3. Deploy

```bash
vercel
```

Siga as instruções:
- **Set up and deploy?** → Yes
- **Which scope?** → Sua conta
- **Link to existing project?** → No
- **Project name?** → evolution-manager
- **Directory?** → ./
- **Override settings?** → No

#### 4. Adicionar Variáveis de Ambiente

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_EVOLUTION_API_URL
vercel env add VITE_EVOLUTION_API_KEY
```

#### 5. Deploy para Produção

```bash
vercel --prod
```

---

## ⚙️ Passo 3: Configurar Supabase

### 3.1 Adicionar URL da Vercel

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Authentication** → **URL Configuration**
3. Adicione a URL da Vercel em **Site URL:**
   ```
   https://seu-projeto.vercel.app
   ```

4. Adicione em **Redirect URLs:**
   ```
   https://seu-projeto.vercel.app/auth/callback
   https://seu-projeto.vercel.app/dashboard
   ```

### 3.2 Configurar CORS

Em **Settings** → **API**:

```json
{
  "allowed_origins": [
    "https://seu-projeto.vercel.app"
  ]
}
```

---

## 🔐 Passo 4: Configurar Domínio Customizado (Opcional)

### 4.1 No Vercel

1. Vá em **Settings** → **Domains**
2. Clique em **"Add Domain"**
3. Digite seu domínio: `seudominio.com`
4. Siga as instruções para configurar DNS

### 4.2 Configurar DNS

Adicione os registros no seu provedor de DNS:

**Para domínio raiz (seudominio.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Para subdomínio (www.seudominio.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 Atualizar Supabase

Adicione o domínio customizado nas URLs do Supabase.

---

## 🔄 Passo 5: Configurar CI/CD

### Deploy Automático

Com Git conectado, cada push para `main` faz deploy automático!

### Preview Deploys

Cada Pull Request gera um preview deploy automático.

### Configurar Branches

No Vercel Dashboard:

1. **Settings** → **Git**
2. Configure:
   - **Production Branch:** `main`
   - **Preview Branches:** `develop`, `staging`

---

## 📊 Passo 6: Monitoramento

### Analytics

1. Vá em **Analytics** no Vercel Dashboard
2. Veja métricas de:
   - Visitantes
   - Page views
   - Performance
   - Web Vitals

### Logs

1. Vá em **Deployments** → Seu deploy
2. Clique em **"View Function Logs"**
3. Monitore erros em tempo real

### Alertas

Configure em **Settings** → **Notifications**:
- Deploy failed
- Build errors
- Performance issues

---

## 🐛 Troubleshooting

### Build Falha

**Erro:** `Module not found`
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Erro:** `Environment variable not found`
- Verifique se todas as variáveis estão configuradas no Vercel
- Use o prefixo `VITE_` para variáveis do Vite

### Página em Branco

**Causa:** Roteamento SPA não configurado
- Verifique se `vercel.json` existe
- Confirme a configuração de rewrites

### Erro 404 em Rotas

**Solução:** Adicione em `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### CORS Error

**Solução:**
1. Configure CORS no Supabase
2. Adicione URL da Vercel nas allowed origins
3. Configure Evolution API para aceitar requests da Vercel

### Variáveis de Ambiente Não Funcionam

**Lembre-se:**
- Use prefixo `VITE_` para variáveis do Vite
- Rebuild após adicionar variáveis
- Variáveis são injetadas em build time, não runtime

---

## 🎯 Checklist Final

Antes de ir para produção:

- [ ] Build local funciona sem erros
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Supabase URLs atualizadas
- [ ] Evolution API acessível publicamente
- [ ] CORS configurado corretamente
- [ ] Domínio customizado configurado (se aplicável)
- [ ] Analytics habilitado
- [ ] Monitoramento configurado
- [ ] Backup do banco de dados
- [ ] Documentação atualizada

---

## 🚀 Comandos Úteis

```bash
# Build local
npm run build

# Preview local
npm run preview

# Deploy via CLI
vercel

# Deploy para produção
vercel --prod

# Ver logs
vercel logs

# Listar deploys
vercel ls

# Remover deploy
vercel rm [deployment-url]

# Ver variáveis de ambiente
vercel env ls

# Adicionar variável
vercel env add [name]

# Remover variável
vercel env rm [name]
```

---

## 📚 Recursos

- [Documentação Vercel](https://vercel.com/docs)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Auth with Vercel](https://supabase.com/docs/guides/auth/social-login/auth-vercel)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

## 🎉 Próximos Passos

Após o deploy:

1. **Teste completo** - Teste todas as funcionalidades
2. **Configure Analytics** - Google Analytics, Hotjar, etc
3. **SEO** - Meta tags, sitemap, robots.txt
4. **Performance** - Lighthouse, Web Vitals
5. **Segurança** - Headers de segurança, CSP
6. **Backup** - Configure backups automáticos
7. **Monitoramento** - Sentry, LogRocket
8. **Documentação** - Atualize README com URL de produção

---

**Desenvolvido por:** Antigravity AI  
**Última atualização:** 02/02/2026

**Sua aplicação estará online em:** `https://seu-projeto.vercel.app` 🚀
