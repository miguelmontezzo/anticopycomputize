export interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    document: string | null;
    slug: string | null;
    oferta: string | null;
    plan_type: string | null;
    logo_url: string | null;
    portal_enabled: boolean | null;
    whatsapp: string | null;
    created_at: string;
    updated_at: string;
}

export interface ContentCalendar {
    id: string;
    slug: string;
    title: string;
    week_start: string;
    week_end: string;
    status: string;
    client_id: string;
    created_at: string;
}

export interface ContentCalendarItem {
    id: string;
    calendar_id: string;
    post_date: string;
    day_label: string;
    title: string;
    format: string;
    pillar: string;
    theme: string;
    objective: string;
    caption: string;
    stories: string[];
    post_status?: string;
    post_feedback?: string;
    stories_reviews?: any;
}

export type EmployeeRole = 'admin' | 'gestor' | 'atendimento' | 'editor' | 'social_media';

export interface Employee {
    id: string;
    user_id: string | null;
    name: string;
    email: string;
    role: EmployeeRole;
    avatar_url: string | null;
    is_active: boolean;
    whatsapp: string | null;
    created_at: string;
}

// Legacy status (kept for backward compatibility)
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

// Full workflow status for the agency pipeline
export type WorkflowStatus =
    | 'demand'           // 1. Demanda criada (Atendimento/Gestor)
    | 'strategy'         // 2. Em estratégia (Social Media)
    | 'internal_review'  // 3. Aprovação interna (Gestor)
    | 'client_review'    // 4. Aguardando cliente ← CLIENTE APROVA
    | 'production'       // 5. Em criação (Criação)
    | 'internal_approval'// 6. Aprovação interna final (Gestor/Atendimento)
    | 'client_approval'  // 7. Aprovação final cliente ← CLIENTE APROVA
    | 'ready_to_post'    // 8. Pronto para postar (Social Media)
    | 'published'        // 9. Publicado ✓
    | 'rejected';        // Reprovado (com motivo)

export type TaskType = 'content' | 'design' | 'copy' | 'strategy' | 'other';
export type FormatType = 'Reels' | 'Post Estático' | 'Carrossel' | 'Stories' | 'Video' | 'Outro';

export interface Task {
    id: string;
    client_id: string | null;
    project_id: string | null;
    calendar_item_id: string | null;
    title: string;
    description: string | null;
    status: TaskStatus;           // legacy
    workflow_status: WorkflowStatus;
    assignee_id: string | null;
    due_date: string | null;
    priority: TaskPriority;
    task_type: TaskType | null;
    // Briefing
    briefing: string | null;
    objective: string | null;
    format_type: FormatType | null;
    reference_links: string | null;
    rejection_reason: string | null;
    // Time tracking
    timer_started_at: string | null;
    time_spent_seconds: number;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    client_id: string;
    name: string;
    description: string | null;
    status: 'active' | 'completed' | 'paused';
    created_by_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface SitePage {
    id: string;
    slug: string;
    title: string;
    sections: Record<string, Record<string, string>>;
    is_active: boolean;
    updated_at: string;
}

export interface Page {
    id: string;
    client_id: string;
    title: string;
    slug: string;
    theme_color: string;
    content: any;
    is_published: boolean;
    created_at: string;
    updated_at: string;
}

export interface Form {
    id: string;
    client_id: string;
    page_id: string | null;
    title: string;
    description: string | null;
    created_at: string;
}

export interface FormField {
    id: string;
    form_id: string;
    label: string;
    field_type: string;
    options: any | null;
    is_required: boolean;
    order_index: number;
    created_at: string;
}

export interface FormResponse {
    id: string;
    form_id: string;
    answers: any;
    created_at: string;
}
