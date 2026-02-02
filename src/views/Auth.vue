<template>
  <div class="auth-view">
    <!-- Background -->
    <div class="auth-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="grid-pattern"></div>
    </div>

    <!-- Auth Container -->
    <div class="auth-container">
      <!-- Logo & Branding -->
      <div class="auth-branding">
        <div class="brand-icon">
          <v-icon size="48" color="white">mdi-rocket-launch</v-icon>
        </div>
        <h1 class="brand-title">
          <span class="gradient-text">Evolution Manager</span>
        </h1>
        <p class="brand-subtitle">CRM Premium para WhatsApp</p>
      </div>

      <!-- Auth Card -->
      <v-card class="auth-card">
        <v-tabs v-model="activeTab" class="auth-tabs" color="primary" grow>
          <v-tab value="login">
            <v-icon start>mdi-login</v-icon>
            Entrar
          </v-tab>
          <v-tab value="register">
            <v-icon start>mdi-account-plus</v-icon>
            Criar Conta
          </v-tab>
        </v-tabs>

        <v-card-text class="pa-8">
          <v-window v-model="activeTab">
            <!-- Login Form -->
            <v-window-item value="login">
              <v-form ref="loginForm" v-model="loginValid" @submit.prevent="handleLogin">
                <div class="form-header mb-6">
                  <h2 class="form-title">Bem-vindo de volta!</h2>
                  <p class="form-subtitle">Entre com suas credenciais para continuar</p>
                </div>

                <v-text-field
                  v-model="loginData.email"
                  label="E-mail"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-email"
                  class="mb-4 premium-input"
                  :disabled="loading"
                ></v-text-field>

                <v-text-field
                  v-model="loginData.password"
                  label="Senha"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  class="mb-2 premium-input"
                  :disabled="loading"
                ></v-text-field>

                <div class="d-flex justify-space-between align-center mb-6">
                  <v-checkbox
                    v-model="loginData.remember"
                    label="Lembrar-me"
                    density="compact"
                    hide-details
                    :disabled="loading"
                  ></v-checkbox>
                  <v-btn variant="text" size="small" color="primary" @click="forgotPassword" :disabled="loading">
                    Esqueci a senha
                  </v-btn>
                </div>

                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="!loginValid || loading"
                  class="auth-btn mb-4"
                >
                  <v-icon start>mdi-login</v-icon>
                  Entrar
                </v-btn>

                <v-divider class="my-6">
                  <span class="divider-text">ou</span>
                </v-divider>

                <v-btn
                  variant="outlined"
                  size="large"
                  block
                  @click="loginWithGoogle"
                  :disabled="loading"
                  class="social-btn"
                >
                  <v-icon start>mdi-google</v-icon>
                  Continuar com Google
                </v-btn>
              </v-form>
            </v-window-item>

            <!-- Register Form -->
            <v-window-item value="register">
              <v-form ref="registerForm" v-model="registerValid" @submit.prevent="handleRegister">
                <div class="form-header mb-6">
                  <h2 class="form-title">Criar sua conta</h2>
                  <p class="form-subtitle">Comece gratuitamente agora mesmo</p>
                </div>

                <v-text-field
                  v-model="registerData.name"
                  label="Nome completo"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-account"
                  class="mb-4 premium-input"
                  :disabled="loading"
                ></v-text-field>

                <v-text-field
                  v-model="registerData.email"
                  label="E-mail"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-email"
                  class="mb-4 premium-input"
                  :disabled="loading"
                ></v-text-field>

                <v-text-field
                  v-model="registerData.password"
                  label="Senha"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="[rules.required, rules.minLength]"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showPassword = !showPassword"
                  class="mb-4 premium-input"
                  :disabled="loading"
                  hint="Mínimo 6 caracteres"
                ></v-text-field>

                <v-text-field
                  v-model="registerData.confirmPassword"
                  label="Confirmar senha"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="[rules.required, rules.passwordMatch]"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock-check"
                  class="mb-4 premium-input"
                  :disabled="loading"
                ></v-text-field>

                <v-checkbox
                  v-model="registerData.terms"
                  :rules="[rules.terms]"
                  density="compact"
                  class="mb-4"
                  :disabled="loading"
                >
                  <template v-slot:label>
                    <span class="terms-text">
                      Aceito os 
                      <a href="#" @click.prevent class="terms-link">Termos de Uso</a> 
                      e 
                      <a href="#" @click.prevent class="terms-link">Política de Privacidade</a>
                    </span>
                  </template>
                </v-checkbox>

                <v-btn
                  type="submit"
                  color="primary"
                  variant="flat"
                  size="large"
                  block
                  :loading="loading"
                  :disabled="!registerValid || loading"
                  class="auth-btn mb-4"
                >
                  <v-icon start>mdi-account-plus</v-icon>
                  Criar Conta
                </v-btn>

                <v-divider class="my-6">
                  <span class="divider-text">ou</span>
                </v-divider>

                <v-btn
                  variant="outlined"
                  size="large"
                  block
                  @click="loginWithGoogle"
                  :disabled="loading"
                  class="social-btn"
                >
                  <v-icon start>mdi-google</v-icon>
                  Continuar com Google
                </v-btn>
              </v-form>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>

      <!-- Footer -->
      <div class="auth-footer">
        <p class="footer-text">
          © 2026 Evolution Manager. Todos os direitos reservados.
        </p>
      </div>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { supabase } from '@/plugins/supabase'

