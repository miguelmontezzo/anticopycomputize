import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import {
    FolderOpen, Instagram, Download, Clock, Expand, Shrink,
    ChevronRight, User, Copy, Check as CheckIcon, FileDown, ExternalLink, Link as LinkIcon
} from 'lucide-react';

type EmpResponse = {
    id: string;
    created_at: string;
    servicos_receita: string;
    cliente_ideal: string;
    origem_clientes: string;
    materiais_comerciais: string;
    conteudo_interno_oculto: string;
    segmentos_2026: string;
    meta_2026: string;
    necessidade_digital: string;
    prova_social_autorizada: string;
    numeros_impacto: string;
    historia_mitigacao: string;
    objecoes_fechamento: string;
    motivo_adiamento: string;
    fase_gargalo_comercial: string;
    impedimento_conteudo: string;
    conteudo_desejado_comercial: string;
    frase_posicionamento: string;
    promessa_central: string;
    oferta_abrint: string;
    recompensa_estande: string;
    meta_reunioes_abrint: string;
    clientes_case: string;
    historia_forte_mitigacao: string;
    aprovador_conteudo: string;
    canal_operacional: string;
    formato_aprovacao: string;
    instagram_user: string;
    instagram_pass: string;
    documentos_urls: string[];
};

function buildExportText(res: EmpResponse, formatDate: (s: string) => string): string {
    const line = (label: string, value: string) =>
        `[${label}]\n${value ? value : 'Não respondido'}\n`;

    return [
        `================================================`,
        `DIAGNÓSTICO EMP — ANTI COPY CLUB`,
        `Data: ${formatDate(res.created_at)}`,
        `Conta Instagram: ${res.instagram_user || '—'}`,
        `================================================`,
        ``,
        `=== FASE 1: ONDE ESTÁ HOJE (E) ===`,
        ``,
        line('Serviços & Receita Principal', res.servicos_receita),
        line('Cliente Ideal e Dor', res.cliente_ideal),
        line('Origem e Aquisição de Clientes', res.origem_clientes),
        line('Segmentos Almejados (2026)', res.segmentos_2026),
        line('Meta Principal (2026)', res.meta_2026),
        ``,
        `=== FASE 2: O GARGALO (MAS) ===`,
        ``,
        line('Prova Social Pública', res.prova_social_autorizada),
        line('Números de Impacto', res.numeros_impacto),
        line('Objeções de Fechamento', res.objecoes_fechamento),
        line('Fase do Maior Gargalo Comercial', res.fase_gargalo_comercial),
        line('Impedimento Atual para Conteúdo', res.impedimento_conteudo),
        line('Conteúdo Demandado pelo Comercial', res.conteudo_desejado_comercial),
        ``,
        `=== FASE 3: A ESTRATÉGIA (POR ISSO) ===`,
        ``,
        line('Frase do Novo Posicionamento', res.frase_posicionamento),
        line('Promessa Central', res.promessa_central),
        ``,
        `--- Estratégia AGC26 (Abrint) ---`,
        ``,
        line('Oferta do Estande', res.oferta_abrint),
        line('Recompensa de Visita', res.recompensa_estande),
        line('Meta de Leads / Reuniões', res.meta_reunioes_abrint),
        ``,
        `=== CREDENCIAIS DO INSTAGRAM ===`,
        ``,
        line('Usuário', res.instagram_user),
        line('Senha', res.instagram_pass),
        ``,
        `=== ANEXOS ===`,
        ``,
        (Array.isArray(res.documentos_urls) && res.documentos_urls.length > 0)
            ? res.documentos_urls.join('\n')
            : 'Nenhum anexo enviado.',
        ``,
        `================================================`,
    ].join('\n');
}

