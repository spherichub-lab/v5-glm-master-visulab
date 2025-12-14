import saveAs from 'file-saver';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface ReportFilter {
  startDate?: string;
  endDate?: string;
  company?: string;
  title?: string; // Optional custom title
  groupByLabel?: string; // New: Label for the grouping header (e.g., "ÍNDICE DE REFRAÇÃO" or "PEDIDO")
}

interface ReportItem {
  index: string;     // Grouping key
  esfCil: string;    // Primary text
  treatment: string; // Secondary text
  quantity: number;  
  user?: string;
  time?: string;
}

export const generateTxtReport = (
  filters: ReportFilter,
  data: ReportItem[]
) => {
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
  const groupLabel = filters.groupByLabel || 'GRUPO';
  
  let content = '';
  
  // Header with Dynamic Title
  content += `${filters.title || 'RELATÓRIO DE FALTAS DE ESTOQUE'}\n`;
  content += '==================================================\n\n';
  
  // Metadata
  content += `Data: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}\n`;
  content += `Hora: ${format(new Date(), 'HH:mm:ss', { locale: ptBR })}\n\n`;
  
  content += `Empresa(s): ${filters.company || 'Todas'}\n`;
  if (filters.startDate && filters.endDate) {
      content += `Período: ${format(new Date(filters.startDate), 'dd/MM/yyyy')} a ${format(new Date(filters.endDate), 'dd/MM/yyyy')}\n`;
  }
  content += `Total de Itens: ${data.length}\n`;
  content += '__________________________________________________\n\n';

  // Group data
  const groupedData: Record<string, ReportItem[]> = {};

  data.forEach(item => {
    if (!groupedData[item.index]) {
      groupedData[item.index] = [];
    }
    groupedData[item.index].push(item);
  });

  // Check if empty
  if (Object.keys(groupedData).length === 0) {
      content += '\nNenhum registro encontrado para os filtros selecionados.\n';
  } else {
      // Iterate Groups
      Object.keys(groupedData).sort().forEach(indexKey => {
          content += `\n📍 ${groupLabel}: ${indexKey}\n\n`;
          
          groupedData[indexKey].forEach(item => {
              // Format: Primary Text | Secondary Text (Qty)
              const line = `${item.esfCil.padEnd(25)} ${item.treatment} (${item.quantity})`;
              content += `   ${line}\n`;
          });
          
          content += '\n__________________________________________________\n';
      });
  }

  // Footer
  content += '\n\n';
  content += 'Relatório gerado automaticamente pelo VisuLab\n';
  content += '==================================================\n';

  // Download
  const fileName = `relatorio_${format(new Date(), 'yyyyMMdd_HHmm')}.txt`;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
};