// Teste de validação - execute no console do navegador
console.log('🧪 Iniciando teste de validação...');

// Simular dados de teste que causam erro
const testMold = { name: "teste1", width: 168, height: 160 };
const testRoll = { name: "teste", width: 160 };

console.log('📊 Dados de teste:');
console.log('Molde:', testMold);
console.log('Bobina:', testRoll);

// Testar cálculo moldsAcross
const moldsAcross = Math.floor(testRoll.width / testMold.width);
console.log('🔢 moldsAcross calculado:', moldsAcross);

if (moldsAcross === 0) {
    console.log('✅ VALIDAÇÃO FUNCIONANDO: Erro detectado corretamente!');
    console.log(`❌ Erro: Molde "${testMold.name}" (${testMold.width}cm) é maior que a largura da bobina "${testRoll.name}" (${testRoll.width}cm)`);
} else {
    console.log('❌ VALIDAÇÃO FALHOU: moldsAcross deveria ser 0, mas é:', moldsAcross);
}

// Teste adicional para verificar se Math.floor está funcionando corretamente
console.log('🔍 Teste Math.floor:');
console.log('160 / 168 =', 160 / 168);
console.log('Math.floor(160 / 168) =', Math.floor(160 / 168));
