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
