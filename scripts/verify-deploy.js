#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * Checks if the project is ready for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando projeto para deploy na Vercel...\n');

let errors = 0;
let warnings = 0;

// Check 1: Environment variables example
console.log('1️⃣  Verificando .env.example...');
if (fs.existsSync('.env.example')) {
    console.log('   ✅ .env.example encontrado');
} else {
    console.log('   ❌ .env.example não encontrado');
    errors++;
}

// Check 2: Vercel configuration
console.log('\n2️⃣  Verificando vercel.json...');
if (fs.existsSync('vercel.json')) {
    console.log('   ✅ vercel.json encontrado');
    try {
        const config = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        if (config.rewrites) {
            console.log('   ✅ Rewrites configurados (SPA routing)');
        } else {
            console.log('   ⚠️  Rewrites não configurados');
            warnings++;
        }
    } catch (e) {
        console.log('   ❌ Erro ao ler vercel.json:', e.message);
        errors++;
    }
} else {
    console.log('   ❌ vercel.json não encontrado');
    errors++;
}

// Check 3: Build script
console.log('\n3️⃣  Verificando scripts de build...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.scripts && packageJson.scripts.build) {
    console.log('   ✅ Script de build encontrado:', packageJson.scripts.build);
} else {
    console.log('   ❌ Script de build não encontrado');
    errors++;
}

if (packageJson.scripts && packageJson.scripts.preview) {
    console.log('   ✅ Script de preview encontrado');
} else {
    console.log('   ⚠️  Script de preview não encontrado');
    warnings++;
}

// Check 4: Dependencies
console.log('\n4️⃣  Verificando dependências críticas...');
const criticalDeps = ['vue', 'vue-router', 'pinia', 'vuetify', '@supabase/supabase-js'];
criticalDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
        console.log(`   ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
        console.log(`   ❌ ${dep} não encontrado`);
        errors++;
    }
});

// Check 5: Dist directory
console.log('\n5️⃣  Verificando diretório de build...');
if (fs.existsSync('dist')) {
    console.log('   ⚠️  Diretório dist existe (será recriado no deploy)');
    warnings++;
} else {
    console.log('   ✅ Diretório dist não existe (será criado no build)');
}

// Check 6: Git
console.log('\n6️⃣  Verificando Git...');
if (fs.existsSync('.git')) {
    console.log('   ✅ Repositório Git inicializado');
} else {
    console.log('   ⚠️  Repositório Git não encontrado');
    console.log('      Execute: git init');
    warnings++;
}

if (fs.existsSync('.gitignore')) {
    console.log('   ✅ .gitignore encontrado');
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('.env')) {
        console.log('   ✅ .env está no .gitignore');
    } else {
        console.log('   ❌ .env não está no .gitignore');
        errors++;
    }
    if (gitignore.includes('.vercel')) {
        console.log('   ✅ .vercel está no .gitignore');
    } else {
        console.log('   ⚠️  .vercel não está no .gitignore');
        warnings++;
    }
} else {
    console.log('   ❌ .gitignore não encontrado');
    errors++;
}

// Check 7: Environment variables
console.log('\n7️⃣  Verificando variáveis de ambiente...');
if (fs.existsSync('.env')) {
    console.log('   ✅ Arquivo .env encontrado (local)');
    console.log('   ⚠️  Lembre-se de configurar no Vercel Dashboard');
    warnings++;
} else {
    console.log('   ⚠️  Arquivo .env não encontrado');
    console.log('      Crie baseado no .env.example');
    warnings++;
}

// Check 8: Public directory
console.log('\n8️⃣  Verificando diretório public...');
if (fs.existsSync('public')) {
    console.log('   ✅ Diretório public encontrado');
    if (fs.existsSync('public/favicon.ico')) {
        console.log('   ✅ favicon.ico encontrado');
    } else {
        console.log('   ⚠️  favicon.ico não encontrado');
        warnings++;
    }
} else {
    console.log('   ⚠️  Diretório public não encontrado');
    warnings++;
}

// Check 9: Node version
console.log('\n9️⃣  Verificando versão do Node...');
if (packageJson.engines && packageJson.engines.node) {
    console.log('   ✅ Versão do Node especificada:', packageJson.engines.node);
} else {
    console.log('   ⚠️  Versão do Node não especificada');
    warnings++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMO DA VERIFICAÇÃO');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
    console.log('✅ Projeto pronto para deploy! 🚀');
    console.log('\nPróximos passos:');
    console.log('1. git add .');
    console.log('2. git commit -m "Preparar para deploy"');
    console.log('3. git push origin main');
    console.log('4. Importar no Vercel: https://vercel.com/new');
    process.exit(0);
} else {
    if (errors > 0) {
        console.log(`❌ ${errors} erro(s) encontrado(s)`);
    }
    if (warnings > 0) {
        console.log(`⚠️  ${warnings} aviso(s) encontrado(s)`);
    }

    console.log('\n📝 Corrija os erros antes de fazer deploy.');
    console.log('📚 Consulte: DEPLOY_VERCEL.md');

    if (errors > 0) {
        process.exit(1);
    } else {
        console.log('\n⚠️  Avisos não impedem o deploy, mas é recomendado corrigi-los.');
        process.exit(0);
    }
}
