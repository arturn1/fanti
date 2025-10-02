// Função para importar todos os dados do Excel exportado
export async function importAllDataFromExcel(file: File): Promise<{
    projects: any[];
    sprints: any[];
    tasks: any[];
    periods: any[];
    tasksPeriod: any[];
    staffs: any[];
    periodStaffs: any[];
    projectVersions: any[];
    taskDependencies: any[];
}> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            // Lê cada aba
            const dados = XLSX.utils.sheet_to_json(workbook.Sheets['Dados'] || {}, { defval: '' });
            const projectVersions = XLSX.utils.sheet_to_json(workbook.Sheets['ProjectVersions'] || {}, { defval: '' });
            const taskDependencies = XLSX.utils.sheet_to_json(workbook.Sheets['TaskDependencies'] || {}, { defval: '' });

            // Reconstruir entidades únicas a partir da aba Dados
            const projectsMap = new Map();
            const sprintsMap = new Map();
            const tasksMap = new Map();
            const periodsMap = new Map();
            const tasksPeriodMap = new Map();
            const staffsMap = new Map();
            const periodStaffsMap = new Map();

            dados.forEach((row: any) => {
                if (row.ProjetoID) {
                    projectsMap.set(row.ProjetoID, {
                        id: row.ProjetoID,
                        name: row.ProjetoNome,
                        // Adicione outros campos se necessário
                    });
                }
                if (row.SprintID) {
                    sprintsMap.set(row.SprintID, {
                        id: row.SprintID,
                        name: row.SprintNome,
                        status: row.SprintStatus,
                        startDate: row.SprintInicio,
                        endDate: row.SprintFim,
                        // Adicione outros campos se necessário
                    });
                }
                if (row.TaskID) {
                    tasksMap.set(row.TaskID, {
                        id: row.TaskID,
                        title: row.TaskTitulo,
                        status: row.TaskStatus,
                        startDate: row.TaskInicio,
                        endDate: row.TaskFim,
                        // Adicione outros campos se necessário
                    });
                }
                if (row.PeriodID) {
                    periodsMap.set(row.PeriodID, {
                        id: row.PeriodID,
                        name: row.PeriodNome,
                        startDate: row.PeriodInicio,
                        endDate: row.PeriodFim,
                    });
                }
                if (row.TaskPeriodID) {
                    tasksPeriodMap.set(row.TaskPeriodID, {
                        id: row.TaskPeriodID,
                        taskNumber: row.TaskPeriodNumero,
                        // Adicione outros campos se necessário
                    });
                }
                if (row.TaskPeriodStaff) {
                    staffsMap.set(row.TaskPeriodStaff, {
                        name: row.TaskPeriodStaff
                    });
                }
                // Não há dados suficientes para periodStaffs na planilha, a menos que adicione campos extras
            });

            resolve({
                projects: Array.from(projectsMap.values()),
                sprints: Array.from(sprintsMap.values()),
                tasks: Array.from(tasksMap.values()),
                periods: Array.from(periodsMap.values()),
                tasksPeriod: Array.from(tasksPeriodMap.values()),
                staffs: Array.from(staffsMap.values()),
                periodStaffs: [], // Só possível se adicionar campos extras na exportação
                projectVersions,
                taskDependencies
            });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
}
import { Project, Sprint, Task, Period, TasksPeriod, Staff } from '@/types';
import * as XLSX from 'xlsx';

export interface ExportRow {
    ProjetoID: string;
    ProjetoNome: string;
    SprintID: string;
    SprintNome: string;
    SprintStatus: string;
    SprintInicio: string;
    SprintFim: string;
    TaskID: string;
    TaskTitulo: string;
    TaskStatus: string;
    TaskResponsavel: string;
    TaskInicio: string;
    TaskFim: string;
    PeriodID: string;
    PeriodNome: string;
    PeriodInicio: string;
    PeriodFim: string;
    TaskPeriodID: string;
    TaskPeriodNumero: string;
    TaskPeriodStaff: string;
}

