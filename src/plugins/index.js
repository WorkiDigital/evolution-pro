/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { vuetify, i18n } from './vuetify'
import pinia from '../store'
import router from '../router'
import supabase from './supabase'
import VueApexCharts from "vue3-apexcharts";

import HelpTooltip from '@/components/global/HelpTooltip.vue'

export function registerPlugins(app) {
  app
    .use(i18n)
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(supabase)
    .use(VueApexCharts)
    .component('HelpTooltip', HelpTooltip)

}

