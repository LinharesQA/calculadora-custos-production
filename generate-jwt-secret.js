#!/usr/bin/env node

/**
 * Gerador de JWT Secret seguro para produção
 */

const crypto = require('crypto');

console.log('🔐 Gerando JWT Secret para produção...\n');

// Gerar chave de 256 bits (64 hex chars)
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('JWT_SECRET gerado:');
console.log('═'.repeat(80));
console.log(jwtSecret);
console.log('═'.repeat(80));

console.log('\n📋 Copie este valor para as variáveis de ambiente do EasyPanel:');
console.log(`JWT_SECRET=${jwtSecret}`);

console.log('\n🔒 Esta chave tem:');
console.log(`   - ${jwtSecret.length} caracteres hexadecimais`);
console.log(`   - ${jwtSecret.length * 4} bits de entropia`);
console.log('   - Adequada para JWT em produção');

console.log('\n⚠️  IMPORTANTE:');
console.log('   - Mantenha esta chave SECRETA');
console.log('   - Não compartilhe publicamente');
console.log('   - Use apenas em variáveis de ambiente seguras');
console.log('   - Se comprometida, gere uma nova');

console.log('\n✅ Chave pronta para uso em produção!\n');
