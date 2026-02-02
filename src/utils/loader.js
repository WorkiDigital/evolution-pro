/**
 * Utils for dynamic module loading with error handling
 */

// Função para carregar módulos dinamicamente conforme solicitado
export async function loadModule(modulePath) {
    try {
        const module = await import(/* @vite-ignore */ modulePath);
        console.log("Módulo carregado com sucesso:", module);
        return module;
    } catch (error) {
        console.error("Erro ao carregar módulo dinâmico:", error);
        throw error;
    }
}

// Exemplo de uso para carregar o módulo Chat (exemplo interno)
// loadModule('/src/views/Chat.vue')
//   .then(module => {
//     console.log("Módulo Chat carregado:", module);
//   })
//   .catch(error => {
//     console.error("Falha ao carregar módulo Chat:", error);
//   });
