import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import { Loader2, ArrowLeft, Plus, Settings, GripVertical, Trash2, Save } from 'lucide-react';
import { Form, FormField } from '../types';

export default function AdminFormBuilderPage() {
    const { id: formId } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState<Form | null>(null);
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (formId) fetchData();
    }, [formId]);

    const fetchData = async () => {
        setLoading(true);
        const [formRes, fieldsRes] = await Promise.all([
            supabase.from('forms').select('*').eq('id', formId).single(),
            supabase.from('form_fields').select('*').eq('form_id', formId).order('order_index', { ascending: true })
        ]);

        if (formRes.data) setForm(formRes.data);
        if (fieldsRes.data) setFields(fieldsRes.data);

        setLoading(false);
    };

    const addField = () => {
        const newField: any = {
            id: `temp_${Date.now()}`,
            form_id: formId,
            label: 'Novo Campo',
            field_type: 'text',
            options: null,
            is_required: false,
            order_index: fields.length,
            is_new: true // temporary flag
        };
        setFields([...fields, newField]);
    };

    const updateField = (index: number, key: string, value: any) => {
        const updated = [...fields];
        updated[index] = { ...updated[index], [key]: value };
        setFields(updated);
    };

    const removeField = (index: number) => {
        const updated = [...fields];
        updated.splice(index, 1);
        setFields(updated);
    };

    const handleSave = async () => {
        setSaving(true);

        try {
            await supabase.from('forms').update({ title: form?.title }).eq('id', formId);

            // First delete all existing fields for this form entirely for simplicity.
            // In a robust app, we should accurately update/delete/insert
            await supabase.from('form_fields').delete().eq('form_id', formId);

            // Re-insert exactly the current configured state
            const payload = fields.map((f, i) => ({
                form_id: formId,
                label: f.label,
                field_type: f.field_type,
                options: f.options,
                is_required: f.is_required,
                order_index: i // guarantee order matches UI array
            }));

            if (payload.length > 0) {
                const { error } = await supabase.from('form_fields').insert(payload);
                if (error) throw error;
            }

            alert('Campos salvos com sucesso!');
            fetchData(); // reload real ids
        } catch (error: any) {
            alert('Erro ao salvar os campos: ' + error.message);
        }

        setSaving(false);
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
        <div className="p-6 md:p-10 pb-32 max-w-4xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <FadeIn>
                    <button
                        onClick={() => navigate('/admin/forms')}
                        className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm font-medium mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Formulários
                    </button>
                    <div className="flex items-center gap-3">
                        <Settings className="w-6 h-6 text-orange-400" />
                        <h1 className="text-3xl font-bold tracking-tighter">Construtor de Campos</h1>
                    </div>
                    <p className="text-muted font-light mt-1 mb-3">
                        Editando os campos e configurações do formulário.
                    </p>
                    <div className="max-w-xl">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-muted mb-1">Nome do formulário</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-400"
                        />
                    </div>
                </FadeIn>
                <FadeIn delay={0.1}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-full font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </FadeIn>
            </header>

            <FadeIn delay={0.2} className="max-w-3xl">
                <div className="space-y-4 mb-8">
                    {fields.length === 0 ? (
                        <div className="text-center py-16 border border-white/10 rounded-2xl bg-black/40 border-dashed">
                            <p className="text-muted">Nenhum campo neste formulário ainda.</p>
                        </div>
                    ) : (
                        fields.map((field, idx) => (
                            <div key={field.id} className="bg-black/60 border border-white/10 rounded-2xl p-5 flex gap-4 group">
                                <div className="pt-2 text-white/20 cursor-move">
                                    <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold tracking-widest uppercase text-muted mb-1">Título do Campo *</label>
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) => updateField(idx, 'label', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold tracking-widest uppercase text-muted mb-1">Tipo de Campo *</label>
                                            <select
                                                value={field.field_type}
                                                onChange={(e) => updateField(idx, 'field_type', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-400 appearance-none"
                                            >
                                                <option value="text">Texto Curto</option>
                                                <option value="textarea">Texto Longo (Parágrafo)</option>
                                                <option value="email">E-mail</option>
                                                <option value="number">Número</option>
                                                <option value="select">Lista Dropdown</option>
                                                <option value="checkbox">Caixa de Seleção (Múltipla)</option>
                                                <option value="radio">Seleção Única (Radio)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {(field.field_type === 'select' || field.field_type === 'checkbox' || field.field_type === 'radio') && (
                                        <div className="bg-white/[0.02] p-4 rounded-lg border border-white/5">
                                            <label className="block text-[10px] font-bold tracking-widest uppercase text-orange-400 mb-2">Opções (Separadas por vírgula)</label>
                                            <textarea
                                                value={Array.isArray(field.options) ? field.options.map((o: any) => o.label).join(', ') : ''}
                                                onChange={(e) => {
                                                    const arr = e.target.value.split(',').map(s => ({ label: s.trim(), value: s.trim() })).filter(o => o.label);
                                                    updateField(idx, 'options', arr);
                                                }}
                                                placeholder="Opção 1, Opção 2, Opção 3"
                                                rows={2}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-400 resize-none font-mono"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={field.is_required}
                                                onChange={(e) => updateField(idx, 'is_required', e.target.checked)}
                                                className="w-4 h-4 rounded border-white/20 bg-black/50 text-orange-400 focus:ring-orange-400 focus:ring-offset-black"
                                            />
                                            <span className="text-xs text-muted font-medium">Campo Obrigatório</span>
                                        </label>

                                        <button
                                            onClick={() => removeField(idx)}
                                            className="text-red-500/50 hover:text-red-500 transition-colors text-xs flex items-center gap-1 font-bold"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Remover Campo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <button
                    onClick={addField}
                    className="w-full py-4 border-2 border-dashed border-white/20 hover:border-orange-400/50 hover:bg-orange-500/5 rounded-2xl flex items-center justify-center gap-2 text-muted hover:text-orange-400 transition-colors font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Adicionar Novo Campo
                </button>
            </FadeIn>
        </div>
    );
}
