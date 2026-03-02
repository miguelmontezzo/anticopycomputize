import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import { Loader2, ArrowLeft, Users, Download } from 'lucide-react';
import { Form, FormField, FormResponse } from '../types';

export default function AdminFormResponsesPage() {
    const { id: formId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState<Form | null>(null);
    const [fields, setFields] = useState<FormField[]>([]);
    const [responses, setResponses] = useState<FormResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (formId) fetchData();
    }, [formId]);

    const fetchData = async () => {
        setLoading(true);
        const [formRes, fieldsRes, responsesRes] = await Promise.all([
            supabase.from('forms').select('*').eq('id', formId).single(),
            supabase.from('form_fields').select('*').eq('form_id', formId).order('order_index', { ascending: true }),
            supabase.from('form_responses').select('*').eq('form_id', formId).order('created_at', { ascending: false })
        ]);

        if (formRes.data) setForm(formRes.data);
        if (fieldsRes.data) setFields(fieldsRes.data);
        if (responsesRes.data) setResponses(responsesRes.data);

        setLoading(false);
    };

    const exportToCSV = () => {
        if (!responses.length || !fields.length) return;

        // Headers
        const headers = ['Data', ...fields.map(f => f.label)].join(',');

        // Rows
        const rows = responses.map(response => {
            const date = new Date(response.created_at).toLocaleString('pt-BR');
            const rowData = fields.map(field => {
                const answer = response.answers[field.id];
                if (!answer) return '""';

                // Escape quotes
                if (typeof answer === 'string') {
                    return `"${answer.replace(/"/g, '""')}"`;
                }
                if (Array.isArray(answer)) {
                    return `"${answer.join('; ').replace(/"/g, '""')}"`;
                }
                return `"${answer}"`;
            });
            return [date, ...rowData].join(',');
        });

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_${form?.title.replace(/[^a-z0-9]/gi, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!form) return <div className="p-12 text-center text-gray-500">Formulário não encontrado.</div>;

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
                <FadeIn>
                    <button
                        onClick={() => navigate('/admin/forms')}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm font-medium mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Formulários
                    </button>
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-orange-400" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-tighter">Respostas e Leads</h1>
                            <p className="text-muted font-light mt-1">
                                Formulário: <span className="text-white font-medium">{form.title}</span>
                            </p>
                        </div>
                    </div>
                </FadeIn>
                <FadeIn delay={0.1}>
                    <button
                        onClick={exportToCSV}
                        disabled={responses.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm transition-colors disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                </FadeIn>
            </header>

            <FadeIn delay={0.2}>
                <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    {responses.length === 0 ? (
                        <div className="text-center py-20">
                            <Users className="w-12 h-12 text-muted mx-auto mb-4 opacity-30" />
                            <h3 className="text-xl font-bold mb-2 text-white/70">Nenhuma resposta captada ainda</h3>
                            <p className="text-muted font-light">Este formulário não possui leads cadastrados.</p>
                        </div>
                    ) : fields.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted font-light">Este formulário não possui campos configurados.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 font-bold tracking-widest uppercase text-[10px] text-muted whitespace-nowrap">Data</th>
                                    {fields.map(f => (
                                        <th key={f.id} className="px-6 py-4 font-bold tracking-widest uppercase text-[10px] text-muted whitespace-nowrap">
                                            {f.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {responses.map(response => (
                                    <tr key={response.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-white/50 whitespace-nowrap">
                                            {new Date(response.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                        {fields.map(field => {
                                            const ans = response.answers[field.id];
                                            let displayAns = ans || '-';
                                            if (Array.isArray(ans)) {
                                                displayAns = ans.join(', ');
                                            }
                                            return (
                                                <td key={`${response.id}-${field.id}`} className="px-6 py-4 text-white/90 max-w-[200px] truncate" title={String(displayAns)}>
                                                    {displayAns}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </FadeIn>
        </div>
    );
}
