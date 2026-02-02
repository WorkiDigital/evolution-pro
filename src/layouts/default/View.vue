<template>
  <v-main class="main-view">
    <router-view />
  </v-main>
</template>

<script>
export default {
  name: 'DefaultView'
}
</script>

<style scoped>
.main-view {
  background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
  min-height: calc(100vh - 64px);
}

.main-view :deep(.v-main__wrap) {
  padding-top: 0;
}
</style>
