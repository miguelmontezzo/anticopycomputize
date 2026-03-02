export interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    document: string | null;
    created_at: string;
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
