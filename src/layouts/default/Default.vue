<template>
  <v-app>
    <side-bar />
    <default-bar />

    <v-main>
      <default-view />
    </v-main>

    <default-footer />
  </v-app>
</template>

<script setup>
import SideBar from "./SideBar.vue";
import DefaultBar from "./AppBar.vue";
import DefaultView from "./View.vue";
import DefaultFooter from "./AppFooter.vue";
</script>
