/**
 * 📊 Widget de Monitoramento de Performance - Desenvolvimento
 * 
 * Mostra estatísticas em tempo real do sistema de performance
 */

class PerformanceMonitor {
    constructor() {
        this.isEnabled = false;
        this.widget = null;
        this.updateInterval = null;
        this.stats = {
            requests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            debounces: 0,
            totalLatency: 0,
            avgLatency: 0
        };

        // Só ativar em desenvolvimento
        if (this.isDevelopment()) {
            this.init();
        }
    }

    isDevelopment() {
        return window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.search.includes('debug=true');
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
        this.startMonitoring();
        this.addKeyboardShortcuts();
        console.log('🔍 Performance Monitor ativado');
    }

    createWidget() {
        this.widget = document.createElement('div');
        this.widget.id = 'performance-monitor';
        this.widget.className = 'perf-monitor';
        this.widget.innerHTML = this.getWidgetHTML();
        document.body.appendChild(this.widget);

        // Adicionar estilos
        this.addStyles();
    }

    getWidgetHTML() {
        return `
            <div class="perf-header">
                <span class="perf-title">⚡ Performance</span>
                <div class="perf-controls">
                    <button class="perf-btn" onclick="performanceMonitor.toggle()">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="perf-btn" onclick="performanceMonitor.reset()">
                        <i class="fas fa-refresh"></i>
                    </button>
                    <button class="perf-btn" onclick="performanceMonitor.export()">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
            <div class="perf-content">
                <div class="perf-section">
                    <div class="perf-metric">
                        <span class="perf-label">Requests:</span>
                        <span class="perf-value" id="perf-requests">0</span>
                    </div>
                    <div class="perf-metric">
                        <span class="perf-label">Cache Hits:</span>
                        <span class="perf-value good" id="perf-cache-hits">0</span>
                    </div>
                    <div class="perf-metric">
                        <span class="perf-label">Cache Misses:</span>
                        <span class="perf-value warning" id="perf-cache-misses">0</span>
                    </div>
                    <div class="perf-metric">
                        <span class="perf-label">Hit Rate:</span>
                        <span class="perf-value" id="perf-hit-rate">0%</span>
                    </div>
                </div>
                
                <div class="perf-section">
                    <div class="perf-metric">
                        <span class="perf-label">Debounces:</span>
                        <span class="perf-value" id="perf-debounces">0</span>
                    </div>
                    <div class="perf-metric">
                        <span class="perf-label">Avg Latency:</span>
                        <span class="perf-value" id="perf-latency">0ms</span>
                    </div>
                    <div class="perf-metric">
                        <span class="perf-label">Memory:</span>
                        <span class="perf-value" id="perf-memory">0 MB</span>
                    </div>
                    <div class="perf-metric">
                        <span class="perf-label">Cache Size:</span>
                        <span class="perf-value" id="perf-cache-size">0</span>
                    </div>
                </div>

                <div class="perf-section">
                    <div class="perf-chart" id="perf-chart">
                        <canvas id="perf-canvas" width="200" height="60"></canvas>
                    </div>
                </div>

                <div class="perf-section">
                    <div class="perf-logs" id="perf-logs">
                        <div class="perf-log">📊 Performance Monitor iniciado</div>
                    </div>
                </div>
            </div>
        `;
    }

