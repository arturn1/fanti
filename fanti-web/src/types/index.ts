// Conversão de TaskType para GanttTaskType
import { TaskType as GanttTaskType } from '@wamra/gantt-task-react';

/**
 * Converte um TaskType (enum ou string) para GanttTaskType ('task' | 'milestone' | 'project')
 */
export function toGanttTaskType(type: TaskType | string | undefined): GanttTaskType {
    if (typeof type === 'string') {
        const lower = type.toLowerCase();
        if (lower === 'milestone') return 'milestone';
        if (lower === 'project') return 'project';
        return 'task';
    }
    if (typeof type === 'number') {
        switch (type) {
            case TaskType.Milestone:
                return 'milestone';
            case TaskType.Project:
                return 'project';
            default:
                return 'task';
        }
    }
    return 'task';
}
// Team type based on API response
export interface Team {
    id: string;
    name: string;
    description?: string;
    // Add more fields if needed from API
}
export enum TaskCategory {
    Improvement = 0,
    Development = 1,
    BugFix = 2,
    Hotfix = 3
}

// Labels em pt-br para TaskCategory
export function getTaskCategoryLabel(category: TaskCategory | string | undefined): string | number {
    if (typeof category === 'string') {
        switch (category.toLowerCase()) {
            case 'melhoria': return 0;
            case 'desenvolvimento': return 1;
            case 'correção': return 2;
            case 'hotfix': return 3;
        }
        // Tenta converter string numérica
        const num = Number(category);
        if (!isNaN(num)) category = num as TaskCategory;
        else return category;
    }
    switch (category) {
        case TaskCategory.Improvement: return 'Melhoria';
        case TaskCategory.Development: return 'Desenvolvimento';
        case TaskCategory.BugFix: return 'Correção';
        case TaskCategory.Hotfix: return 'Hotfix';
        default: return '';
    }
}

// Enums
export enum UserRole {
    Admin = 1,
    ProductOwner = 2,
    ScrumMaster = 3,
    Developer = 4,
    Stakeholder = 5
}

export function getUserRoleLabel(role: UserRole | string | undefined): string {
    if (typeof role === 'string') {
        switch (role.toLowerCase()) {
            case 'admin': return 'Administrador';
            case 'productowner': return 'Product Owner';
            case 'scrummaster': return 'Scrum Master';
            case 'developer': return 'Desenvolvedor';
            case 'stakeholder': return 'Stakeholder';
        }
        const num = Number(role);
        if (!isNaN(num)) role = num as UserRole;
        else return role;
    }
    switch (role) {
        case UserRole.Admin: return 'Administrador';
        case UserRole.ProductOwner: return 'Product Owner';
        case UserRole.ScrumMaster: return 'Scrum Master';
        case UserRole.Developer: return 'Desenvolvedor';
        case UserRole.Stakeholder: return 'Stakeholder';
        default: return '';
    }
}

export enum ProjectStatus {
    Active = 0,
    Completed = 1,
    OnHold = 2,
    Cancelled = 3
}

export function getProjectStatusLabel(status: ProjectStatus | string | undefined): string {
    if (typeof status === 'string') {
        switch (status.toLowerCase()) {
            case 'Ativo': return 'Ativo';
            case 'completed': return 'Concluído';
            case 'onhold': return 'Em Espera';
            case 'cancelled': return 'Cancelado';
        }
        const num = Number(status);
        if (!isNaN(num)) status = num as ProjectStatus;
        else return status;
    }
    switch (status) {
        case ProjectStatus.Active: return 'Ativo';
        case ProjectStatus.Completed: return 'Concluído';
        case ProjectStatus.OnHold: return 'Em Espera';
        case ProjectStatus.Cancelled: return 'Cancelado';
        default: return '';
    }
}


export enum SprintStatus {
    Planning = 0,
    Active = 1,
    Testing = 2,
    Completed = 3
}

export function getSprintStatusLabel(status: SprintStatus | string | undefined): string {
    if (typeof status === 'string') {
        switch (status.toLowerCase()) {
            case 'planning': return 'Planejamento';
            case 'active': return 'Ativo';
            case 'testing': return 'Testando';
            case 'completed': return 'Concluído';
        }
        const num = Number(status);
        if (!isNaN(num)) status = num as SprintStatus;
        else return status;
    }
    switch (status) {
        case SprintStatus.Planning: return 'Planejamento';
        case SprintStatus.Active: return 'Ativo';
        case SprintStatus.Testing: return 'Testando';
        case SprintStatus.Completed: return 'Concluído';
        default: return '';
    }
}

export enum TaskStatus {
    ToDo = 0,        // A Fazer
    InProgress = 1,  // Em Progresso
    Done = 2         // Concluído
}

export function getTaskStatusLabel(status: TaskStatus | string | undefined): string | number {
    if (typeof status === 'string') {
        switch (status.toLowerCase()) {
            case 'a fazer': return 0;
            case 'em progresso': return 1;
            case 'concluído': return 2;
        }
        const num = Number(status);
        if (!isNaN(num)) status = num as TaskStatus;
        else return status;
    }
    switch (status) {
        case TaskStatus.ToDo: return 'A Fazer';
        case TaskStatus.InProgress: return 'Em Progresso';
        case TaskStatus.Done: return 'Concluído';
        default: return '';
    }
}

