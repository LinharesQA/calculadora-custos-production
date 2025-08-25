/**
 * Serviço de Geração de PDFs
 * 
 * Gera relatórios profissionais para os projetos
 */

export class PDFService {
    static async generateReport(projectData) {
        try {
            // Importa jsPDF dinamicamente para não carregar se não for usado
            const { jsPDF } = await import('jspdf');
            
            const doc = new jsPDF();
            
            // Configuração da fonte
            doc.setFont('helvetica');
            
            // Cabeçalho da empresa
            this.addHeader(doc, projectData);
            
            // Dados do projeto
            this.addProjectInfo(doc, projectData);
            
            // Resultados do cálculo
            this.addCalculationResults(doc, projectData);
            
            // Nova página para detalhes
            doc.addPage();
            this.addItemDetails(doc, projectData);
            
            // Rodapé
            this.addFooter(doc, projectData);
            
            // Salva o arquivo
            const fileName = this.generateFileName(projectData);
            doc.save(fileName);
            
            return true;
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            throw new Error('Erro ao gerar relatório PDF');
        }
    }

    static addHeader(doc, data) {
        // Logo/Cabeçalho da empresa
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('RELATÓRIO DE CÁLCULO DE CUSTOS', 20, 20);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Sistema de Automação - Módulo de Sublimação', 20, 30);
        
        // Linha separadora
        doc.line(20, 35, 190, 35);
        
        // Dados da empresa
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('EMPRESA:', 20, 45);
        doc.setFont('helvetica', 'normal');
        doc.text(data.companyName || 'Não informado', 50, 45);
        
        doc.setFont('helvetica', 'bold');
        doc.text('USUÁRIO:', 20, 52);
        doc.setFont('helvetica', 'normal');
        doc.text(data.userName || 'Não informado', 50, 52);
    }

    static addProjectInfo(doc, data) {
        let y = 65;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('INFORMAÇÕES DO PROJETO', 20, y);
        
        y += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Informações básicas
        doc.text(`Projeto: ${data.projectName}`, 25, y);
        y += 7;
        
        if (data.projectDate) {
            doc.text(`Data de Entrega: ${new Date(data.projectDate).toLocaleDateString('pt-BR')}`, 25, y);
            y += 7;
        }
        
        doc.text(`Calculado em: ${new Date(data.calculatedAt).toLocaleDateString('pt-BR')} às ${new Date(data.calculatedAt).toLocaleTimeString('pt-BR')}`, 25, y);
        y += 10;
        
        // Dados da bobina
        doc.setFont('helvetica', 'bold');
        doc.text('DADOS DA BOBINA:', 25, y);
        y += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`• Tipo: ${data.roll.name} (${data.roll.width}cm de largura)`, 30, y);
        y += 7;
        doc.text(`• Valor: ${data.rollPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 30, y);
        y += 7;
        doc.text(`• Comprimento: ${data.rollLength}m`, 30, y);
        y += 7;
        
        if (data.additionalCost > 0) {
            doc.text(`• Custos Adicionais: ${data.additionalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 30, y);
            y += 7;
        }
        