    addStyles() {
        const styles = `
            .perf-monitor {
                position: fixed;
                top: 80px;
                right: 10px;
                width: 280px;
                background: rgba(0, 0, 0, 0.95);
                color: #00ff00;
                border-radius: 8px;
                padding: 0;
                font-family: 'JetBrains Mono', monospace;
                font-size: 11px;
                z-index: 99999;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                border: 1px solid #333;
                max-height: 500px;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .perf-monitor.collapsed .perf-content {
                display: none;
            }

            .perf-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #1a1a1a;
                padding: 8px 12px;
                border-bottom: 1px solid #333;
                cursor: pointer;
            }

            .perf-title {
                font-weight: 600;
                color: #00ff00;
            }

            .perf-controls {
                display: flex;
                gap: 4px;
            }

            .perf-btn {
                background: none;
                border: 1px solid #333;
                color: #888;
                padding: 2px 6px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 10px;
                transition: all 0.2s ease;
            }

            .perf-btn:hover {
                background: #333;
                color: #00ff00;
            }

            .perf-content {
                padding: 10px;
                max-height: 400px;
                overflow-y: auto;
            }

            .perf-section {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #333;
            }

            .perf-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }

            .perf-metric {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
            }

            .perf-label {
                color: #888;
            }

            .perf-value {
                color: #00ff00;
                font-weight: 600;
            }

            .perf-value.good { color: #22c55e; }
            .perf-value.warning { color: #f59e0b; }
            .perf-value.error { color: #ef4444; }

            .perf-chart {
                background: #111;
                border-radius: 4px;
                padding: 5px;
            }

            .perf-logs {
                max-height: 100px;
                overflow-y: auto;
                background: #111;
                border-radius: 4px;
                padding: 8px;
            }

            .perf-log {
                margin-bottom: 2px;
                font-size: 10px;
                color: #888;
                border-left: 2px solid #333;
                padding-left: 6px;
            }

            .perf-log.success { border-color: #22c55e; color: #22c55e; }
            .perf-log.warning { border-color: #f59e0b; color: #f59e0b; }
            .perf-log.error { border-color: #ef4444; color: #ef4444; }

            @media (max-width: 768px) {
                .perf-monitor {
                    width: 250px;
                    right: 5px;
                    top: 60px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    attachEventListeners() {
        // Interceptar requisições de API
        this.interceptAPI();

        // Monitorar eventos de cache
        this.monitorCache();

        // Monitorar performance do navegador
        this.monitorBrowserPerformance();
    }

    interceptAPI() {
        if (!window.api) return;

        const originalRequest = window.api.request;
        const self = this;

        window.api.request = async function (...args) {
            const startTime = performance.now();
            self.stats.requests++;

            try {
                const result = await originalRequest.apply(this, args);
                const endTime = performance.now();
                const latency = endTime - startTime;

                self.updateLatency(latency);
                self.log(`✅ Request: ${latency.toFixed(1)}ms`, 'success');

                return result;
            } catch (error) {
                const endTime = performance.now();
                const latency = endTime - startTime;

                self.updateLatency(latency);
                self.log(`❌ Request failed: ${latency.toFixed(1)}ms`, 'error');

                throw error;
            }
        };
    }

    monitorCache() {
        if (!window.frontendPerformance) return;

        const originalGetCache = window.frontendPerformance.getCache;
        const originalSetCache = window.frontendPerformance.setCache;
        const self = this;

        window.frontendPerformance.getCache = function (key) {
            const result = originalGetCache.call(this, key);
            if (result !== null) {
                self.stats.cacheHits++;
                self.log(`📦 Cache HIT: ${key}`, 'success');
            } else {
                self.stats.cacheMisses++;
                self.log(`💨 Cache MISS: ${key}`, 'warning');
            }
            return result;
        };

        window.frontendPerformance.setCache = function (key, data, type) {
            const result = originalSetCache.call(this, key, data, type);
            self.log(`💾 Cache SET: ${key}`, 'success');
            return result;
        };
    }

    monitorBrowserPerformance() {
        // Monitorar performance de navegação
        if ('navigation' in performance) {
            const navTiming = performance.getEntriesByType('navigation')[0];
            if (navTiming) {
                this.log(`🚀 Page load: ${navTiming.loadEventEnd - navTiming.loadEventStart}ms`);
            }
        }

        // Monitorar long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > 50) {
                            this.log(`⚠️ Long task: ${entry.duration.toFixed(1)}ms`, 'warning');
                        }
                    }
                });
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('Long task monitoring not supported');
            }
        }
    }

    startMonitoring() {
        this.updateInterval = setInterval(() => {
            this.updateWidget();
        }, 1000);
    }

    updateWidget() {
        if (!this.widget || this.widget.classList.contains('collapsed')) return;

        // Atualizar métricas
        this.updateElement('perf-requests', this.stats.requests);
        this.updateElement('perf-cache-hits', this.stats.cacheHits);
        this.updateElement('perf-cache-misses', this.stats.cacheMisses);

        // Calcular hit rate
        const totalCacheRequests = this.stats.cacheHits + this.stats.cacheMisses;
        const hitRate = totalCacheRequests > 0 ? (this.stats.cacheHits / totalCacheRequests * 100).toFixed(1) : 0;
        this.updateElement('perf-hit-rate', `${hitRate}%`);

        // Latência média
        this.updateElement('perf-latency', `${this.stats.avgLatency.toFixed(1)}ms`);

        // Memória
        if ('memory' in performance) {
            const memory = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
            this.updateElement('perf-memory', `${memory} MB`);
        }

        // Tamanho do cache
        if (window.frontendPerformance) {
            const cacheSize = window.frontendPerformance.cache.size;
            this.updateElement('perf-cache-size', cacheSize);
        }

        // Atualizar gráfico simples
        this.updateChart();
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateLatency(latency) {
        this.stats.totalLatency += latency;
        this.stats.avgLatency = this.stats.totalLatency / this.stats.requests;
    }

    updateChart() {
        // Implementação básica de gráfico de latência
        const canvas = document.getElementById('perf-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar linha de latência média
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const y = canvas.height - (this.stats.avgLatency / 10); // Escala simples
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        // Adicionar texto
        ctx.fillStyle = '#888';
        ctx.font = '10px monospace';
        ctx.fillText(`${this.stats.avgLatency.toFixed(1)}ms`, 5, y - 5);
    }

    log(message, type = 'info') {
        const logsContainer = document.getElementById('perf-logs');
        if (!logsContainer) return;

        const logElement = document.createElement('div');
        logElement.className = `perf-log ${type}`;
        logElement.textContent = `${new Date().toLocaleTimeString()} ${message}`;

        logsContainer.appendChild(logElement);
        logsContainer.scrollTop = logsContainer.scrollHeight;

        // Limitar número de logs
        const logs = logsContainer.children;
        if (logs.length > 50) {
            logsContainer.removeChild(logs[0]);
        }
    }

    toggle() {
        if (!this.widget) return;
        this.widget.classList.toggle('collapsed');
    }

    reset() {
        this.stats = {
            requests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            debounces: 0,
            totalLatency: 0,
            avgLatency: 0
        };

        const logsContainer = document.getElementById('perf-logs');
        if (logsContainer) {
            logsContainer.innerHTML = '<div class="perf-log">📊 Estatísticas resetadas</div>';
        }

        this.log('🔄 Performance stats reset');
    }

    export() {
        const data = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            userAgent: navigator.userAgent,
            url: window.location.href,
            performance: {
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null,
                timing: performance.timing,
                navigation: performance.navigation
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.log('📄 Performance report exported');
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + Shift + P = Toggle performance monitor
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
                event.preventDefault();
                this.toggle();
            }

            // Ctrl/Cmd + Shift + R = Reset stats
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'R') {
                event.preventDefault();
                this.reset();
            }
        });
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        if (this.widget) {
            this.widget.remove();
        }

        this.log('🛑 Performance Monitor destroyed');
    }
}

// Inicializar monitor de performance
let performanceMonitor;
document.addEventListener('DOMContentLoaded', () => {
    performanceMonitor = new PerformanceMonitor();
});

// Cleanup automático
window.addEventListener('beforeunload', () => {
    if (performanceMonitor) {
        performanceMonitor.destroy();
    }
});
