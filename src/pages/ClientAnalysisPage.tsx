import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type ClientProject = { nome: string; slug: string; analise_resumo: string };

export default function ClientAnalysisPage() {
  const { slug = '' } = useParams();
  const [client, setClient] = useState<ClientProject | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('client_projects').select('nome,slug,analise_resumo').eq('slug', slug).maybeSingle();
      setClient(data as ClientProject | null);
    })();
  }, [slug]);

  if (!client) return <div className="min-h-screen bg-black text-white p-10">Carregando análise...</div>;

  return (
    <div className="min-h-screen bg-bg-primary text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-muted mb-2">Análise EMP</div>
        <h1 className="text-4xl font-bold tracking-tight mb-8">{client.nome}</h1>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 whitespace-pre-wrap leading-relaxed text-white/90">
          {client.analise_resumo || 'Análise ainda não preenchida no admin.'}
        </div>

        <div className="mt-6">
          <Link to={`/${client.slug}/emp`} className="px-5 py-3 rounded-xl bg-accent-cyan/20 border border-accent-cyan/30">Responder formulário EMP</Link>
        </div>
      </div>
    </div>
  );
}
