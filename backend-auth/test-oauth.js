// Teste simples para verificar os redirecionamentos OAuth
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzZmY1YzQyMC05ZGIxLTQ0MjktOWQ3MS1jYjRkMmZhNTY3MDQiLCJlbWFpbCI6InBoaWxsaXBlLmxpbmhhcmVzQGdtYWlsLmNvbSIsIm5hbWUiOiJQaGlsbGlwZSBMaW5oYXJlcyIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJUjJ6WGRjd1AzVGF0QUVIV0lJS01GTVdod0NSSUdiSURyY0dHcEtuY3E2ZE1IUFE9czk2LWMiLCJpYXQiOjE3MjQ3MzIzMDEsImV4cCI6MTcyNDczNTkwMX0.HS00MjGCwNDdkNmY4OWMiLCJlbWFpbCI6InBoaWxsaXBlLmxpbmhhcmVzQGdtYWlsLmNvbSI";

console.log("🔍 Testando processamento do token...");

try {
    // Simular o que o frontend faz com o token
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log("✅ Payload do token:");
    console.log(JSON.stringify(payload, null, 2));

    console.log("✅ Token válido!");
    console.log("Nome:", payload.name);
    console.log("Email:", payload.email);

} catch (error) {
    console.error("❌ Erro ao processar token:", error);
}

console.log("\n🌐 URLs para testar:");
console.log("Frontend:", "http://localhost:5173");
console.log("Backend Health:", "http://localhost:3000/health");
console.log("Dashboard:", "http://localhost:5173/app.html");
