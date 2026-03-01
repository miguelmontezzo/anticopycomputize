import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type ClientProject = { nome: string; slug: string; oferta: string; analise_resumo: string };

export default function ClientIAServicePage() {
  const { slug = '' } = useParams();
  const [client, setClient] = useState<ClientProject | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('client_projects').select('nome,slug,oferta,analise_resumo').eq('slug', slug).maybeSingle();
      setClient(data as ClientProject | null);
    })();
  }, [slug]);

  if (!client) return <div className="min-h-screen bg-black text-white p-10">Carregando apresentação...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">Anti Copy AI</div>
        <h1 className="text-5xl font-bold tracking-tight mb-3">{client.nome}</h1>
        <p className="text-xl text-gray-600 mb-8">{client.oferta || 'Apresentação estratégica com IA'}</p>

        <section className="border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Proposta</h2>
          <p className="text-gray-700 leading-relaxed">
            Estrutura de conteúdo, posicionamento e operação digital seguindo o método EMP para gerar autoridade e conversão.
          </p>
        </section>

        <div className="flex gap-3">
          <Link to={`/${client.slug}/analise`} className="px-5 py-3 rounded-xl bg-black text-white">Ver Análise</Link>
          <Link to={`/${client.slug}/emp`} className="px-5 py-3 rounded-xl border border-gray-300">Responder EMP</Link>
        </div>
      </div>
    </div>
  );
}
