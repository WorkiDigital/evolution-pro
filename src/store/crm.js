import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/plugins/supabase'

export const useCrmStore = defineStore('crm', {
  state: () => ({
    leads: [],
    activities: [],
    automations: [],
    columns: [
      { id: 'novo', name: 'Novo Lead', color: 'blue', icon: 'mdi-star-outline' },
      { id: 'contato', name: 'Contato Inicial', color: 'purple', icon: 'mdi-message-outline' },
      { id: 'proposta', name: 'Proposta Enviada', color: 'orange', icon: 'mdi-file-document-outline' },
      { id: 'negociacao', name: 'Em Negociação', color: 'amber', icon: 'mdi-handshake-outline' },
      { id: 'fechado', name: 'Negócio Fechado', color: 'green', icon: 'mdi-check-circle-outline' }
    ],
    searchQuery: '',
    filterSource: null,
    filterPriority: null,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    loading: false
  }),

  getters: {
    getLeadsByStage: (state) => (stageId) => {
      let filtered = state.leads.filter(lead => lead.stage === stageId)

      // Apply search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        filtered = filtered.filter(lead =>
          lead.name.toLowerCase().includes(query) ||
          (lead.phone && lead.phone.toLowerCase().includes(query)) ||
          (lead.email && lead.email.toLowerCase().includes(query)) ||
          (lead.company && lead.company.toLowerCase().includes(query)) ||
          (lead.tags && lead.tags.some(tag => tag.toLowerCase().includes(query)))
        )
      }

      // Apply source filter
      if (state.filterSource) {
        filtered = filtered.filter(lead => lead.source === state.filterSource)
      }

      // Apply priority filter
      if (state.filterPriority) {
        filtered = filtered.filter(lead => lead.priority === state.filterPriority)
      }

      // Apply sorting
      return filtered.sort((a, b) => {
        let comparison = 0

        switch (state.sortBy) {
          case 'value':
            comparison = (b.value || 0) - (a.value || 0)
            break
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'score':
            comparison = (b.score || 0) - (a.score || 0)
            break
          case 'createdAt':
            comparison = new Date(b.createdAt) - new Date(a.createdAt)
            break
          default: // updatedAt
            comparison = new Date(b.updatedAt) - new Date(a.updatedAt)
        }

        return state.sortOrder === 'desc' ? comparison : -comparison
      })
    },

    getAllLeads: (state) => state.leads,

    getLeadById: (state) => (id) => state.leads.find(lead => lead.id === id),

    getTotalValue: (state) => {
      return state.leads.reduce((sum, lead) => sum + (lead.value || 0), 0)
    },

    getLeadCountByStage: (state) => (stageId) => {
      return state.leads.filter(lead => lead.stage === stageId).length
    },

    getValueByStage: (state) => (stageId) => {
      return state.leads
        .filter(lead => lead.stage === stageId)
        .reduce((sum, lead) => sum + (lead.value || 0), 0)
    },

    // Get leads by instance
    getLeadsByInstance: (state) => (instanceId) => {
      return state.leads.filter(lead => lead.instanceId === instanceId)
    },

    getLeadsByInstanceAndStage: (state) => (instanceId, stageId) => {
      return state.leads.filter(lead =>
        lead.instanceId === instanceId && lead.stage === stageId
      ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    },

    // Statistics
    getStats: (state) => {
      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const closedLeads = state.leads.filter(l => l.stage === 'fechado')
      const closedThisMonth = closedLeads.filter(l => new Date(l.updatedAt) > oneMonthAgo)
      const newThisWeek = state.leads.filter(l => new Date(l.createdAt) > oneWeekAgo)

      return {
        totalLeads: state.leads.length,
        totalValue: state.leads.reduce((sum, l) => sum + (Number(l.value) || 0), 0),
        closedDeals: closedLeads.length,
        closedValue: closedLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0),
        conversionRate: state.leads.length > 0
          ? Math.round((closedLeads.length / state.leads.length) * 100)
          : 0,
        averageDealSize: closedLeads.length > 0
          ? closedLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0) / closedLeads.length
          : 0,
        newThisWeek: newThisWeek.length,
        closedThisMonth: closedThisMonth.length,
        closedValueThisMonth: closedThisMonth.reduce((sum, l) => sum + (Number(l.value) || 0), 0),
        highPriorityCount: state.leads.filter(l => l.priority === 'high').length,
        averageScore: state.leads.length > 0
          ? Math.round(state.leads.reduce((sum, l) => sum + (l.score || 50), 0) / state.leads.length)
          : 0
      }
    },

    // Pipeline funnel data
    getFunnelData: (state) => {
      return state.columns.map(column => ({
        id: column.id,
        name: column.name,
        color: column.color,
        count: state.leads.filter(l => l.stage === column.id).length,
        value: state.leads
          .filter(l => l.stage === column.id)
          .reduce((sum, l) => sum + (Number(l.value) || 0), 0)
      }))
    }
  },

  actions: {
    // Initial data load combining Supabase and LocalStorage sync
    async loadFromLocalStorage() {
      if (this.loading) return
      this.loading = true

      try {
        // 1. Fetch from Supabase
        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('*, notes:lead_notes(*)')
          .order('updated_at', { ascending: false })

        if (!leadsError && leads) {
          this.leads = leads.map(l => ({
            ...l,
            instanceId: l.instance_id,
            whatsappNumber: l.whatsapp_number,
            profilePictureUrl: l.profile_picture_url,
            lastMessageDate: l.last_message_date,
            expectedCloseDate: l.expected_close_date,
            createdAt: l.created_at,
            updatedAt: l.updated_at
          }))
        }

        const { data: activities } = await supabase.from('crm_activities').select('*')
        if (activities) this.activities = activities

        const { data: automations } = await supabase.from('crm_automations').select('*')
        if (automations) this.automations = automations

        // 2. If no data in Supabase, try to sync from LocalStorage
        if (this.leads.length === 0) {
          const localLeads = localStorage.getItem('crm-leads')
          if (localLeads) {
            const parsed = JSON.parse(localLeads)
            for (const lead of parsed) {
              await this.createLead(lead, false) // create in Supabase
            }
          } else {
            this.addSampleData()
          }
        }

        // 3. Set up Realtime Subscriptions
        this.setupRealtime()

      } catch (err) {
        console.error('Error loading CRM data:', err)
      } finally {
        this.loading = false
      }
    },

    setupRealtime() {
      supabase.channel('crm_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => this.syncLeads())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_notes' }, () => this.syncLeads())
        .subscribe()
    },

    async syncLeads() {
      const { data } = await supabase.from('leads').select('*, notes:lead_notes(*)').order('updated_at', { ascending: false })
      if (data) {
        this.leads = data.map(l => ({
          ...l,
          instanceId: l.instance_id,
          whatsappNumber: l.whatsapp_number,
          profilePictureUrl: l.profile_picture_url,
          lastMessageDate: l.last_message_date,
          expectedCloseDate: l.expected_close_date,
          createdAt: l.created_at,
          updatedAt: l.updated_at
        }))
      }
    },

    // Create new lead
    async createLead(leadData, syncLocal = true) {
      const leadId = leadData.id || uuidv4()
      const newLeadRaw = {
        id: leadId,
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email || null,
        company: leadData.company || null,
        address: leadData.address || null,
        source: leadData.source || 'Manual',
        stage: leadData.stage || 'novo',
        value: leadData.value || 0,
        priority: leadData.priority || 'normal',
        score: leadData.score || 0,
        expected_close_date: leadData.expectedCloseDate || null,
        tags: leadData.tags || [],
        instance_id: leadData.instanceId || null,
        whatsapp_number: leadData.whatsappNumber || null,
        profile_picture_url: leadData.profilePictureUrl || null,
        last_message_date: leadData.lastMessageDate || null,
        created_by: 'Admin',
        updated_by: 'Admin'
      }

      const { data, error } = await supabase.from('leads').insert([newLeadRaw]).select().single()

      if (!error && data) {
        if (syncLocal) this.syncLeads()
        return data
      }
      return null
    },

    // Update lead
    async updateLead(id, updates) {
      const up = {
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        company: updates.company,
        address: updates.address,
        source: updates.source,
        stage: updates.stage,
        value: updates.value,
        priority: updates.priority,
        score: updates.score,
        expected_close_date: updates.expectedCloseDate,
        tags: updates.tags,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase.from('leads').update(up).eq('id', id)
      if (!error) {
        this.syncLeads()
      }
    },

    // Move lead to different stage
    async moveLead(leadId, newStage) {
      const lead = this.leads.find(l => l.id === leadId)
      if (lead) {
        const oldStage = lead.stage
        const { error } = await supabase.from('leads').update({ stage: newStage, updated_at: new Date().toISOString() }).eq('id', leadId)

        if (!error) {
          await this.addNote(leadId, `Lead movido de "${this.getColumnName(oldStage)}" para "${this.getColumnName(newStage)}"`, 'stage_change')
          this.syncLeads()
        }
      }
    },

    getColumnName(columnId) {
      const column = this.columns.find(c => c.id === columnId)
      return column ? column.name : columnId
    },

    // Delete lead
    async deleteLead(id) {
      const { error } = await supabase.from('leads').delete().eq('id', id)
      if (!error) {
        this.syncLeads()
        return true
      }
      return false
    },

    // Add note to lead
    async addNote(leadId, noteText, noteType = 'manual') {
      const { data, error } = await supabase.from('lead_notes').insert([{
        lead_id: leadId,
        text: noteText,
        type: noteType,
        author: 'Admin'
      }]).select().single()

      if (!error) {
        this.syncLeads()
        return data
      }
      return null
    },

    // Import WhatsApp contact as lead
    async importContactAsLead(contact, instanceId) {
      const existing = this.leads.find(
        lead => lead.whatsappNumber === contact.id || lead.phone === contact.id
      )

      if (existing) {
        return { success: false, message: 'Lead já existe', lead: existing }
      }

      const leadData = {
        name: contact.pushName || contact.id.split('@')[0],
        phone: contact.id,
        whatsappNumber: contact.id,
        source: 'WhatsApp',
        stage: 'novo',
        instanceId: instanceId,
        profilePictureUrl: contact.profilePictureUrl || null,
        tags: ['Importado do WhatsApp'],
        score: 30
      }

      const newLead = await this.createLead(leadData)
      return { success: !!newLead, message: newLead ? 'Sucesso' : 'Erro', lead: newLead }
    },

    async importMultipleContacts(contacts, instanceId) {
      const results = { success: 0, alreadyExists: 0 }
      for (const contact of contacts) {
        const res = await this.importContactAsLead(contact, instanceId)
        if (res.success) results.success++
        else if (res.message === 'Lead já existe') results.alreadyExists++
      }
      return results
    },

    // Static helpers (remain as they are for UI state)
    setSearchQuery(query) { this.searchQuery = query },
    setFilterSource(source) { this.filterSource = source },
    setFilterPriority(priority) { this.filterPriority = priority },
    setSortBy(sortBy, sortOrder = 'desc') {
      this.sortBy = sortBy
      this.sortOrder = sortOrder
    },
    clearFilters() {
      this.searchQuery = ''
      this.filterSource = null
      this.filterPriority = null
      this.sortBy = 'updatedAt'
      this.sortOrder = 'desc'
    },

    addSampleData() {
      const samples = [
        { name: 'João Silva', phone: '(11) 98765-4321', email: 'joao@empresa.com', company: 'Tech Solutions Ltda', source: 'WhatsApp', stage: 'novo', value: 15000, priority: 'high', score: 85, tags: ['Hot Lead', 'Empresa'] },
        { name: 'Maria Santos', phone: '(21) 99876-5432', email: 'maria@startup.io', company: 'StartupX', source: 'Site', stage: 'contato', value: 8000, priority: 'medium', score: 65, tags: ['Interessado', 'Startup'] },
        { name: 'Carlos Pereira', phone: '(51) 99234-8765', email: 'carlos@consultoria.com', company: 'Consultoria Premium', source: 'Site', stage: 'fechado', value: 30000, priority: 'normal', score: 95, tags: ['Sucesso', 'Recorrente'] }
      ]
      samples.forEach(s => this.createLead(s))
    },

    // Placeholder for local storage compatibility
    saveToLocalStorage() { /* No longer needed for leads but kept for interface consistency */ }
  }
})
