import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Globe, Loader2, Edit2, ExternalLink } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { sitePageSchemas } from '../data/sitePageSchemas';

type SitePage = {
  id: string;
  slug: string;
  title: string;
  is_active: boolean;
  updated_at: string;
};

// Pages that always exist (from schemas) with fallback if no DB row
const STATIC_PAGES = Object.entries(sitePageSchemas).map(([slug, schema]) => ({
  slug,
  title: schema.label,
}));

export default function AdminSitePagesPage() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('site_pages').select('*').order('slug');

    if (data && data.length > 0) {
      setPages(data as SitePage[]);
    } else {
      // Show static pages from schema even if table doesn't exist yet
      setPages(
        STATIC_PAGES.map((p, i) => ({
          id: `static-${i}`,
          slug: p.slug,
          title: p.title,
          is_active: true,
          updated_at: new Date().toISOString(),
        }))
      );
    }
    setLoading(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader
        title="Site (CMS)"
        subtitle="Edite as seções das páginas do site Anti Copy Club"
        icon={<Globe className="w-4 h-4" />}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map(page => (
            <Card key={page.id} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{page.title}</h3>
                    <Badge variant={page.is_active ? 'active' : 'inactive'}>
                      {page.is_active ? 'ativo' : 'inativo'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 font-mono">/{page.slug}</span>
                    <span className="text-xs text-gray-400">
                      Atualizado {formatDate(page.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Abrir página"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <Link to={`/admin/site-pages/${page.slug}`}>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs text-amber-700 font-medium mb-1">Ação necessária no Supabase</p>
        <p className="text-xs text-amber-600">
          Execute <code className="font-mono bg-amber-100 px-1 rounded">create_site_pages_table.sql</code> no SQL Editor do Supabase para persistir as edições no banco de dados.
          Sem isso, as edições não serão salvas.
        </p>
      </div>
    </div>
  );
}
