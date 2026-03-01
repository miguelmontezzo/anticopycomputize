import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, ExternalLink, Copy, Check } from 'lucide-react';

type ClientProject = {
  id: string;
  nome: string;
  slug: string;
  oferta: string;
  analise_resumo: string;
  status: string;
  created_at: string;
};

const initial = { nome: '', slug: '', oferta: '', analise_resumo: '' };

export default function AdminClientsPage() {
  const [form, setForm] = useState(initial);
  const [items, setItems] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    if (!supabase) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('client_projects')
      .select('*')
      .order('created_at', { ascending: false });
    setItems((data as ClientProject[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.slug) return;
    setSaving(true);

    const payload = {
      nome: form.nome,
      slug: form.slug.toLowerCase().trim(),
      oferta: form.oferta,
      analise_resumo: form.analise_resumo,
      status: 'ativo'
    };

    if (!supabase) {
      setSaving(false);
      alert('Supabase não configurado no ambiente.');
      return;
    }

    const { error } = await supabase.from('client_projects').insert([payload]);
    setSaving(false);

    if (error) {
      alert(`Erro ao criar cliente: ${error.message}`);
      return;
    }

    setForm(initial);
    load();
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-6 md:p-12 text-white">
      <header className="mb-8 border-b border-white/10 pb-5">
        <h1 className="text-4xl font-bold tracking-tighter mb-2">Clientes & Rotas</h1>
        <p className="text-muted">Crie apresentações, análises e formulário EMP por cliente via slug.</p>
      </header>

      <form onSubmit={submit} className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="bg-black/40 border border-white/10 rounded-xl p-3" placeholder="Nome do cliente" value={form.nome} onChange={e => setForm(s => ({ ...s, nome: e.target.value }))} />
        <input className="bg-black/40 border border-white/10 rounded-xl p-3" placeholder="Slug (ex: computize)" value={form.slug} onChange={e => setForm(s => ({ ...s, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))} />
        <input className="bg-black/40 border border-white/10 rounded-xl p-3 md:col-span-2" placeholder="Oferta principal" value={form.oferta} onChange={e => setForm(s => ({ ...s, oferta: e.target.value }))} />
        <textarea className="bg-black/40 border border-white/10 rounded-xl p-3 md:col-span-2 min-h-[110px]" placeholder="Resumo da análise (E + Mas + Por Isso)" value={form.analise_resumo} onChange={e => setForm(s => ({ ...s, analise_resumo: e.target.value }))} />

        <button disabled={saving} className="md:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent-cyan/20 border border-accent-cyan/30 rounded-xl hover:bg-accent-cyan/30 transition-colors">
          <Plus className="w-4 h-4" /> {saving ? 'Salvando...' : 'Criar cliente e rotas'}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {loading ? <div className="text-muted">Carregando...</div> : items.map(item => {
          const p1 = `${window.location.origin}/${item.slug}/ia-service`;
          const p2 = `${window.location.origin}/${item.slug}/analise`;
          const p3 = `${window.location.origin}/${item.slug}/emp`;
          return (
            <div key={item.id} className="bg-black/30 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h3 className="font-bold text-lg">{item.nome} <span className="text-xs text-muted">/{item.slug}</span></h3>
                  <p className="text-sm text-muted">{item.oferta || 'Sem oferta definida'}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-white/10 border border-white/10">{item.status}</span>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                {[{ label: 'Apresentação', url: p1 }, { label: 'Análise', url: p2 }, { label: 'Form EMP', url: p3 }].map(row => (
                  <div key={row.url} className="bg-white/5 border border-white/10 rounded-lg p-2 flex items-center justify-between gap-2">
                    <span className="truncate">{row.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => copy(row.url, row.url)} className="hover:text-accent-cyan">
                        {copied === row.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a href={row.url} target="_blank" rel="noreferrer" className="hover:text-accent-cyan"><ExternalLink className="w-3 h-3" /></a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