        doc.text(`• Margem de Lucro: ${data.profitMargin}%`, 30, y);
    }

    static addCalculationResults(doc, data) {
        const results = data.results;
        let y = 140;
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RESULTADOS DO CÁLCULO', 20, y);
        
        y += 15;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Resultados em duas colunas
        const leftCol = 25;
        const rightCol = 110;
        
        // Coluna esquerda - Custos
        doc.setFont('helvetica', 'bold');
        doc.text('CUSTOS:', leftCol, y);
        y += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`• Total de peças: ${results.totalPieces}`, leftCol, y);
        y += 7;
        doc.text(`• Papel necessário: ${results.totalLengthNeededM.toFixed(2)}m`, leftCol, y);
        y += 7;
        doc.text(`• Área total: ${results.totalSqmNeeded.toFixed(2)}m²`, leftCol, y);
        y += 7;
        doc.text(`• Custo do papel: ${results.totalPaperCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, leftCol, y);
        y += 7;
        doc.text(`• Custo total: ${results.totalCostWithAdditional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, leftCol, y);
        y += 7;
        doc.text(`• Custo por peça: ${results.costPerPiece.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, leftCol, y);
        
        // Coluna direita - Vendas
        y = 162; // Reset y para coluna direita
        doc.setFont('helvetica', 'bold');
        doc.text('VENDAS:', rightCol, y);
        y += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.text(`• Preço por peça: ${results.sellPricePerPiece.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, rightCol, y);
        y += 7;
        doc.text(`• Total de vendas: ${results.totalSellPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, rightCol, y);
        y += 7;
        doc.text(`• Lucro total: ${results.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, rightCol, y);
        y += 7;
        doc.text(`• Margem realizada: ${((results.totalProfit / results.totalCostWithAdditional) * 100).toFixed(1)}%`, rightCol, y);
        
        // Destaque do lucro
        y += 15;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(`LUCRO LÍQUIDO: ${results.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, leftCol, y);
    }

    static addItemDetails(doc, data) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DETALHAMENTO POR ITEM', 20, 20);
        
        let y = 35;
        doc.setFontSize(10);
        
        // Cabeçalho da tabela
        doc.setFont('helvetica', 'bold');
        doc.text('Item', 20, y);
        doc.text('Qtd', 60, y);
        doc.text('Dimensões', 80, y);
        doc.text('Por Linha', 120, y);
        doc.text('Linhas', 145, y);
        doc.text('Comprimento', 165, y);
        
        y += 3;
        doc.line(20, y, 190, y); // Linha horizontal
        y += 7;
        
        // Itens
        doc.setFont('helvetica', 'normal');
        data.items.forEach((item, index) => {
            if (y > 250) {
                doc.addPage();
                y = 20;
            }
            
            doc.text(item.mold.name, 20, y);
            doc.text(`${item.qty}x`, 60, y);
            doc.text(`${item.mold.width}×${item.mold.height}cm`, 80, y);
            doc.text(`${item.moldsAcross}`, 120, y);
            doc.text(`${item.totalRows}`, 145, y);
            doc.text(`${item.lengthNeeded.toFixed(2)}m`, 165, y);
            
            y += 7;
        });
        
        // Resumo
        y += 10;
        doc.line(20, y, 190, y);
        y += 7;
        
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL: ${data.results.totalPieces} peças | ${data.results.totalLengthNeededM.toFixed(2)}m | ${data.results.totalSqmNeeded.toFixed(2)}m²`, 20, y);
    }

    static addFooter(doc, data) {
        const pageCount = doc.internal.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            // Rodapé
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Sistema de Automação - Módulo de Cálculo de Custos', 20, 285);
            doc.text(`Página ${i} de ${pageCount}`, 150, 285);
            doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 20, 290);
        }
    }

    static generateFileName(data) {
        const projectName = data.projectName.replace(/[^a-zA-Z0-9]/g, '_');
        const date = new Date().toISOString().split('T')[0];
        const companyName = data.companyName ? data.companyName.replace(/[^a-zA-Z0-9]/g, '_') : 'empresa';
        
        return `relatorio_custos_${companyName}_${projectName}_${date}.pdf`;
    }

    static async generateBatchReport(projects) {
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            
            // Relatório consolidado de múltiplos projetos
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('RELATÓRIO CONSOLIDADO DE PROJETOS', 20, 20);
            
            let y = 40;
            
            projects.forEach((project, index) => {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${project.projectName}`, 20, y);
                y += 7;
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`Peças: ${project.results.totalPieces} | Valor: ${project.results.totalSellPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} | Lucro: ${project.results.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 25, y);
                y += 10;
            });
            
            const fileName = `relatorio_consolidado_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            return true;
        } catch (error) {
            console.error('Erro ao gerar relatório consolidado:', error);
            throw error;
        }
    }
}