export default function AdminEmpPage() {
    const [responses, setResponses] = useState<EmpResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [linkCopiedId, setLinkCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchResponses = async () => {
            const { data, error } = await supabase
                .from('emp_responses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar respostas:', error);
            } else {
                setResponses(data || []);
            }
            setLoading(false);
        };

        fetchResponses();
    }, []);

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center text-white font-bold tracking-widest uppercase">
                <span className="animate-pulse">Carregando Diagnósticos...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-white p-6 md:p-12 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12 border-b border-white/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <FadeIn>
                            <h1 className="text-4xl font-bold tracking-tighter mb-2">Painel de Respostas EMP</h1>
                            <p className="text-muted font-light">Diagnósticos estratégicos e acessos confidenciais capturados pelo formulário.</p>
                        </FadeIn>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-white/70 flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-accent-cyan" />
                        {responses.length} Registros Encontrados
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    {responses.length === 0 ? (
                        <div className="text-center py-20 bg-black/40 border border-white/10 rounded-2xl text-muted">
                            Nenhuma resposta foi enviada pelas empresas até o momento.
                        </div>
                    ) : (
                        responses.map((res) => {
                            const isExpanded = expandedId === res.id;
                            const docs = Array.isArray(res.documentos_urls) ? res.documentos_urls : [];
                            const exportText = buildExportText(res, formatDate);

                            const handleCopy = () => {
                                navigator.clipboard.writeText(exportText);
                                setCopiedId(res.id);
                                setTimeout(() => setCopiedId(null), 2000);
                            };

                            const handleDownload = () => {
                                const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `diagnostico-emp-${res.instagram_user || res.id.split('-')[0]}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                            };

                            return (
                                <FadeIn key={res.id}>
                                    <div className={`bg-black/40 border transition-all duration-300 rounded-2xl overflow-hidden ${isExpanded ? 'border-accent-cyan/50 shadow-[0_0_30px_rgba(10,240,220,0.1)]' : 'border-white/10 hover:border-white/20'}`}>

                                        {/* HEADER SUMMARY */}
                                        <div
                                            className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02]"
                                            onClick={() => setExpandedId(isExpanded ? null : res.id)}
                                        >
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-white/10 text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-widest border border-white/20">
                                                        ID: {res.id.split('-')[0]}
                                                    </span>
                                                    <span className="text-sm text-muted flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {formatDate(res.created_at)}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold mt-2 truncate max-w-xl">
                                                    {res.instagram_user ? `Conta: ${res.instagram_user}` : 'Diagnóstico Completo'}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-3 text-sm text-muted">
                                                <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                    {docs.length} <FolderOpen className="w-3 h-3" />
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const url = `${window.location.origin}/emp/view/${res.id}`;
                                                        navigator.clipboard.writeText(url);
                                                        setLinkCopiedId(res.id);
                                                        setTimeout(() => setLinkCopiedId(null), 2000);
                                                    }}
                                                    title="Copiar link público"
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${linkCopiedId === res.id
                                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                            : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border-white/5'
                                                        }`}
                                                >
                                                    {linkCopiedId === res.id
                                                        ? <><CheckIcon className="w-3 h-3" /> Link copiado</>
                                                        : <><LinkIcon className="w-3 h-3" /> Link público</>}
                                                </button>
                                                <a
                                                    href={`/emp/view/${res.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    title="Abrir visualização pública"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/5 transition-all"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Abrir
                                                </a>
                                                <button className="text-accent-cyan flex items-center gap-2 font-medium hover:text-white transition-colors">
                                                    {isExpanded ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
                                                    {isExpanded ? 'Fechar' : 'Visualizar Ficha'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* EXPANDED CONTENT */}
                                        {isExpanded && (
                                            <div className="p-6 md:p-10 border-t border-white/10">

                                                {/* GRID DE DADOS */}
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                                                    {/* COLUNA ESQUERDA: E & MAS */}
                                                    <div className="lg:col-span-2 space-y-12">
                                                        {/* BLOCO E */}
                                                        <section>
                                                            <h4 className="text-sm font-bold tracking-[0.2em] text-accent-cyan uppercase mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
                                                                <ChevronRight className="w-4 h-4" /> Fase 1: Onde Está Hoje (E)
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-6">
                                                                <QA label="Serviços & Receita Principal" answer={res.servicos_receita} />
                                                                <QA label="Cliente Ideal e Dor" answer={res.cliente_ideal} />
                                                                <QA label="Origem e Aquisição" answer={res.origem_clientes} />
                                                                <QA label="Segmentos Almejados (2026)" answer={res.segmentos_2026} />
                                                                <QA label="Meta Principal (2026)" answer={res.meta_2026} />
                                                            </div>
                                                        </section>

                                                        {/* BLOCO M */}
                                                        <section>
                                                            <h4 className="text-sm font-bold tracking-[0.2em] text-accent-purple uppercase mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
                                                                <ChevronRight className="w-4 h-4" /> Fase 2: O Gargalo (Mas)
                                                            </h4>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <QA label="Prova Social Pública" answer={res.prova_social_autorizada} />
                                                                <QA label="Números de Impacto" answer={res.numeros_impacto} />
                                                                <QA label="Objeções de Fechamento" answer={res.objecoes_fechamento} />
                                                                <QA label="Fase do Maior Gargalo" answer={res.fase_gargalo_comercial} />
                                                                <QA label="Impedimento Atual (Conteúdo)" answer={res.impedimento_conteudo} />
                                                                <QA label="Conteúdo Demandado (Comercial)" answer={res.conteudo_desejado_comercial} />
                                                            </div>
                                                        </section>

                                                        {/* BLOCO P */}
                                                        <section>
                                                            <h4 className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
                                                                <ChevronRight className="w-4 h-4" /> Fase 3: A Estratégia (Por Isso)
                                                            </h4>
                                                            <div className="grid grid-cols-1 gap-6">
                                                                <QA label="Frase do Novo Posicionamento" answer={res.frase_posicionamento} />
                                                                <QA label="Promessa Central" answer={res.promessa_central} />
                                                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl mt-4">
                                                                    <h5 className="text-xs font-bold text-accent-cyan uppercase mb-4 tracking-widest">Estratégica AGC26 (Abrint)</h5>
                                                                    <QA label="Oferta do Estande" answer={res.oferta_abrint} />
                                                                    <QA label="Recompensa de Visita" answer={res.recompensa_estande} />
                                                                    <QA label="Meta de Leads/Reuniões" answer={res.meta_reunioes_abrint} />
                                                                </div>
                                                            </div>
                                                        </section>
                                                    </div>

                                                    {/* COLUNA DIREITA: ACESSOS E ANEXOS */}
                                                    <div className="lg:col-span-1 space-y-6">
                                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-24">
                                                            <h4 className="text-sm font-bold tracking-[0.2em] text-white uppercase mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
                                                                <User className="w-4 h-4" /> Credenciais da Empresa
                                                            </h4>
                                                            <div className="space-y-4 mb-8">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[10px] uppercase tracking-widest text-muted">Acesso IG - Usuário</span>
                                                                    <div className="bg-black/50 border border-white/10 p-3 rounded-lg font-mono text-sm flex justify-between items-center text-accent-cyan">
                                                                        {res.instagram_user || '—'}
                                                                        <Instagram className="w-4 h-4 opacity-50" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[10px] uppercase tracking-widest text-muted">Acesso IG - Senha</span>
                                                                    <div className="bg-black/50 border border-white/10 p-3 rounded-lg font-mono text-sm text-white/80">
                                                                        {res.instagram_pass || '—'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <h4 className="text-sm font-bold tracking-[0.2em] text-white uppercase mb-6 flex items-center gap-2 border-b border-white/10 pb-2">
                                                                <Download className="w-4 h-4" /> Anexos Recebidos ({docs.length})
                                                            </h4>
                                                            {docs.length === 0 ? (
                                                                <p className="text-xs text-muted font-light">Nenhum documento ou apresentação foi enviada.</p>
                                                            ) : (
                                                                <ul className="flex flex-col gap-2">
                                                                    {docs.map((url, i) => {
                                                                        const fileNameMatch = url.match(/\/([^/?#]+)[^/]*$/);
                                                                        const fileName = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : `Anexo ${i + 1}`;
                                                                        return (
                                                                            <li key={i}>
                                                                                <a
                                                                                    href={url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex items-center justify-between bg-black/50 hover:bg-white/10 border border-white/10 hover:border-white/30 p-3 rounded-lg transition-colors group"
                                                                                >
                                                                                    <span className="text-xs text-white/80 truncate pr-4">{fileName}</span>
                                                                                    <Download className="w-3 h-3 text-muted group-hover:text-white shrink-0" />
                                                                                </a>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* BLOCO DE EXPORTAÇÃO */}
                                                <div className="mt-10 pt-8 border-t border-white/10">
                                                    <h4 className="text-sm font-bold tracking-[0.2em] text-white uppercase mb-4 flex items-center gap-2">
                                                        <FileDown className="w-4 h-4 text-accent-cyan" /> Exportar Diagnóstico
                                                    </h4>
                                                    <textarea
                                                        readOnly
                                                        value={exportText}
                                                        rows={14}
                                                        className="w-full bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-white/70 leading-relaxed resize-none focus:outline-none focus:border-accent-cyan/30 mb-4"
                                                    />
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={handleCopy}
                                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${copiedId === res.id
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                                                                }`}
                                                        >
                                                            {copiedId === res.id
                                                                ? <><CheckIcon className="w-4 h-4" /> Copiado!</>
                                                                : <><Copy className="w-4 h-4" /> Copiar texto</>}
                                                        </button>
                                                        <button
                                                            onClick={handleDownload}
                                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/20 transition-all"
                                                        >
                                                            <Download className="w-4 h-4" /> Download .txt
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                </FadeIn>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

// Subcomponente de Pergunta e Resposta para o Layout
function QA({ label, answer }: { label: string, answer: string }) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs text-muted font-medium uppercase tracking-widest">{label}</span>
            <div className="text-sm font-light text-white/90 bg-white/[0.03] p-4 rounded-xl border border-white/5 leading-relaxed min-h-[3rem]">
                {answer ? answer : <span className="text-white/20 italic">Não respondido</span>}
            </div>
        </div>
    );
}
