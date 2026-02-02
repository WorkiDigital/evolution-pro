/**
 * useSupabase Composable
 * 
 * Vue 3 composable for easy Supabase integration
 * Provides reactive state and helper methods for common operations
 */

import { ref, computed, inject } from 'vue'
import { supabase } from '@/plugins/supabase'

export function useSupabase() {
    // Inject supabase instance (alternative to using the export)
    const supabaseClient = inject('supabase', supabase)

    // Reactive state
    const loading = ref(false)
    const error = ref(null)

    /**
     * Execute a Supabase query with error handling
     * @param {Function} queryFn - Async function that returns a Supabase query
     * @returns {Promise} Query result
     */
    const executeQuery = async (queryFn) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: queryError } = await queryFn()

            if (queryError) {
                error.value = queryError
                console.error('Supabase query error:', queryError)
                throw queryError
            }

            return data
        } catch (err) {
            error.value = err
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Fetch data from a table
     * @param {string} table - Table name
     * @param {Object} options - Query options (select, filters, etc)
     * @returns {Promise} Query result
     */
    const fetchData = async (table, options = {}) => {
        const { select = '*', filters = {}, orderBy, limit } = options

        return executeQuery(async () => {
            let query = supabaseClient.from(table).select(select)

            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value)
            })

            // Apply ordering
            if (orderBy) {
                const { column, ascending = true } = orderBy
                query = query.order(column, { ascending })
            }

            // Apply limit
            if (limit) {
                query = query.limit(limit)
            }

            return query
        })
    }

    /**
     * Insert data into a table
     * @param {string} table - Table name
     * @param {Object|Array} data - Data to insert
     * @returns {Promise} Inserted data
     */
    const insertData = async (table, data) => {
        return executeQuery(async () => {
            return supabaseClient.from(table).insert(data).select()
        })
    }

    /**
     * Update data in a table
     * @param {string} table - Table name
     * @param {Object} data - Data to update
     * @param {Object} filters - Filters to match records
     * @returns {Promise} Updated data
     */
    const updateData = async (table, data, filters = {}) => {
        return executeQuery(async () => {
            let query = supabaseClient.from(table).update(data)

            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value)
            })

            return query.select()
        })
    }

    /**
     * Delete data from a table
     * @param {string} table - Table name
     * @param {Object} filters - Filters to match records
     * @returns {Promise} Deleted data
     */
    const deleteData = async (table, filters = {}) => {
        return executeQuery(async () => {
            let query = supabaseClient.from(table).delete()

            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                query = query.eq(key, value)
            })

            return query.select()
        })
    }

    /**
     * Subscribe to realtime changes
     * @param {string} table - Table name
     * @param {Function} callback - Callback function for changes
     * @param {Object} options - Subscription options
     * @returns {Object} Subscription object
     */
    const subscribe = (table, callback, options = {}) => {
        const { event = '*', filter } = options

        let channel = supabaseClient
            .channel(`${table}-changes`)
            .on('postgres_changes',
                {
                    event,
                    schema: 'public',
                    table,
                    ...(filter && { filter })
                },
                callback
            )
            .subscribe()

        return channel
    }

    /**
     * Upload file to Supabase Storage
     * @param {string} bucket - Bucket name
     * @param {string} path - File path in bucket
     * @param {File} file - File to upload
     * @returns {Promise} Upload result
     */
    const uploadFile = async (bucket, path, file) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: uploadError } = await supabaseClient
                .storage
                .from(bucket)
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                error.value = uploadError
                throw uploadError
            }

            return data
        } catch (err) {
            error.value = err
            throw err
        } finally {
            loading.value = false
        }
    }

    /**
     * Get public URL for a file
     * @param {string} bucket - Bucket name
     * @param {string} path - File path in bucket
     * @returns {string} Public URL
     */
    const getPublicUrl = (bucket, path) => {
        const { data } = supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(path)

        return data.publicUrl
    }

    // Computed properties
    const isLoading = computed(() => loading.value)
    const hasError = computed(() => error.value !== null)

    return {
        // Client
        supabase: supabaseClient,

        // State
        loading: isLoading,
        error: computed(() => error.value),
        hasError,

        // Methods
        executeQuery,
        fetchData,
        insertData,
        updateData,
        deleteData,
        subscribe,
        uploadFile,
        getPublicUrl,

        // Clear error
        clearError: () => { error.value = null }
    }
}
