import { defineStore } from 'pinia'
import { supabase } from '@/plugins/supabase'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        session: null,
        loading: false,
        initialized: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        userEmail: (state) => state.user?.email,
        userName: (state) => state.user?.user_metadata?.name || state.user?.email?.split('@')[0],
        userAvatar: (state) => state.user?.user_metadata?.avatar_url
    },

    actions: {
        async initialize() {
            if (this.initialized) return

            this.loading = true
            try {
                // Get current session
                const { data: { session } } = await supabase.auth.getSession()

                if (session) {
                    this.session = session
                    this.user = session.user
                }

                // Listen for auth changes
                supabase.auth.onAuthStateChange((_event, session) => {
                    this.session = session
                    this.user = session?.user || null
                })

                this.initialized = true
            } catch (error) {
                console.error('Auth initialization error:', error)
            } finally {
                this.loading = false
            }
        },

        async signIn(email, password) {
            this.loading = true
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })

                if (error) throw error

                this.session = data.session
                this.user = data.user

                return { success: true, data }
            } catch (error) {
                console.error('Sign in error:', error)
                return { success: false, error: error.message }
            } finally {
                this.loading = false
            }
        },

        async signUp(email, password, metadata = {}) {
            this.loading = true
            try {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: metadata
                    }
                })

                if (error) throw error

                return { success: true, data }
            } catch (error) {
                console.error('Sign up error:', error)
                return { success: false, error: error.message }
            } finally {
                this.loading = false
            }
        },

        async signOut() {
            this.loading = true
            try {
                const { error } = await supabase.auth.signOut()

                if (error) throw error

                this.session = null
                this.user = null

                return { success: true }
            } catch (error) {
                console.error('Sign out error:', error)
                return { success: false, error: error.message }
            } finally {
                this.loading = false
            }
        },

        async resetPassword(email) {
            this.loading = true
            try {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`
                })

                if (error) throw error

                return { success: true }
            } catch (error) {
                console.error('Password reset error:', error)
                return { success: false, error: error.message }
            } finally {
                this.loading = false
            }
        },

        async updatePassword(newPassword) {
            this.loading = true
            try {
                const { error } = await supabase.auth.updateUser({
                    password: newPassword
                })

                if (error) throw error

                return { success: true }
            } catch (error) {
                console.error('Update password error:', error)
                return { success: false, error: error.message }
            } finally {
                this.loading = false
            }
        },

        async updateProfile(updates) {
            this.loading = true
            try {
                const { error } = await supabase.auth.updateUser({
                    data: updates
                })

                if (error) throw error

                return { success: true }
            } catch (error) {
                console.error('Update profile error:', error)
                return { success: false, error: error.message }
            } finally {
                this.loading = false
            }
        }
    }
})