export enum TaskType {
    Task = 0,
    Milestone = 1,
    Project = 2
}

export function getTaskTypeLabel(type: TaskType | string | undefined): string | number {
    if (typeof type === 'string') {
        switch (type.toLowerCase()) {
            case 'tarefa': return 0;
            case 'marco': return 1;
            case 'projeto': return 2;
        }
        const num = Number(type);
        if (!isNaN(num)) type = num as TaskType;
        else return type;
    }
    switch (type) {
        case TaskType.Task: return 'Tarefa';
        case TaskType.Milestone: return 'Marco';
        case TaskType.Project: return 'Projeto';
        default: return '';
    }
}

export function getTaskTypeLabelFromTaskType(type: string): string {
    switch (type.toLowerCase()) {
        case 'task': return 'Tarefa';
        case 'milestone': return 'Marco';
        case 'project': return 'Projeto';
    }
    return 'Não Definido';
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    url?: string; // Campo URL adicionado
    startDate: string;
    endDate?: string;
    status: ProjectStatus | string; // Aceita tanto enum quanto string do backend
    ownerId: string;
    created: string;
    updated?: string;
}

export interface Sprint {
    id: string;
    projectId: string;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    goal?: string;
    status: SprintStatus | string; // Aceita tanto enum quanto string do backend
    created: string;
    updated?: string;
}

export interface Task {
    id: string;
    projectId: string;
    sprintId?: string;
    parentTaskId?: string;
    title: string;
    description?: string;
    storyPoints?: number;
    status: TaskStatus; // Aceita tanto enum quanto string do backend
    type: TaskType | string; // Aceita tanto enum quanto string do backend
    category?: TaskCategory | string;
    actualHours?: number;
    startDate?: string;
    endDate?: string;
    progress?: number; // 0-100
    teamId?: string; // Equipe
    created: string;
    updated?: string;
}

export interface TaskDependency {
    id: string;
    predecessorTaskId: string;
    successorTaskId: string;
    type: number; // 1=FinishToStart, 2=StartToStart, 3=FinishToFinish, 4=StartToFinish
    lag: number;
    created: string;
    updated?: string;
}


// Comando específico para o backend
export interface CreateProjectCommand {
    name: string;
    description: string;
    url?: string; // Campo URL adicionado
    startDate: string;
    endDate: string;
    status: ProjectStatus;
}

// Comando específico para o backend
export interface CreateSprintCommand {
    projectId: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    goal: string;
    status: string;
}

export interface CreateTaskCommand {
    ProjectId?: string;   // GUID como string
    SprintId?: string;    // GUID como string
    ParentTaskId?: string;
    Title: string;
    Description?: string;
    Status?: TaskStatus;      // String, não enum
    Type?: TaskType;        // String, não enum
    Category?: TaskCategory;    // String, não enum
    StartDate?: string;
    EndDate?: string;
    Progress?: number;    // 0-100
    TeamId?: string;      // Equipe
}

// Response API
export interface ApiResponse<T> {
    data: T;
    message: string;
    statusCode: number;
}

export interface ApiError {
    message: string;
    statusCode: number;
    errors?: string[];
}

export interface UpdateProjectCommand {
    id: string;
    name: string;
    description: string;
    url?: string; // Campo URL adicionado
    startDate: string;
    endDate: string;
    status: string;
}

// Period Management Types
export interface Staff {
    id: string;
    name: string;
}

export interface PeriodStaff {
    id: string;
    periodId: string;
    staffId: string;
    totalHours: number;
    taskNumber: number;
}

export interface TasksPeriod {
    id: string;
    periodStaffId: string;
    taskNumber: number;
    taskHours: number;
    projectId?: string;
}

export interface Period {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    staffs?: Staff[];
}

// Organization Types
export interface TaskItem {
    id?: string;
    number: number;
    hours: number;
    projectId?: string;
}

export interface StaffOrganizationData {
    totalHours: number;
    tasks: TaskItem[];
    remaining: number;
}

export interface OrganizationData {
    [staffId: string]: StaffOrganizationData;
}

// Modal States
export interface ModalStates {
    createEdit: boolean;
    view: boolean;
    organization: boolean;
}

export interface ModalData {
    editingPeriod: Period | null;
    viewingPeriod: Period | null;
    organizingPeriod: Period | null;
}

export interface User {
    id?: string | null;
    sub?: string;
    email?: string | null;
    name?: string | null;
    role?: string;
    avatar?: string;
    InternalCategory?: string;
    JobTitle?: string;
    Manager?: string;
    amr?: string[];
    area?: string;
    at_hash?: string;
    aud?: string;
    auth_time?: number;
    exp?: number;
    given_name?: string;
    group?: string[];
    groupsAreas?: string[];
    iat?: number;
    idp?: string;
    iss?: string;
    last_name?: string;
    nbf?: number;
    nonce?: string;
    preferred_language?: string;
    preferred_username?: string;
    s_hash?: string;
    sid?: string;
    isActive?: boolean;
    // Claims customizadas
    ["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?: string[];
    ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]?: string;
    ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"]?: string;
    ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]?: string;
    ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"]?: string;
    ["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"]?: string;
    claims?: Record<string, any>; // todos os campos extras do JWT
}