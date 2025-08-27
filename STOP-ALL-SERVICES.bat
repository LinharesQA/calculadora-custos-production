@echo off
echo ============================================
echo    PARANDO TODOS OS SERVICOS DE DEV
echo ============================================

echo Parando processos...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im grafana.exe >nul 2>&1
taskkill /f /im firebird.exe >nul 2>&1

echo Parando servicos Windows...
net stop Grafana >nul 2>&1
net stop FirebirdServerDefaultInstance >nul 2>&1
net stop postgresql-x64-17 >nul 2>&1

echo Forcando parada por PID...
taskkill /f /pid 988 >nul 2>&1
taskkill /f /pid 10932 >nul 2>&1
taskkill /f /pid 5092 >nul 2>&1
taskkill /f /pid 3724 >nul 2>&1

echo ============================================
echo    TODOS OS SERVICOS FORAM PARADOS!
echo ============================================
pause