export function exportAllDataToExcel(
    projects: Project[],
    sprints: Sprint[],
    tasks: Task[],
    periods: Period[],
    taskPeriods: TasksPeriod[],
    staffs: Staff[],
    periodStaffs: any[],
    projectVersions: any[],
    taskDependencies: any[]
) {
    const rows: ExportRow[] = [];

    projects.forEach(project => {
        const projectSprints = sprints.filter(s => s.projectId === project.id);
        projectSprints.forEach(sprint => {
            const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
            sprintTasks.forEach(task => {
                // Para cada task, encontrar os periods relacionados via taskPeriods
                // Relacionamento: TasksPeriod -> PeriodStaff -> staffId/periodId
                const relatedTaskPeriods = taskPeriods.filter(tp => {
                    // Busca PeriodStaff correspondente
                    const periodStaff = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                    if (!periodStaff) return false;
                    // Só inclui se taskNumber > 0 e task.projectId igual
                    return tp.projectId === project.id && tp.taskNumber > 0;
                });
                if (relatedTaskPeriods.length === 0) {
                    // Linha sem period/taskPeriod
                    rows.push({
                        ProjetoID: project.id,
                        ProjetoNome: project.name,
                        SprintID: sprint.id,
                        SprintNome: sprint.name,
                        SprintStatus: typeof sprint.status === 'string' ? sprint.status : String(sprint.status),
                        SprintInicio: sprint.startDate || '',
                        SprintFim: sprint.endDate || '',
                        TaskID: task.id,
                        TaskTitulo: task.title,
                        TaskStatus: typeof task.status === 'string' ? task.status : String(task.status),
                        // Não há staff direto na task, então vazio
                        TaskResponsavel: '',
                        TaskInicio: task.startDate || '',
                        TaskFim: task.endDate || '',
                        PeriodID: '',
                        PeriodNome: '',
                        PeriodInicio: '',
                        PeriodFim: '',
                        TaskPeriodID: '',
                        TaskPeriodNumero: '',
                        TaskPeriodStaff: '',
                    });
                } else {
                    relatedTaskPeriods.forEach(tp => {
                        const periodStaff = periodStaffs.find(ps => ps.id === tp.periodStaffId);
                        const period = periodStaff ? periods.find(p => p.id === periodStaff.periodId) : undefined;
                        const staff = periodStaff ? staffs.find(s => s.id === periodStaff.staffId) : undefined;
                        rows.push({
                            ProjetoID: project.id,
                            ProjetoNome: project.name,
                            SprintID: sprint.id,
                            SprintNome: sprint.name,
                            SprintStatus: typeof sprint.status === 'string' ? sprint.status : String(sprint.status),
                            SprintInicio: sprint.startDate || '',
                            SprintFim: sprint.endDate || '',
                            TaskID: task.id,
                            TaskTitulo: task.title,
                            TaskStatus: typeof task.status === 'string' ? task.status : String(task.status),
                            TaskResponsavel: staff?.name || '',
                            TaskInicio: task.startDate || '',
                            TaskFim: task.endDate || '',
                            PeriodID: period?.id || '',
                            PeriodNome: period?.name || '',
                            PeriodInicio: period?.startDate || '',
                            PeriodFim: period?.endDate || '',
                            TaskPeriodID: tp.id,
                            TaskPeriodNumero: String(tp.taskNumber ?? ''),
                            TaskPeriodStaff: staff?.name || '',
                        });
                    });
                }
            });
        });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Dados');

    // Adiciona ProjectVersions como nova aba
    if (projectVersions && projectVersions.length > 0) {
        const wsProjectVersions = XLSX.utils.json_to_sheet(projectVersions);
        XLSX.utils.book_append_sheet(wb, wsProjectVersions, 'ProjectVersions');
    }

    // Adiciona TaskDependencies como nova aba
    if (taskDependencies && taskDependencies.length > 0) {
        const wsTaskDependencies = XLSX.utils.json_to_sheet(taskDependencies);
        XLSX.utils.book_append_sheet(wb, wsTaskDependencies, 'TaskDependencies');
    }

    XLSX.writeFile(wb, 'fanti_export.xlsx');
}