export default {
  name: 'AuthView',
  data: () => ({
    activeTab: 'login',
    loading: false,
    showPassword: false,
    loginValid: false,
    registerValid: false,
    loginData: {
      email: '',
      password: '',
      remember: false
    },
    registerData: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false
    },
    snackbar: {
      show: false,
      text: '',
      color: 'success'
    },
    rules: {
      required: v => !!v || 'Campo obrigatório',
      email: v => /.+@.+\..+/.test(v) || 'E-mail inválido',
      minLength: v => (v && v.length >= 6) || 'Mínimo 6 caracteres',
      terms: v => !!v || 'Você deve aceitar os termos'
    }
  }),
  computed: {
    rules() {
      return {
        required: v => !!v || 'Campo obrigatório',
        email: v => /.+@.+\..+/.test(v) || 'E-mail inválido',
        minLength: v => (v && v.length >= 6) || 'Mínimo 6 caracteres',
        passwordMatch: v => v === this.registerData.password || 'As senhas não coincidem',
        terms: v => !!v || 'Você deve aceitar os termos'
      }
    }
  },
  methods: {
    async handleLogin() {
      if (!this.loginValid) return

      this.loading = true
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.loginData.email,
          password: this.loginData.password
        })

        if (error) throw error

        this.showSnackbar('Login realizado com sucesso!', 'success')
        
        // Redirect to dashboard
        setTimeout(() => {
          this.$router.push({ name: 'dashboard' })
        }, 500)

      } catch (error) {
        console.error('Login error:', error)
        this.showSnackbar(error.message || 'Erro ao fazer login', 'error')
      } finally {
        this.loading = false
      }
    },

    async handleRegister() {
      if (!this.registerValid) return

      this.loading = true
      try {
        const { data, error } = await supabase.auth.signUp({
          email: this.registerData.email,
          password: this.registerData.password,
          options: {
            data: {
              name: this.registerData.name
            }
          }
        })

        if (error) throw error

        this.showSnackbar('Conta criada! Verifique seu e-mail para confirmar.', 'success')
        
        // Switch to login tab
        setTimeout(() => {
          this.activeTab = 'login'
          this.loginData.email = this.registerData.email
        }, 2000)

      } catch (error) {
        console.error('Register error:', error)
        this.showSnackbar(error.message || 'Erro ao criar conta', 'error')
      } finally {
        this.loading = false
      }
    },

    async loginWithGoogle() {
      this.loading = true
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        })

        if (error) throw error

      } catch (error) {
        console.error('Google login error:', error)
        this.showSnackbar('Erro ao fazer login com Google', 'error')
        this.loading = false
      }
    },

    async forgotPassword() {
      if (!this.loginData.email) {
        this.showSnackbar('Digite seu e-mail primeiro', 'warning')
        return
      }

      this.loading = true
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(this.loginData.email, {
          redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) throw error

        this.showSnackbar('E-mail de recuperação enviado!', 'success')

      } catch (error) {
        console.error('Password reset error:', error)
        this.showSnackbar('Erro ao enviar e-mail de recuperação', 'error')
      } finally {
        this.loading = false
      }
    },

    showSnackbar(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    }
  }
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
}

/* Background */
.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 500px;
  height: 500px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  top: -250px;
  left: -250px;
  animation-delay: 0s;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  bottom: -200px;
  right: -200px;
  animation-delay: 5s;
}

.orb-3 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Container */
.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 24px;
}

/* Branding */
.auth-branding {
  text-align: center;
  margin-bottom: 32px;
}

.brand-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 12px 48px rgba(102, 126, 234, 0.6); }
}

.brand-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 8px;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Auth Card */
.auth-card {
  background: linear-gradient(145deg, rgba(30, 30, 45, 0.95), rgba(25, 25, 40, 0.98)) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 24px !important;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5) !important;
}

.auth-tabs {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px 16px 0 0;
}

.auth-tabs :deep(.v-tab) {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0;
}

/* Form */
.form-header {
  text-align: center;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.form-subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.premium-input {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.premium-input :deep(.v-field) {
  border-radius: 12px;
}

.auth-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
  height: 48px;
  font-size: 1rem;
}

.social-btn {
  text-transform: none;
  font-weight: 600;
  border-radius: 12px;
  height: 48px;
  border-color: rgba(255, 255, 255, 0.2);
}

.divider-text {
  padding: 0 16px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
}

.terms-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

.terms-link {
  color: #667eea;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

/* Footer */
.auth-footer {
  text-align: center;
  margin-top: 24px;
}

.footer-text {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .auth-container {
    padding: 16px;
  }

  .brand-title {
    font-size: 1.5rem;
  }

  .form-title {
    font-size: 1.25rem;
  }
}
</style>
