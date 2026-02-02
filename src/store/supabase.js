/**
 * Supabase Store
 * 
 * Pinia store for managing Supabase state and operations
 */

import { defineStore } from 'pinia'
import { supabase } from '@/plugins/supabase'

export const useSupabaseStore = defineStore('supabase', {
    state: () => ({
        // Connection status
        connected: false,
        connectionError: null,

        // User authentication
        user: null,
        session: null,

        // Realtime subscriptions
        subscriptions: {},

        // Cache for frequently accessed data
        cache: {},
    }),

    getters: {
        isConnected: (state) => state.connected,
        isAuthenticated: (state) => state.user !== null,
        currentUser: (state) => state.user,
        hasConnectionError: (state) => state.connectionError !== null,
    },

    actions: {
        /**
         * Initialize Supabase connection and auth state
         */
        async initialize() {
            try {
                // Check current session
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    this.connectionError = error
                    console.error('Failed to get session:', error)
                    return
                }

                this.session = session
                this.user = session?.user || null
                this.connected = true

                // Listen for auth changes
                supabase.auth.onAuthStateChange((_event, session) => {
                    this.session = session
                    this.user = session?.user || null
                })

                console.log('✅ Supabase store initialized')
            } catch (error) {
                this.connectionError = error
                console.error('Failed to initialize Supabase:', error)
            }
        },

        /**
         * Sign in with email and password
         */
        async signIn(email, password) {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            this.user = data.user
            this.session = data.session

            return data
        },

        /**
         * Sign up with email and password
         */
        async signUp(email, password, metadata = {}) {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata
                }
            })

            if (error) throw error

            return data
        },

        /**
         * Sign out
         */
        async signOut() {
            const { error } = await supabase.auth.signOut()

            if (error) throw error

            this.user = null
            this.session = null
            this.clearCache()
        },

        /**
         * Subscribe to realtime changes
         */
        addSubscription(key, channel) {
            this.subscriptions[key] = channel
        },

        /**
         * Unsubscribe from realtime changes
         */
        removeSubscription(key) {
            if (this.subscriptions[key]) {
                this.subscriptions[key].unsubscribe()
                delete this.subscriptions[key]
            }
        },

        /**
         * Unsubscribe from all channels
         */
        clearSubscriptions() {
            Object.keys(this.subscriptions).forEach(key => {
                this.removeSubscription(key)
            })
        },

        /**
         * Cache data
         */
        setCache(key, data) {
            this.cache[key] = {
                data,
                timestamp: Date.now()
            }
        },

        /**
         * Get cached data
         */
        getCache(key, maxAge = 60000) { // Default: 1 minute
            const cached = this.cache[key]

            if (!cached) return null

            const age = Date.now() - cached.timestamp

            if (age > maxAge) {
                delete this.cache[key]
                return null
            }

            return cached.data
        },

        /**
         * Clear cache
         */
        clearCache() {
            this.cache = {}
        },

        /**
         * Clear specific cache entry
         */
        clearCacheEntry(key) {
            delete this.cache[key]
        }
    }
})
