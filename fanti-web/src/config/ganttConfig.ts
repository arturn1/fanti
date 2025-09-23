/**
 * Configurações do Gantt Chart
 * Cores, distâncias, formatos e outras configurações visuais
 */

import { ColorStyles, Distances } from '@wamra/gantt-task-react';
import { ptBR } from 'date-fns/locale';

/**
 * Configurações de cores otimizadas do Gantt com esquema azul
 */
export const ganttColors: Partial<ColorStyles> = {
  arrowColor: "#2563EB", // Azul vibrante para setas
  arrowCriticalColor: "#DC2626", // Vermelho para dependências críticas
  barProgressColor: "#3B82F6", // Azul médio para progresso padrão
  selectedTaskBackgroundColor: "#EBF8FF", // Azul suave para seleção
  todayColor: "rgba(37, 99, 235, 0.15)", // Azul translúcido para linha do hoje
  barLabelWhenOutsideColor: "#1F2937", // Cinza escuro para texto externo
};

/**
 * Configurações de distâncias e dimensões do Gantt
 */
export const ganttDistances: Partial<Distances> = {
  arrowIndent: 15,      // Reduzido de 20 para 15
  columnWidth: 50,      // Reduzido de 50 para 40 (colunas de data mais estreitas)
  rowHeight: 48,        // Aumentado de 45 para 48 (para acomodar fonte maior)
  headerHeight: 60,     // Mantido em 70
  barCornerRadius: 4,
  barFill: 80,          // Mantido em 85
  handleWidth: 4,        // Mantido em 6
};

/**
 * Configurações de formatação de datas
 */
export const ganttDateFormats = {
  dateColumnFormat: "dd/MM/yy",
  dayBottomHeaderFormat: "dd/MM/yyyy",
  monthBottomHeaderFormat: "MMM yyyy"
};

/**
 * Configurações gerais do Gantt
 */
export const ganttSettings = {
  dateLocale: ptBR,
  isShowTaskNumbers: false,    // Removido para economizar espaço
  isShowCriticalPath: true,
  canMoveTasks: true,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  fontSize: "12px",            // Aumentado de 11px para 12px
};

/**
 * Classe CSS para container compacto do Gantt
 */
export const ganttContainerClass = "gantt-container-compact";

/**
 * Estilos inline para o container do Gantt
 */
export const ganttContainerStyles = {
  fontSize: '11px',
};
