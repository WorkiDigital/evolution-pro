<template>
  <v-footer class="premium-footer">
    <div class="footer-content">
      <div class="footer-left">
        <v-btn
          @click="about"
          variant="text"
          size="small"
          class="footer-btn"
        >
          <v-icon start size="16">mdi-information</v-icon>
          {{ $t("about.title") }}
        </v-btn>
        <v-btn
          @click="contribute"
          variant="text"
          size="small"
          class="footer-btn contribute-btn"
        >
          <v-icon start size="16">mdi-hand-coin</v-icon>
          {{ $t("contribute.button") }}
        </v-btn>
        <span class="version-text">v{{ version }}</span>
      </div>
      
      <div class="footer-right">
        <v-btn
          v-for="(link, i) in links"
          size="small"
          variant="text"
          :key="i"
          :href="link.url"
          target="_blank"
          class="footer-link"
        >
          <v-icon v-if="link.icon" :start="!!link.title" size="16">
            {{ link.icon }}
          </v-icon>
          {{ link.title }}
        </v-btn>
      </div>
    </div>
  </v-footer>
  
  <Contribute ref="contribute" />
  <About ref="about" />
</template>

<script>
import About from "@/components/modal/About.vue";
import Contribute from "@/components/modal/Contribute.vue";
import { version } from "../../../package.json";

export default {
  name: "AppFooter",
  data: () => ({
    version,
    links: [
      {
        title: "Discord",
        icon: "mdi-discord",
        url: "https://discord.gg/U66zvhV49B",
      },
      {
        title: "Postman",
        icon: "mdi-api",
        url: "https://www.postman.com/agenciadgcode/workspace/evolution-api/overview",
      },
      {
        title: "GitHub",
        icon: "mdi-github",
        url: "https://github.com/EvolutionAPI/evolution-api",
      },
      {
        title: "Docs",
        icon: "mdi-book-open-page-variant",
        url: "https://doc.evolution-api.com",
      },
    ],
  }),
  methods: {
    about() {
      this.$refs.about.open();
    },
    contribute() {
      this.$refs.contribute.open();
    },
  },
  components: { Contribute, About },
};
</script>

<style scoped>
.premium-footer {
  background: linear-gradient(180deg, transparent, rgba(15, 15, 26, 0.9)) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.04) !important;
  padding: 16px 24px !important;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-btn {
  color: rgba(255, 255, 255, 0.5);
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  font-size: 0.8rem;
}

.footer-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
}

.contribute-btn {
  color: #7dd3fc;
}

.contribute-btn:hover {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}

.version-text {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-left: 8px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.4);
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
  font-size: 0.8rem;
}

.footer-link:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 768px) {
  .premium-footer {
    padding: 12px 16px !important;
  }
  
  .footer-content {
    justify-content: center;
  }
  
  .footer-left,
  .footer-right {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .footer-link span {
    display: none;
  }
}
</style>
