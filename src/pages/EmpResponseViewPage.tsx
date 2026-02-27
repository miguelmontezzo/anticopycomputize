import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import { Loader2, AlertCircle, Download } from 'lucide-react';

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

function ReadonlyTextarea({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-2 relative">
            <label className="text-white/80 font-medium text-sm lg:text-base leading-relaxed">{label}</label>
            <div className="mt-2">
                <textarea
                    readOnly
                    value={value || 'Não respondido'}
                    rows={4}
                    className={`w-full bg-black/40 border rounded-xl p-4 text-sm resize-none focus:outline-none transition-all ${value
                        ? 'border-white/10 text-white'
                        : 'border-white/5 text-white/30 italic'
                        }`}
                />
            </div>
        </div>
    );
}

export default function EmpResponseViewPage() {
    const { id } = useParams<{ id: string }>();
    const [res, setRes] = useState<EmpResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            if (!id) { setNotFound(true); setLoading(false); return; }
            const { data, error } = await supabase
                .from('emp_responses')
                .select('*')
                .eq('id', id)
                .single();
            if (error || !data) setNotFound(true);
            else setRes(data);
            setLoading(false);
        };
        fetch();
    }, [id]);

    const formatDate = (iso: string) =>
        new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(iso));

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
            </div>
        );
    }

    if (notFound || !res) {
        return (
            <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center text-white text-center p-6">
                <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Diagnóstico não encontrado</h1>
                <p className="text-muted font-light mb-8">Este link pode estar incorreto ou o diagnóstico foi removido.</p>
                <Link to="/" className="text-accent-cyan text-sm hover:text-white transition-colors">← Voltar para o início</Link>
            </div>
        );
    }

    const docs = Array.isArray(res.documentos_urls) ? res.documentos_urls : [];

    return (
        <div className="min-h-screen selection:bg-accent-cyan/30 overflow-x-hidden relative bg-bg-primary text-white">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] glow-purple opacity-30" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] glow-cyan opacity-20" />
            </div>

            <nav className="sticky top-0 z-50 px-6 py-5 flex justify-between items-center bg-bg-primary/60 backdrop-blur-md border-b border-white/5">
                <div className="text-xs font-bold tracking-[0.2em] uppercase">
                    Anti Copy Club — Metodologia EMP
                </div>
                <div className="text-xs text-muted flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-cyan inline-block" />
                    Respondido em {formatDate(res.created_at)}
                </div>
            </nav>

            <main className="relative z-10 pt-16 pb-32 px-6 max-w-4xl mx-auto space-y-24">

                {/* ==================== INTRO ==================== */}
                <section>
                    <FadeIn>
                        <div className="glass-card p-6 md:p-12 space-y-8 text-left">
                            <div className="mb-12 space-y-6">
                                <h3 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Bem-vindo ao Diagnóstico.</h3>
                                <div className="text-muted font-light leading-relaxed space-y-4 text-lg">
                                    <p>Prezada equipe Computize,</p>
                                    <p>Antes de qualquer planejamento, acreditamos em algo simples: <strong>nenhuma estratégia funciona sem diagnóstico real.</strong></p>
                                    <p>Por isso, desenvolvemos o Método "E, Mas, Por Isso", uma metodologia estratégica que usamos para entender profundamente o negócio do cliente antes de propor qualquer ação de conteúdo ou comunicação.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-accent-cyan/50 transition-colors">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent-cyan/20 transition-all"></div>
                                    <div className="text-[10px] tracking-widest uppercase text-accent-cyan font-bold mb-4">Etapa 1</div>
                                    <h4 className="text-2xl font-bold mb-4">O "E"</h4>
                                    <p className="text-muted text-sm font-light leading-relaxed">Mapeia onde a empresa está hoje: seus ativos, sua presença, seus canais e suas metas.</p>
                                </div>
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-accent-purple/50 transition-colors">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent-purple/20 transition-all"></div>
                                    <div className="text-[10px] tracking-widest uppercase text-accent-purple font-bold mb-4">Etapa 2</div>
                                    <h4 className="text-2xl font-bold mb-4">O "Mas"</h4>
                                    <p className="text-muted text-sm font-light leading-relaxed">Identifica com honestidade o que trava o crescimento: os gargalos de comunicação, os conflitos narrativos e o que o mercado ainda não enxerga.</p>
                                </div>
                                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-accent-cyan/50 transition-colors">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-cyan/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent-cyan/20 transition-all"></div>
                                    <div className="text-[10px] tracking-widest uppercase text-accent-cyan font-bold mb-4">Etapa 3</div>
                                    <h4 className="text-2xl font-bold mb-4">O "Por Isso"</h4>
                                    <p className="text-muted text-sm font-light leading-relaxed">Onde construímos juntos o plano estratégico e executamos com IA, transformando tudo em conteúdo que gera autoridade e conversão.</p>
                                </div>
                            </div>

                            <div className="text-muted font-light leading-relaxed space-y-4 text-lg">
                                <p>Nos documentos a seguir você encontrará nossa análise inicial sobre a Computize, baseada no que já mapeamos externamente, seguida de perguntas estratégicas específicas para cada etapa.</p>
                                <p>Suas respostas são o que precisamos para fechar o diagnóstico completo e entregar um plano estratégico real, executável e alinhado aos objetivos de negócio da Computize para 2026, incluindo a preparação estratégica para a AGC26 Abrint.</p>
                                <p className="text-white border-l-2 border-white/30 pl-4 py-2 mt-6">
                                    Pedimos que as respostas sejam enviadas até <strong className="text-accent-cyan">26/02/2026</strong> para que possamos iniciar a entrega do plano em seguida.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                </section>

                {/* ==================== FASE E ==================== */}
                <section>
                    <FadeIn>
                        <div className="mb-12">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
                                Metodologia E: Onde a Computize Está Hoje
                            </h1>
                            <p className="text-muted text-lg font-light">Visão Geral do Negócio</p>
                        </div>
                    </FadeIn>


                    <div className="glass-card p-6 md:p-12 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold tracking-tighter text-accent-cyan">Onde a Computize Está Hoje</h3>
                            <div className="text-muted font-light leading-relaxed space-y-4">
                                <p>A Computize é uma empresa especializada em proteção DDoS de alta performance, operando com nuvem de mitigação sob demanda 24/7. Seu core business está centrado em garantir que provedores, ISPs e empresas com infraestrutura crítica permaneçam online independentemente do volume ou intensidade dos ataques recebidos.</p>
                                <p>O que a empresa entrega na prática não é apenas tecnologia. É continuidade de operação, segurança de receita e tranquilidade operacional para negócios que literalmente não podem parar.</p>
                                <p className="text-white border-l-2 border-accent-cyan pl-4 py-1 italic">A AGC26 Abrint em Maio de 2026 é o maior evento do setor. A oportunidade estratégica é chegar ao evento como uma referência aquecida, e não apenas mais um estande.</p>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mb-6 border-b border-white/10 pb-2">O Que Precisamos Saber Para Completar o "E"</div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mb-6">Sobre o negócio</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="1. Quais são os serviços oferecidos hoje e qual deles gera mais receita? Qual vocês querem crescer nos próximos 12 meses?" value={res.servicos_receita} />
                                <ReadonlyTextarea label="2. Como vocês descrevem o cliente ideal em termos de segmento, porte e principal dor que ele traz quando chega até vocês?" value={res.cliente_ideal} />
                                <ReadonlyTextarea label="3. Como a maioria dos clientes chega hoje: indicação, evento, busca orgânica, redes sociais?" value={res.origem_clientes} />
                            </div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre materiais e estrutura</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="4. Vocês têm apresentação comercial ou proposta padrão que usam ativamente? Estão atualizados?" value={res.materiais_comerciais} />
                                <ReadonlyTextarea label="5. Existe algum material interno, relatório, caso técnico ou documento que nunca virou conteúdo público mas poderia?" value={res.conteudo_interno_oculto} />
                                <ReadonlyTextarea label="6. Quais segmentos vocês ainda não atendem mas têm intenção clara de entrar em 2026?" value={res.segmentos_2026} />
                            </div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre metas</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="7. Qual é a meta principal de negócio para 2026, seja faturamento, número de clientes novos ou expansão de segmentos?" value={res.meta_2026} />
                                <ReadonlyTextarea label="8. O que precisa acontecer na comunicação e no digital para que essa meta seja atingida?" value={res.necessidade_digital} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== FASE M ==================== */}
                <section>
                    <FadeIn>
                        <div className="mb-12">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
                                Metodologia M: O Que Trava a Computize Hoje
                            </h1>
                            <p className="text-muted text-lg font-light">O Gargalo da Comunicação</p>
                        </div>
                    </FadeIn>

                    <div className="glass-card p-6 md:p-12 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold tracking-tighter text-accent-purple">O Que Trava a Computize Hoje</h3>
                            <div className="text-muted font-light leading-relaxed space-y-4">
                                <p>A Computize tem tudo que uma empresa precisa para dominar o mercado: operação real, entrega consistente e infraestrutura própria. O Gargalo Central é a Técnica Sem Narrativa.</p>
                                <p>Outro problema é a Invisibilidade das Provas. A empresa vive de confiança, e confiança se constrói com provas concretas. Hoje as provas são invisíveis para o mercado: não há histórias públicas, depoimentos ou números de impacto evidentes.</p>
                                <p className="text-white border-l-2 border-accent-purple pl-4 py-1 italic">O Gargalo da Comunicação Técnica: O dono de provedor que decide a compra pensa em receita, risco e SLA. É preciso traduzir o lado técnico para a linguagem do tomador de decisão.</p>
                                <p className="font-medium text-accent-purple">Risco AGC26: Sem uma estratégia de aquecimento, a Computize chegará como "desconhecida" para boa parte do público da feira em Maio/2026.</p>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm tracking-widest text-accent-purple uppercase font-bold mb-6 border-b border-white/10 pb-2">O Que Precisamos Confirmar</div>
                            <div className="text-sm tracking-widest text-accent-purple uppercase font-bold mb-6">Sobre prova social</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="1. Existe algum cliente que autoriza ser citado publicamente por nome, logo ou setor?" value={res.prova_social_autorizada} />
                                <ReadonlyTextarea label="2. Há algum número concreto que pode ser comunicado, como volume de ataques mitigados, pico de Gbps protegido ou tempo médio de resposta?" value={res.numeros_impacto} />
                                <ReadonlyTextarea label="3. Existe algum episódio real de mitigação que pode ser transformado em história, mesmo sem citar o nome do cliente?" value={res.historia_mitigacao} />
                            </div>
                            <div className="text-sm tracking-widest text-accent-purple uppercase font-bold mt-12 mb-6">Sobre vendas e objeções</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="4. Quais são as principais objeções que travam o fechamento de novos clientes hoje?" value={res.objecoes_fechamento} />
                                <ReadonlyTextarea label="5. O que o cliente fala quando decide adiar ou não comprar?" value={res.motivo_adiamento} />
                                <ReadonlyTextarea label="6. Em qual momento da jornada comercial vocês sentem mais dificuldade: gerar demanda, educar o lead ou fechar?" value={res.fase_gargalo_comercial} />
                            </div>
                            <div className="text-sm tracking-widest text-accent-purple uppercase font-bold mt-12 mb-6">Sobre operação de conteúdo</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="7. O que impede a Computize de produzir mais conteúdo hoje: tempo, equipe, processo, clareza estratégica?" value={res.impedimento_conteudo} />
                                <ReadonlyTextarea label="8. Existe algum tipo de conteúdo que o time comercial sempre pediu e nunca foi produzido?" value={res.conteudo_desejado_comercial} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== FASE P ==================== */}
                <section>
                    <FadeIn>
                        <div className="mb-12">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
                                Metodologia P: O Que Vamos Construir Juntos
                            </h1>
                            <p className="text-muted text-lg font-light">A Solução Estratégica</p>
                        </div>
                    </FadeIn>

                    <div className="glass-card p-6 md:p-12 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold tracking-tighter text-accent-cyan">O Que Vamos Construir Juntos</h3>
                            <div className="text-muted font-light leading-relaxed space-y-4">
                                <p>A Anti Copy Club assumirá a estratégia e a produção de conteúdo completa da Computize, usando IA para produzir 12 conteúdos mensais guiados pelo novo influenciador exclusivo da marca.</p>
                                <p className="font-bold text-white mb-2 mt-4">Os 4 Pilares da Estratégia:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong className="text-accent-cyan">1. Urgência e Risco:</strong> O custo real de não ter proteção e de cair.</li>
                                    <li><strong className="text-accent-cyan">2. Prova Social e Cases:</strong> Histórias reais com tensão de mitigação e resultado concreto.</li>
                                    <li><strong className="text-accent-cyan">3. Bastidores e Autoridade:</strong> O que rola na operação 24/7 e os diferenciais.</li>
                                    <li><strong className="text-accent-cyan">4. Educação e Mercado:</strong> Tendências para posicionar a Computize como referência.</li>
                                </ul>
                                <p className="text-white border-l-2 border-accent-cyan pl-4 py-1 italic">Até maio, a estratégia mira no evento AGC26 Abrint, garantindo audiência aquecida e reuniões qualificadas no dia do evento.</p>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mb-6 border-b border-white/10 pb-2">O Que Precisamos Definir Para Fechar o Plano</div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mb-6">Sobre posicionamento</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="1. Qual é a frase que vocês querem que o mercado associe à Computize daqui a 6 meses?" value={res.frase_posicionamento} />
                                <ReadonlyTextarea label="2. Existe uma promessa central que diferencia claramente a Computize de qualquer outra solução?" value={res.promessa_central} />
                            </div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre a AGC26</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="3. Qual oferta estratégica vocês vão levar para o estande?" value={res.oferta_abrint} />
                                <ReadonlyTextarea label="4. O que o visitante ganha ao parar no estande da Computize?" value={res.recompensa_estande} />
                                <ReadonlyTextarea label="5. Quantos leads ou reuniões representam sucesso no evento?" value={res.meta_reunioes_abrint} />
                            </div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre prova social para o plano</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="6. Quais clientes podem virar case estruturado?" value={res.clientes_case} />
                                <ReadonlyTextarea label="7. Existe algum episódio forte de mitigação que pode ser contado?" value={res.historia_forte_mitigacao} />
                            </div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre aprovação e operação</div>
                            <div className="space-y-8">
                                <ReadonlyTextarea label="8. Quem aprova os conteúdos internamente e qual o prazo médio de retorno?" value={res.aprovador_conteudo} />
                                <ReadonlyTextarea label="9. Qual o melhor canal para comunicação operacional do projeto?" value={res.canal_operacional} />
                                <ReadonlyTextarea label="10. Preferem aprovação por lote mensal ou peça por peça?" value={res.formato_aprovacao} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ==================== FASE X — ANEXOS ==================== */}
                <section>
                    <FadeIn>
                        <div className="mb-12">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">
                                Sua Conta e Anexos
                            </h1>
                            <p className="text-muted text-lg font-light">Informações Complementares e Acessos</p>
                        </div>
                    </FadeIn>

                    <div className="glass-card p-6 md:p-12 space-y-10">
                        {/* Instagram */}
                        <div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold border-b border-white/10 pb-2 mb-6">Acesso ao Instagram</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-white/80 font-medium text-sm">Usuário (@)</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={res.instagram_user || 'Não informado'}
                                        className={`w-full bg-black/40 border rounded-xl p-4 text-sm focus:outline-none ${res.instagram_user ? 'border-white/10 text-white' : 'border-white/5 text-white/30 italic'}`}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-white/80 font-medium text-sm">Senha</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={res.instagram_pass || 'Não informado'}
                                        className={`w-full bg-black/40 border rounded-xl p-4 text-sm focus:outline-none ${res.instagram_pass ? 'border-white/10 text-white' : 'border-white/5 text-white/30 italic'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Documentos */}
                        <div>
                            <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold border-b border-white/10 pb-2 mb-6">
                                Documentos da Empresa ({docs.length})
                            </div>
                            {docs.length === 0 ? (
                                <p className="text-muted font-light text-sm italic">Nenhum documento foi enviado neste diagnóstico.</p>
                            ) : (
                                <ul className="flex flex-col gap-3">
                                    {docs.map((url, i) => {
                                        const match = url.match(/\/([^/?#]+)[^/]*$/);
                                        const name = match ? decodeURIComponent(match[1]) : `Anexo ${i + 1}`;
                                        return (
                                            <li key={i}>
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between bg-black/40 hover:bg-white/10 border border-white/10 hover:border-white/30 p-4 rounded-xl transition-all group"
                                                >
                                                    <span className="text-sm text-white/80 truncate pr-4">{name}</span>
                                                    <Download className="w-4 h-4 text-muted group-hover:text-white shrink-0 transition-colors" />
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <FadeIn>
                    <div className="text-center pt-4 border-t border-white/5">
                        <div className="text-[10px] tracking-[0.3em] uppercase text-muted">
                            Anti Copy Club — Metodologia EMP — Documento Confidencial
                        </div>
                    </div>
                </FadeIn>

            </main>
        </div>
    );
}
