/**
 * Utilitários para gerenciamento de cores das tarefas
 * Sistema baseado no status da tarefa com cores Material Design
 */

import { TaskStatus } from '@/types';

/**
 * Mapa de cores por status da tarefa
 * Sistema simplificado com 3 status e cores intuitivas
 */
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.ToDo]: '#c9d3d8ff',       // Laranja - A Fazer (neutro, indica pendência)
  [TaskStatus.InProgress]: '#42A5F5', // Azul - Em Progresso (ativo, movimento)
  [TaskStatus.Done]: '#66BB6A',       // Verde - Concluído (sucesso, finalizado)
};

/**
 * Cor padrão para casos não mapeados
 */
export const DEFAULT_TASK_COLOR = '#42A5F5'; // Azul (Em Progresso) como padrão

/**
 * Obtém a cor baseada no status da tarefa
 * @param status - Status da tarefa (número, enum ou string)
 * @returns Cor em formato hexadecimal
 */
export const getTaskColorByStatus = (status: number | TaskStatus | string): string => {
  let statusEnum: TaskStatus;

  if (typeof status === 'string') {
    // Se é string, converter para enum usando mapeamento
    switch (status) {
      case 'ToDo':
        statusEnum = TaskStatus.ToDo;
        break;
      case 'InProgress':
        statusEnum = TaskStatus.InProgress;
        break;
      case 'Done':
        statusEnum = TaskStatus.Done;
        break;
      default:
        statusEnum = TaskStatus.InProgress; // fallback
    }
  } else {
    statusEnum = status as TaskStatus;
  }

  const color = TASK_STATUS_COLORS[statusEnum] || DEFAULT_TASK_COLOR;
  return color;
};

/**
 * Obtém informações completas sobre a cor do status
 * @param status - Status da tarefa (número, enum ou string)
 * @returns Objeto com cor e nome do status
 */
export const getTaskStatusInfo = (status: number | TaskStatus | string) => {
  let statusEnum: TaskStatus;

  if (typeof status === 'string') {
    // Se é string, converter para enum usando mapeamento
    switch (status) {
      case 'ToDo':
        statusEnum = TaskStatus.ToDo;
        break;
      case 'InProgress':
        statusEnum = TaskStatus.InProgress;
        break;
      case 'Done':
        statusEnum = TaskStatus.Done;
        break;
      default:
        statusEnum = TaskStatus.InProgress; // fallback
    }
  } else {
    statusEnum = status as TaskStatus;
  }

  const statusNames: Record<TaskStatus, string> = {
    [TaskStatus.ToDo]: 'A Fazer',
    [TaskStatus.InProgress]: 'Em Progresso',
    [TaskStatus.Done]: 'Concluído',
  };

  return {
    color: getTaskColorByStatus(statusEnum),
    name: statusNames[statusEnum] || 'Desconhecido',
    statusId: statusEnum
  };
};

/**
 * Lista todas as cores disponíveis com seus status
 * Útil para legendas ou seletores
 */
export const getAllStatusColors = () => {
  return Object.entries(TASK_STATUS_COLORS).map(([status, color]) => ({
    status: parseInt(status) as TaskStatus,
    color,
    name: getTaskStatusInfo(parseInt(status)).name
  }));
};

/**
 * Gera tonalidades da cor principal para usar na barra de progresso
 * @param baseColor - Cor base em formato hexadecimal
 * @returns Objeto com variações da cor
 */
export const getColorVariations = (baseColor: string) => {
  // Função para converter hex para RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 66, g: 165, b: 245 }; // fallback azul
  };

  // Função para converter RGB para hex
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (n: number) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Função para escurecer uma cor
  const darken = (color: string, factor: number) => {
    const rgb = hexToRgb(color);
    return rgbToHex(
      Math.round(rgb.r * (1 - factor)),
      Math.round(rgb.g * (1 - factor)),
      Math.round(rgb.b * (1 - factor))
    );
  };

  // Função para clarear uma cor
  const lighten = (color: string, factor: number) => {
    const rgb = hexToRgb(color);
    return rgbToHex(
      Math.round(rgb.r + (255 - rgb.r) * factor),
      Math.round(rgb.g + (255 - rgb.g) * factor),
      Math.round(rgb.b + (255 - rgb.b) * factor)
    );
  };

  return {
    background: baseColor,                    // Cor principal
    progress: darken(baseColor, 0.2),        // 20% mais escura para progresso
    selected: lighten(baseColor, 0.1),       // 10% mais clara para seleção
    selectedProgress: darken(baseColor, 0.3), // 30% mais escura para progresso selecionado
    border: darken(baseColor, 0.15),         // 15% mais escura para borda
  };
};

/**
 * Variações de tons para uso futuro (se necessário)
 * Mantido para compatibilidade e possíveis expansões
 */
export const generateColorVariations = (baseColor: string, count: number = 5): string[] => {
  // Para uso futuro se implementarmos variações automáticas
  const variations = [baseColor];

  // Implementação simples - pode ser expandida no futuro
  for (let i = 1; i < count; i++) {
    variations.push(baseColor);
  }

  return variations;
};
