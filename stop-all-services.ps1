# Script para parar todos os serviços de desenvolvimento
# Execute como Administrador

Write-Host "🛑 Parando todos os serviços de desenvolvimento..." -ForegroundColor Yellow

# Parar processos específicos por PID
Write-Host "Parando processos por PID..." -ForegroundColor Cyan
try { taskkill /f /pid 5868 2>$null; Write-Host "✅ Python (PID 5868) parado" } catch { Write-Host "❌ Erro ao parar Python" }
try { taskkill /f /pid 6096 2>$null; Write-Host "✅ Grafana (PID 6096) parado" } catch { Write-Host "❌ Erro ao parar Grafana" }
try { taskkill /f /pid 4688 2>$null; Write-Host "✅ Firebird (PID 4688) parado" } catch { Write-Host "❌ Erro ao parar Firebird" }

# Parar serviços do Windows
Write-Host "`nParando serviços do Windows..." -ForegroundColor Cyan
try { Stop-Service -Name "Grafana" -Force; Write-Host "✅ Serviço Grafana parado" } catch { Write-Host "❌ Erro ao parar serviço Grafana" }
try { Stop-Service -Name "FirebirdServerDefaultInstance" -Force; Write-Host "✅ Serviço Firebird parado" } catch { Write-Host "❌ Erro ao parar serviço Firebird" }
try { Stop-Service -Name "postgresql-x64-17" -Force; Write-Host "✅ Serviço PostgreSQL parado" } catch { Write-Host "❌ Erro ao parar serviço PostgreSQL" }

# Parar todos os processos Python
Write-Host "`nParando todos os processos Python..." -ForegroundColor Cyan
try { taskkill /f /im python.exe; Write-Host "✅ Todos os processos Python parados" } catch { Write-Host "❌ Nenhum processo Python encontrado" }

# Parar executáveis específicos
Write-Host "`nParando executáveis específicos..." -ForegroundColor Cyan
try { taskkill /f /im grafana.exe 2>$null; Write-Host "✅ Grafana.exe parado" } catch { Write-Host "❌ Grafana.exe não encontrado" }
try { taskkill /f /im firebird.exe 2>$null; Write-Host "✅ Firebird.exe parado" } catch { Write-Host "❌ Firebird.exe não encontrado" }

Write-Host "`n🎯 Script concluído! Pressione qualquer tecla para continuar..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
