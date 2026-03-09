import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Loader2, ExternalLink, ChevronRight } from 'lucide-react';
import { sitePageSchemas } from '../data/sitePageSchemas';
import Button from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';

export default function AdminSitePageEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const schema = slug ? sitePageSchemas[slug] : null;

  const [sectionKey, setSectionKey] = useState<string>('');
  const [content, setContent] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (!schema) { setLoading(false); return; }
    const firstSection = Object.keys(schema.sections)[0];
    setSectionKey(firstSection);
    loadContent();
  }, [slug]);

  const loadContent = async () => {
    setLoading(true);
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase.from('site_pages').select('sections').eq('slug', slug).single();
    if (data?.sections) {
      setContent(data.sections as Record<string, Record<string, string>>);
    }
    setLoading(false);
  };

  const handleFieldChange = (section: string, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    if (!slug) return;
    setSaving(true);
    const { error } = await supabase
      .from('site_pages')
      .upsert({
        slug,
        title: schema?.label || slug,
        sections: content,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' });
    setSaving(false);
    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    }
  };

  if (!schema) {
    return (
      <div className="p-10 text-center text-gray-500">
        Página não encontrada.{' '}
        <Link to="/admin/site-pages" className="text-black underline">Voltar</Link>
      </div>
    );
  }

  const sections = Object.entries(schema.sections);
  const currentSection = schema.sections[sectionKey];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link
          to="/admin/site-pages"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Site (CMS)
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-300" />
        <span className="text-sm font-medium text-gray-900">{schema.label}</span>
        <div className="ml-auto flex items-center gap-2">
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-2 py-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Ver página
          </a>
          <Button
            size="sm"
            onClick={handleSave}
            loading={saving}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            {savedMsg ? 'Salvo!' : 'Salvar seção'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Sections list */}
          <div className="w-56 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Seções</span>
            </div>
            <nav className="p-2 space-y-0.5">
              {sections.map(([key, sec]) => (
                <button
                  key={key}
                  onClick={() => setSectionKey(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sectionKey === key
                      ? 'bg-black text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {sec.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Field editor */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <h2 className="text-base font-semibold text-gray-900">{currentSection?.label}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Edite os campos desta seção e clique em "Salvar seção".
                </p>
              </div>

              <div className="space-y-4">
                {currentSection && Object.entries(currentSection.fields).map(([fieldKey, fieldSchema]) => {
                  const value = content[sectionKey]?.[fieldKey] || '';

                  if (fieldSchema.type === 'textarea') {
                    return (
                      <Textarea
                        key={fieldKey}
                        label={fieldSchema.label}
                        placeholder={fieldSchema.placeholder}
                        rows={4}
                        value={value}
                        onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
                      />
                    );
                  }

                  return (
                    <Input
                      key={fieldKey}
                      label={fieldSchema.label}
                      type={fieldSchema.type === 'url' ? 'url' : 'text'}
                      placeholder={fieldSchema.placeholder}
                      value={value}
                      onChange={(e) => handleFieldChange(sectionKey, fieldKey, e.target.value)}
                    />
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleSave}
                  loading={saving}
                  icon={<Save className="w-4 h-4" />}
                >
                  {savedMsg ? 'Salvo!' : 'Salvar seção'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
