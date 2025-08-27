# SublimaCalc - Configuração PostgreSQL no Servidor

## 🚀 **Configuração para seu Servidor (100GB)**

### **Passo 1: Instalar PostgreSQL no Servidor**

#### **Ubuntu/Debian (mais comum):**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar status
sudo systemctl status postgresql
```

#### **CentOS/RHEL:**
```bash
# Instalar PostgreSQL
sudo yum install postgresql-server postgresql-contrib -y

# Inicializar banco
sudo postgresql-setup initdb

# Iniciar e habilitar
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **Passo 2: Configurar Usuário e Banco**

```bash
# Conectar como usuário postgres
sudo -u postgres psql

# Dentro do PostgreSQL:
```

```sql
-- Criar usuário para a aplicação
CREATE USER sublimacalc_user WITH PASSWORD 'sua_senha_super_segura_aqui';

-- Criar banco de dados
CREATE DATABASE sublimacalc OWNER sublimacalc_user;

-- Conceder permissões
GRANT ALL PRIVILEGES ON DATABASE sublimacalc TO sublimacalc_user;

-- Sair
\q
```

### **Passo 3: Configurar Segurança**

#### **Editar pg_hba.conf**
```bash
# Localizar arquivo
sudo find /etc -name "pg_hba.conf"

# Editar (exemplo para Ubuntu)
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

**Adicionar no final:**
```
# SublimaCalc App
host    sublimacalc    sublimacalc_user    0.0.0.0/0    md5
```

#### **Editar postgresql.conf**
```bash
# Localizar arquivo
sudo find /etc -name "postgresql.conf"

# Editar
sudo nano /etc/postgresql/*/main/postgresql.conf
```

**Configurar:**
```conf
# Permitir conexões externas
listen_addresses = '*'

# Ajustar configurações para seu servidor
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Logs
log_line_prefix = '%t [%p-%l] %q%u@%d '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
```

#### **Reiniciar PostgreSQL**
```bash
sudo systemctl restart postgresql
```

### **Passo 4: Configurar Firewall**
```bash
# Ubuntu/Debian (UFW)
sudo ufw allow 5432/tcp

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

### **Passo 5: Testar Conexão**
```bash
# Do seu computador local
psql -h SEU_IP_SERVIDOR -p 5432 -U sublimacalc_user -d sublimacalc
```

### **Passo 6: Configurar .env de Produção**

**No servidor, criar `.env`:**
```env
NODE_ENV=production
PORT=3000

# PostgreSQL no servidor (mesmo servidor)
DATABASE_URL=postgresql://sublimacalc_user:sua_senha_super_segura_aqui@localhost:5432/sublimacalc

# JWT Secrets (gerar novos!)
JWT_SECRET=jwt_secret_production_super_seguro_aqui
SESSION_SECRET=session_secret_production_super_seguro_aqui

# Google OAuth (configurar no Google Cloud)
GOOGLE_CLIENT_ID=seu_client_id_production
GOOGLE_CLIENT_SECRET=seu_client_secret_production

# URL do frontend em produção
FRONTEND_URL=https://seu-dominio.com

# Segurança
BCRYPT_ROUNDS=12
ENABLE_RATE_LIMITING=true
```

---

## 🔧 **Scripts de Manutenção no Servidor**

### **Backup Automático**
```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-sublimacalc.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/backups/sublimacalc"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/sublimacalc_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

pg_dump -h localhost -U sublimacalc_user -d sublimacalc > $BACKUP_FILE

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup criado: $BACKUP_FILE"
```

```bash
# Dar permissão
sudo chmod +x /usr/local/bin/backup-sublimacalc.sh

# Agendar no crontab (backup diário às 2h)
crontab -e
```

**Adicionar linha:**
```
0 2 * * * /usr/local/bin/backup-sublimacalc.sh
```

### **Monitoramento**
```bash
# Script de monitoramento
sudo nano /usr/local/bin/monitor-sublimacalc.sh
```

```bash
#!/bin/bash
echo "=== SublimaCalc Status ==="
echo "Data: $(date)"
echo ""

echo "PostgreSQL Status:"
sudo systemctl status postgresql --no-pager -l

echo ""
echo "Conexões ativas:"
sudo -u postgres psql -d sublimacalc -c "SELECT count(*) as connections FROM pg_stat_activity WHERE datname='sublimacalc';"

echo ""
echo "Tamanho do banco:"
sudo -u postgres psql -d sublimacalc -c "SELECT pg_size_pretty(pg_database_size('sublimacalc'));"

echo ""
echo "Espaço em disco:"
df -h
```

---

## 🔐 **Segurança Adicional**

### **SSL/TLS (Recomendado)**
```bash
# Gerar certificado auto-assinado (para teste)
sudo openssl req -new -x509 -days 365 -nodes -text -out server.crt -keyout server.key -subj "/CN=seu-servidor.com"

# Mover para pasta PostgreSQL
sudo cp server.crt server.key /var/lib/postgresql/*/main/
sudo chown postgres:postgres /var/lib/postgresql/*/main/server.*
```

**Configurar SSL no postgresql.conf:**
```conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
```

### **Backup de Segurança**
```bash
# Backup remoto (exemplo com rsync)
rsync -avz /home/backups/sublimacalc/ usuario@servidor-backup:/backups/sublimacalc/
```

---

## 🚀 **Deploy da Aplicação**

### **1. Clonar repositório no servidor**
```bash
git clone https://github.com/seu-usuario/sublimacalc.git
cd sublimacalc/backend-auth
```

### **2. Instalar dependências**
```bash
npm install --production
```

### **3. Configurar banco**
```bash
npm run create-db
npm run setup-db
```

### **4. Iniciar aplicação**
```bash
# Com PM2 (recomendado)
npm install -g pm2
pm2 start server.js --name "sublimacalc"
pm2 startup
pm2 save

# Ou com systemd
sudo nano /etc/systemd/system/sublimacalc.service
```

**Arquivo systemd:**
```ini
[Unit]
Description=SublimaCalc Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/sublimacalc/backend-auth
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable sublimacalc
sudo systemctl start sublimacalc
```

---

## 📊 **Otimizações para 100GB**

### **Configurações PostgreSQL Otimizadas**
```conf
# postgresql.conf para servidor com 100GB
shared_buffers = 1GB                    # 25% da RAM
effective_cache_size = 3GB              # 75% da RAM  
work_mem = 8MB                          # Para queries complexas
maintenance_work_mem = 256MB            # Para operações de manutenção
checkpoint_completion_target = 0.9      # Spread checkpoints
wal_buffers = 16MB                      # WAL buffers
random_page_cost = 1.1                  # Para SSD
effective_io_concurrency = 200          # Para storage rápido
```

### **Logs e Monitoramento**
```conf
# Logs detalhados
log_min_duration_statement = 1000       # Log queries > 1s
log_statement = 'mod'                   # Log modifications
log_checkpoints = on
log_connections = on
log_disconnections = on
log_temp_files = 0
```

---

**Com essa configuração você terá um PostgreSQL robusto e seguro no seu servidor! 🚀**
