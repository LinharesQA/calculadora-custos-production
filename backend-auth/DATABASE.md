# SublimaCalc - Configuração do Banco de Dados

## 🗄️ PostgreSQL Setup

### Pré-requisitos
- PostgreSQL 12+ instalado
- Node.js 18+
- Credenciais de administrador do PostgreSQL

### 📦 Instalação PostgreSQL

#### Windows
```powershell
# Chocolatey
choco install postgresql

# Ou download manual
# https://www.postgresql.org/download/windows/
```

#### macOS
```bash
# Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 🔧 Configuração Inicial

#### 1. Setup Automático (Recomendado)
```powershell
# Windows
.\setup-postgres.ps1

# Linux/macOS
chmod +x setup-postgres.sh
./setup-postgres.sh
```

#### 2. Setup Manual

##### Configurar .env
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sublimacalc
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
```

##### Criar banco
```bash
# Opção 1: Script automatizado
npm run create-db

# Opção 2: Comando direto
createdb -U postgres sublimacalc
```

##### Criar tabelas
```bash
npm run setup-db
```

### 📊 Estrutura do Banco

#### Tabelas Principais

**users** - Usuários do sistema
```sql
id (UUID, PK)
google_id (VARCHAR, UNIQUE)
email (VARCHAR, UNIQUE)
name (VARCHAR)
picture (VARCHAR)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**molds** - Moldes para sublimação
```sql
id (UUID, PK)
user_id (UUID, FK -> users.id)
name (VARCHAR)
width (DECIMAL)
height (DECIMAL)
area (DECIMAL, COMPUTED)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**rolls** - Bobinas de material
```sql
id (UUID, PK)
user_id (UUID, FK -> users.id)
name (VARCHAR)
width (DECIMAL)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

**projects** - Projetos de cálculo
```sql
id (UUID, PK)
user_id (UUID, FK -> users.id)
name (VARCHAR)
roll_id (UUID, FK -> rolls.id)
roll_price (DECIMAL)
roll_length (DECIMAL)
profit_margin (DECIMAL)
additional_cost (DECIMAL)
total_cost (DECIMAL)
total_price (DECIMAL)
total_profit (DECIMAL)
status (ENUM: draft, calculated, completed)
items (JSONB)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Índices Criados
- **users**: google_id (UNIQUE), email (UNIQUE)
- **molds**: user_id, name
- **rolls**: user_id, name
- **projects**: user_id, status, created_at

### 🔧 Comandos Úteis

#### Gerenciamento
```bash
# Testar conexão
npm run db:status

# Recriar banco e tabelas
npm run db:reset

# Ver logs
npm run logs
```

#### Backup e Restore
```bash
# Fazer backup
npm run db:backup

# Restaurar backup
npm run db:restore caminho/para/backup.sql

# Backup manual
pg_dump -U postgres -d sublimacalc > backup.sql

# Restore manual
psql -U postgres -d sublimacalc < backup.sql
```

#### Monitoramento
```sql
-- Verificar conexões ativas
SELECT * FROM pg_stat_activity WHERE datname = 'sublimacalc';

-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size('sublimacalc'));

-- Estatísticas das tabelas
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables;
```

### 🔒 Segurança

#### Configuração de Usuário
```sql
-- Criar usuário específico para a aplicação
CREATE USER sublimacalc_user WITH PASSWORD 'senha_segura';

-- Conceder permissões mínimas
GRANT CONNECT ON DATABASE sublimacalc TO sublimacalc_user;
GRANT USAGE ON SCHEMA public TO sublimacalc_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sublimacalc_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sublimacalc_user;
```

#### Backup de Segurança
```bash
# Backup automático diário (crontab)
0 2 * * * cd /path/to/backend && npm run db:backup

# Rotação de backups (manter últimos 7 dias)
find /path/to/backups -name "*.sql" -mtime +7 -delete
```

### 🚨 Troubleshooting

#### Problemas Comuns

**Erro de Conexão**
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql    # Linux
net start postgresql-x64-*         # Windows

# Verificar porta
netstat -an | grep :5432
```

**Erro de Autenticação**
```bash
# Verificar arquivo pg_hba.conf
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Adicionar linha para autenticação local
local   all   all   md5
```

**Banco não encontrado**
```bash
# Listar bancos existentes
psql -U postgres -l

# Recriar banco
npm run create-db
```

**Tabelas não criadas**
```bash
# Verificar logs
npm run logs

# Recriar tabelas
npm run setup-db

# Verificar manualmente
psql -U postgres -d sublimacalc -c "\dt"
```

### 🔧 Configuração para Produção

#### Otimizações PostgreSQL
```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Pool de Conexões
```javascript
// config/database.js
pool: {
    max: 20,
    min: 5,
    idle: 10000,
    acquire: 60000,
}
```

#### Monitoramento
- Configure logs detalhados
- Monitore performance das queries
- Configure alertas para conexões/espaço em disco
- Implemente rotação de logs

### 📈 Manutenção

#### Rotinas Recomendadas
```sql
-- Analisar estatísticas (semanalmente)
ANALYZE;

-- Limpeza de vacuum (mensalmente)
VACUUM ANALYZE;

-- Reindexar (conforme necessário)
REINDEX DATABASE sublimacalc;
```

#### Monitoramento de Crescimento
```sql
-- Crescimento das tabelas
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```
