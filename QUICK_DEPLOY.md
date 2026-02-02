# 🚀 Quick Deploy - Evolution Manager

## ✅ Status: Pronto para Deploy!

O projeto está configurado e pronto para deploy na Vercel.

---

## 📦 Deploy em 3 Passos

### 1️⃣ Preparar Repositório Git

```bash
# Inicializar Git (se ainda não foi feito)
git init

# Adicionar arquivos
git add .

# Commit
git commit -m "Preparar para deploy na Vercel"

# Adicionar remote (GitHub, GitLab ou Bitbucket)
git remote add origin https://github.com/seu-usuario/evolution-manager.git

# Push
git push -u origin main
```

### 2️⃣ Deploy na Vercel

**Opção A: Via Interface Web**

1. Acesse: https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione seu repositório
4. Configure:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Adicione variáveis de ambiente (ver abaixo)
6. Clique em "Deploy"

**Opção B: Via CLI**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 3️⃣ Configurar Variáveis de Ambiente

No Vercel Dashboard, adicione:

```
VITE_SUPABASE_URL=https://oolhnfcsbfzmaijkodhl.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key-aqui
VITE_EVOLUTION_API_URL=https://sua-evolution-api.com
VITE_EVOLUTION_API_KEY=sua-api-key-aqui
```

---

## 🔧 Configurações Importantes

### Supabase

Após deploy, atualize no Supabase Dashboard:

1. **Authentication** → **URL Configuration**
2. Adicione:
   - Site URL: `https://seu-projeto.vercel.app`
   - Redirect URLs: `https://seu-projeto.vercel.app/auth/callback`

### Evolution API

Certifique-se que sua Evolution API:
- Está acessível publicamente (HTTPS)
- Aceita requests da URL da Vercel (CORS)

---

## ✅ Verificação Pré-Deploy

Execute antes de fazer deploy:

```bash
npm run verify-deploy
```

Este comando verifica:
- ✅ Arquivos de configuração
- ✅ Dependências
- ✅ Scripts de build
- ✅ Git e .gitignore
- ✅ Variáveis de ambiente

---

## 🎯 Checklist Rápido

Antes de fazer deploy:

- [ ] Código commitado no Git
- [ ] Repositório no GitHub/GitLab/Bitbucket
- [ ] Variáveis de ambiente preparadas
- [ ] Build local funciona (`npm run build`)
- [ ] Preview local funciona (`npm run preview`)

Após deploy:

- [ ] Testar login/registro
- [ ] Testar CRM
- [ ] Testar chat
- [ ] Atualizar URLs no Supabase
- [ ] Configurar domínio customizado (opcional)

---

## 📚 Documentação Completa

Para guia detalhado, consulte: **DEPLOY_VERCEL.md**

---

## 🆘 Problemas Comuns

### Build Falha
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Página em Branco
- Verifique `vercel.json` (já configurado ✅)
- Confirme variáveis de ambiente

### CORS Error
- Configure CORS no Supabase
- Adicione URL da Vercel nas allowed origins

---

## 🎉 Pronto!

Após o deploy, sua aplicação estará online em:

**https://seu-projeto.vercel.app**

Deploy automático a cada push para `main`! 🚀

---

**Desenvolvido por:** Antigravity AI  
**Data:** 02/02/2026
