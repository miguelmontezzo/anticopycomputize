import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Page, Form, FormField } from '../types';

export default function PublicPage() {
    const { slug } = useParams();

    const [page, setPage] = useState<Page | null>(null);
    const [form, setForm] = useState<Form | null>(null);
    const [fields, setFields] = useState<FormField[]>([]);

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Form submission state
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (slug) fetchPageData();
    }, [slug]);

    const fetchPageData = async () => {
        setLoading(true);
        // 1. Fetch Page
        const { data: pageData, error: pageErr } = await supabase
            .from('pages')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();

        if (pageErr || !pageData) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        setPage(pageData);

        // 2. Fetch associated form (if any)
        const { data: formData } = await supabase
            .from('forms')
            .select('*')
            .eq('page_id', pageData.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (formData) {
            setForm(formData);
            // 3. Fetch form fields
            const { data: fieldsData } = await supabase
                .from('form_fields')
                .select('*')
                .eq('form_id', formData.id)
                .order('order_index', { ascending: true });

            if (fieldsData) setFields(fieldsData);
        }

        setLoading(false);
    };

    const handleInputChange = (fieldId: string, value: any) => {
        setAnswers(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleCheckboxChange = (fieldId: string, optionValue: string, isChecked: boolean) => {
        setAnswers(prev => {
            const current = prev[fieldId] || [];
            if (isChecked) {
                return { ...prev, [fieldId]: [...current, optionValue] };
            } else {
                return { ...prev, [fieldId]: current.filter((v: string) => v !== optionValue) };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form) return;
        setSubmitting(true);

        const payload = {
            form_id: form.id,
            answers
        };

        const { error } = await supabase.from('form_responses').insert([payload]);

        setSubmitting(false);
        if (!error) {
            setSubmitted(true);
        } else {
            alert('Não foi possível enviar suas respostas no momento. Tente novamente mais tarde.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
        );
    }

    if (notFound || !page) {
        return (
            <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 text-center">
                <FadeIn>
                    <h1 className="text-4xl font-bold tracking-tighter mb-4">Página Não Encontrada</h1>
                    <p className="text-muted font-light mb-8 max-w-md">
                        A página que você está tentando acessar não existe ou está indisponível no momento.
                    </p>
                    <Link to="/" className="text-sm font-medium hover:text-white transition-colors">
                        Voltar para a página inicial →
                    </Link>
                </FadeIn>
            </div>
        );
    }

    const brandColor = page.theme_color || '#3b82f6'; // Default fallback

    return (
        <div className="min-h-screen overflow-x-hidden text-white relative">
            {/* Dynamic Custom Theme Glow */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div
                    className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-30 blur-[120px] rounded-full"
                    style={{ backgroundColor: brandColor }}
                />
            </div>

            <main className="relative z-10 flex flex-col min-h-screen px-4 sm:px-6 md:px-12 py-10 sm:py-14 md:py-24 max-w-3xl mx-auto">
                {/* Header Simples (Renderização do Page) */}
                <FadeIn>
                    <div className="mb-10 sm:mb-14 md:mb-16">
                        <div
                            className="w-16 h-1 mb-6 rounded-full"
                            style={{ backgroundColor: brandColor }}
                        />
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tighter leading-[1.1] mb-4 sm:mb-6">
                            {page.title}
                        </h1>
                        {/* Como o contentJson seria genérico, aqui deixamos uma introdução limpa */}
                        <p className="text-base sm:text-lg md:text-xl text-muted font-light leading-relaxed">
                            Preencha o formulário abaixo para avançarmos.
                        </p>
                    </div>
                </FadeIn>

                {/* Área do Formulário */}
                {form && (
                    <FadeIn delay={0.2}>
                        <div className="glass-card p-4 sm:p-6 md:p-10 rounded-2xl relative overflow-hidden bg-black/40 backdrop-blur-md border hover:border-white/20 transition-colors" style={{ borderTopColor: `${brandColor}40` }}>

                            <div className="mb-8 border-b border-white/10 pb-6">
                                <h2 className="text-2xl font-bold tracking-tight mb-2">{form.title}</h2>
                                {form.description && (
                                    <p className="text-sm text-muted font-light">{form.description}</p>
                                )}
                            </div>

                            {submitted ? (
                                <div className="py-12 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${brandColor}20`, color: brandColor }}>
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">Tudo certo!</h3>
                                    <p className="text-muted font-light max-w-sm">
                                        Suas informações foram recebidas com sucesso. Em breve entraremos em contato.
                                    </p>
                                </div>
                            ) : fields.length > 0 ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {fields.map((field) => (
                                        <div key={field.id} className="space-y-2">
                                            <label className="block text-xs font-bold tracking-widest uppercase text-muted">
                                                {field.label} {field.is_required && <span style={{ color: brandColor }}>*</span>}
                                            </label>

                                            {field.field_type === 'text' || field.field_type === 'email' || field.field_type === 'number' ? (
                                                <input
                                                    type={field.field_type}
                                                    required={field.is_required}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors"
                                                    style={{ '--tw-ring-color': brandColor } as any}
                                                    onFocus={(e) => e.target.style.borderColor = brandColor}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                />
                                            ) : field.field_type === 'textarea' ? (
                                                <textarea
                                                    required={field.is_required}
                                                    rows={4}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors resize-none"
                                                    onFocus={(e) => e.target.style.borderColor = brandColor}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                />
                                            ) : field.field_type === 'select' ? (
                                                <div className="relative">
                                                    <select
                                                        required={field.is_required}
                                                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none transition-colors appearance-none"
                                                        onFocus={(e) => e.target.style.borderColor = brandColor}
                                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Selecione uma opção...</option>
                                                        {field.options?.map((opt: any, i: number) => (
                                                            <option key={i} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : field.field_type === 'radio' ? (
                                                <div className="space-y-3 pt-2">
                                                    {field.options?.map((opt: any, i: number) => (
                                                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="radio"
                                                                    name={field.id}
                                                                    value={opt.value}
                                                                    required={field.is_required}
                                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                                    className="w-5 h-5 appearance-none rounded-full border border-white/20 bg-black/50 checked:bg-transparent transition-all cursor-pointer"
                                                                    style={{
                                                                        borderColor: answers[field.id] === opt.value ? brandColor : 'rgba(255,255,255,0.2)'
                                                                    }}
                                                                />
                                                                {answers[field.id] === opt.value && (
                                                                    <div className="absolute w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandColor }} />
                                                                )}
                                                            </div>
                                                            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : field.field_type === 'checkbox' ? (
                                                <div className="space-y-3 pt-2">
                                                    {field.options?.map((opt: any, i: number) => {
                                                        const isChecked = (answers[field.id] || []).includes(opt.value);
                                                        return (
                                                            <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                                                <div className="relative flex items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={(e) => handleCheckboxChange(field.id, opt.value, e.target.checked)}
                                                                        className="w-5 h-5 appearance-none rounded border border-white/20 bg-black/50 transition-all cursor-pointer"
                                                                        style={{
                                                                            borderColor: isChecked ? brandColor : 'rgba(255,255,255,0.2)',
                                                                            backgroundColor: isChecked ? brandColor : undefined
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{opt.label}</span>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                                            style={{ backgroundColor: brandColor, color: '#fff' }}
                                        >
                                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Inscrição'}
                                            {!submitting && <ArrowRight className="w-4 h-4" />}
                                        </button>
                                        <p className="text-xs text-center text-muted/50 mt-4">
                                            Seus dados estão seguros e não serão compartilhados.
                                        </p>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-muted font-light">Este formulário ainda não possui campos.</p>
                                </div>
                            )}
                        </div>
                    </FadeIn>
                )}

                {/* Footer Minimalista */}
                <div className="mt-auto pt-10 sm:pt-12 md:pt-16 text-center text-[10px] tracking-widest text-muted uppercase font-bold">
                    Powered by Anti Copy
                </div>
            </main>
        </div>
    );
}
