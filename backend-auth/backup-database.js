#!/usr/bin/env node

/**
 * SublimaCalc - Database Backup Script
 * Script para fazer backup dos dados do PostgreSQL
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function backupDatabase() {
    const dbName = process.env.DB_NAME || 'sublimacalc';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 5432;

    // Criar pasta de backups se não existir
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Nome do arquivo de backup com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `sublimacalc-backup-${timestamp}.sql`);

    // Comando pg_dump
    const command = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${backupFile}" --no-password`;

    console.log('🔄 Iniciando backup do banco de dados...');
    console.log(`📍 Banco: ${dbName}`);
    console.log(`📁 Arquivo: ${backupFile}`);

    return new Promise((resolve, reject) => {
        exec(command, {
            env: {
                ...process.env,
                PGPASSWORD: process.env.DB_PASSWORD
            }
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erro no backup:', error.message);
                if (stderr) console.error('STDERR:', stderr);
                reject(error);
                return;
            }

            // Verificar se arquivo foi criado
            if (fs.existsSync(backupFile)) {
                const stats = fs.statSync(backupFile);
                const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

                console.log('✅ Backup concluído com sucesso!');
                console.log(`📊 Tamanho: ${fileSizeInMB} MB`);
                console.log(`📁 Local: ${backupFile}`);

                resolve(backupFile);
            } else {
                reject(new Error('Arquivo de backup não foi criado'));
            }
        });
    });
}

async function restoreDatabase(backupFile) {
    const dbName = process.env.DB_NAME || 'sublimacalc';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || 5432;

    if (!fs.existsSync(backupFile)) {
        throw new Error(`Arquivo de backup não encontrado: ${backupFile}`);
    }

    console.log('🔄 Iniciando restore do banco de dados...');
    console.log(`📁 Arquivo: ${backupFile}`);
    console.log(`📍 Banco: ${dbName}`);

    // Comando psql para restore
    const command = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f "${backupFile}" --no-password`;

    return new Promise((resolve, reject) => {
        exec(command, {
            env: {
                ...process.env,
                PGPASSWORD: process.env.DB_PASSWORD
            }
        }, (error, stdout, stderr) => {
            if (error) {
                console.error('❌ Erro no restore:', error.message);
                if (stderr) console.error('STDERR:', stderr);
                reject(error);
                return;
            }

            console.log('✅ Restore concluído com sucesso!');
            resolve();
        });
    });
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const action = args[0];

    if (action === 'backup') {
        backupDatabase().catch(console.error);
    } else if (action === 'restore') {
        const backupFile = args[1];
        if (!backupFile) {
            console.error('❌ Especifique o arquivo de backup: npm run db:restore <arquivo>');
            process.exit(1);
        }
        restoreDatabase(backupFile).catch(console.error);
    } else {
        console.log('📋 Uso:');
        console.log('  npm run db:backup    - Fazer backup');
        console.log('  npm run db:restore <arquivo> - Restaurar backup');
    }
}

module.exports = { backupDatabase, restoreDatabase };
