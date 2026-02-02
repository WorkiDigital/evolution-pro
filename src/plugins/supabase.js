/**
 * Supabase Plugin
 * 
 * Initializes and provides Supabase client instance
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials not found in environment variables')
    console.warn('Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})

// Plugin installation function
export default {
    install: (app) => {
        // Make supabase available globally
        app.config.globalProperties.$supabase = supabase

        // Provide supabase for composition API
        app.provide('supabase', supabase)

        if (supabaseUrl && supabaseAnonKey) {
            console.log('✅ Supabase client initialized successfully')
        }
    }
}
