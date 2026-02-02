<template>
  <v-card variant="outlined" :loading="loading">
    <v-card-title
      class="d-flex align-center"
      @click="toggleExpanded"
      style="cursor: pointer"
      v-ripple
    >
      <v-icon start>mdi-account-box</v-icon>
      {{ $t("contacts.title") }}
      <v-spacer></v-spacer>
      <v-btn
        size="small"
        icon
        :disabled="loading"
        variant="tonal"
        @click.stop="toggleExpanded"
        :style="{ transform: expanded ? 'rotate(180deg)' : '' }"
      >
        <v-icon>mdi-chevron-down</v-icon>
      </v-btn>
    </v-card-title>
    <v-card-text v-if="expanded">
      <v-alert v-if="error" type="error" class="mb-3">
        {{ error }}
      </v-alert>

      <v-text-field
        v-model="search"
        :label="$t('search')"
        outlined
        clearable
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3"
      />

      <v-data-table
        :headers="[
          { title: $t('name'), value: 'pushName', sortable: true },
          {
            title: 'Whatsapp',
            value: 'id',
          },
          {
            title: 'Ações',
            value: 'actions',
            sortable: false,
            align: 'end'
          }
        ]"
        :items="contacts"
        v-model:sort-by="sortBy"
        :no-data-text="loading ? '' : 'Nenhum contato encontrado'"
        :search="search"
        :rows-per-page-items="[5, 10, 25, 50, 100]"
        :items-per-page="5"
        class="elevation-0"
      >
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.pushName="{ item }">
          <div>
            <v-avatar size="40" class="mr-2">
              <v-img
                v-if="item.profilePictureUrl"
                :src="item.profilePictureUrl"
              />
              <v-icon v-else size="40">mdi-account-circle</v-icon>
            </v-avatar>
            <b>{{ item.pushName }}</b>
            <v-chip
              v-if="item.id === instance.instance.owner"
              size="x-small"
              label
              color="success"
            >
              Instância
            </v-chip>
          </div>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.id="{ item }">
          <v-chip size="x-small" outlined color="primary" @click="copy(item)">
            {{ item.id }}
            <v-icon
              size="14"
              class="ml-1"
              v-if="copied.includes(item.id)"
              color="primary"
            >
              mdi-check
            </v-icon>
            <v-icon size="14" class="ml-1" v-else color="primary">
              mdi-content-copy
            </v-icon>
          </v-chip>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            v-if="!isInCRM(item)"
            size="x-small"
            color="success"
            variant="tonal"
            @click.stop="addToCRM(item)"
            :loading="addingToCRM.includes(item.id)"
          >
            <v-icon start size="small">mdi-plus</v-icon>
            CRM
          </v-btn>
          <v-chip
            v-else
            size="x-small"
            color="success"
            variant="outlined"
          >
            <v-icon start size="small">mdi-check</v-icon>
            No CRM
          </v-chip>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script>
import instanceController from "@/services/instanceController";
import copyToClipboard from "@/helpers/copyToClipboard";
import { useCrmStore } from "@/store/crm";

export default {
  name: "MyChats",
  props: {
    instance: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const crmStore = useCrmStore()
    return { crmStore }
  },
  data: () => ({
    expanded: false,
    loading: false,
    error: false,
    sortBy: [{ key: "lastMsgTimestamp", order: "desc" }],
    contacts: [],
    copied: [],
    search: "",
    addingToCRM: [],
  }),

  methods: {
    toggleExpanded() {
      if (this.loading) return;
      this.expanded = !this.expanded;
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return "";
      return new Date(timestamp).toLocaleString();
    },
    copy(group) {
      if (this.copied.includes(group.id)) return;

      copyToClipboard(group.id);

      this.copied.push(group.id);
      setTimeout(() => {
        this.copied = this.copied.filter((i) => i !== group.id);
      }, 2000);
    },
    async loadContacts() {
      try {
        this.loading = true;
        this.error = false;
        const contacts = await instanceController.chat.getContacts(
          this.instance.instance.instanceName
        );

        this.contacts = contacts.filter((c) => !c.id.includes("@g.us"));
      } catch (e) {
        this.error = e.message?.message || e.message || e;
      } finally {
        this.loading = false;
      }
    },
    isInCRM(contact) {
      return this.crmStore.leads.some(
        lead => lead.whatsappNumber === contact.id || lead.phone === contact.id
      )
    },
    async addToCRM(contact) {
      if (this.isInCRM(contact)) return
      
      this.addingToCRM.push(contact.id)
      
      try {
        const result = this.crmStore.importContactAsLead(
          contact,
          this.instance.instance.instanceName
        )
        
        if (result.success) {
          // Visual feedback - could add a toast notification here
          setTimeout(() => {
            this.addingToCRM = this.addingToCRM.filter(id => id !== contact.id)
          }, 500)
        }
      } catch (e) {
        console.error('Erro ao adicionar ao CRM:', e)
        this.addingToCRM = this.addingToCRM.filter(id => id !== contact.id)
      }
    }
  },

  watch: {
    expanded: {
      handler() {
        if (this.expanded) this.loadContacts();
      },
    },
  },
  mounted() {
    // Load CRM data
    this.crmStore.loadFromLocalStorage()
  }
};
</script>

<style></style>
