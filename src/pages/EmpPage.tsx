import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FadeIn } from '../components/Shared';
import { Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

type EmpData = {
    // E
    servicos_receita: string;
    cliente_ideal: string;
    origem_clientes: string;
    materiais_comerciais: string;
    conteudo_interno_oculto: string;
    segmentos_2026: string;
    meta_2026: string;
    necessidade_digital: string;
    // M
    prova_social_autorizada: string;
    numeros_impacto: string;
    historia_mitigacao: string;
    objecoes_fechamento: string;
    motivo_adiamento: string;
    fase_gargalo_comercial: string;
    impedimento_conteudo: string;
    conteudo_desejado_comercial: string;
    // P
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
    // Anexos e Instagram
    instagram_user: string;
    instagram_pass: string;
    documentos_urls: string[];
};

const INITIAL_DATA: EmpData = {
    servicos_receita: '', cliente_ideal: '', origem_clientes: '', materiais_comerciais: '',
    conteudo_interno_oculto: '', segmentos_2026: '', meta_2026: '', necessidade_digital: '',
    prova_social_autorizada: '', numeros_impacto: '', historia_mitigacao: '', objecoes_fechamento: '',
    motivo_adiamento: '', fase_gargalo_comercial: '', impedimento_conteudo: '', conteudo_desejado_comercial: '',
    frase_posicionamento: '', promessa_central: '', oferta_abrint: '', recompensa_estande: '',
    meta_reunioes_abrint: '', clientes_case: '', historia_forte_mitigacao: '', aprovador_conteudo: '',
    canal_operacional: '', formato_aprovacao: '',
    instagram_user: '', instagram_pass: '', documentos_urls: [],
};

const STEPS = [
    { id: 'E', title: 'Metodologia E: Onde a Computize Está Hoje', description: 'Visão Geral do Negócio' },
    { id: 'M', title: 'Metodologia M: O Que Trava a Computize Hoje', description: 'O Gargalo da Comunicação' },
    { id: 'P', title: 'Metodologia P: O Que Vamos Construir Juntos', description: 'A Solução Estratégica' },
    { id: 'X', title: 'Sua Conta e Anexos', description: 'Informações Complementares e Acessos' },
];

export default function EmpPage() {
    const { slug } = useParams();
    const clientSlug = slug || 'computize';
    const clientName = slug ? slug.replace(/-/g, ' ') : 'Computize';

    const [currentStep, setCurrentStep] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState<EmpData>(INITIAL_DATA);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

    const handleChange = (field: keyof EmpData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFilesToUpload(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFilesToUpload(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, -1));

    const handleSubmit = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            if (!supabase) {
                throw new Error('Supabase não configurado. Verifique as variáveis de ambiente na Vercel (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).');
            }

            const uploadedUrls: string[] = [];

            // Dispara uploads do array inteiro
            for (const file of filesToUpload) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
                const filePath = `uploads/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('anticopyai')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Erro no upload: ', uploadError);
                    throw new Error(`Falha ao fazer upload do arquivo ${file.name}`);
                }

                // Resgata o link publico
                const { data } = supabase.storage.from('anticopyai').getPublicUrl(filePath);
                uploadedUrls.push(data.publicUrl);
            }

            // Atribui os links à submissão do form
            const finalData = { ...formData, documentos_urls: uploadedUrls, client_slug: clientSlug } as any;

            // Compatibilidade: tenta com client_slug e, se a coluna não existir, faz fallback
            let { error: insertError } = await supabase.from('emp_responses').insert([finalData]);
            if (insertError && /client_slug|column/i.test(insertError.message || '')) {
                const { client_slug, ...fallbackData } = finalData;
                const retry = await supabase.from('emp_responses').insert([fallbackData]);
                insertError = retry.error;
            }
            if (insertError) throw insertError;

            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Erro ao salvar as informações. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-bg-primary flex flex-col justify-center items-center p-6 text-center">
                <div className="w-20 h-20 bg-accent-cyan/20 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-accent-cyan" />
                </div>
                <h2 className="text-4xl font-bold mb-4 tracking-tighter">Muito obrigado!</h2>
                <p className="text-muted font-light max-w-lg mb-8">
                    Recebemos as suas informações estruturadas da Metodologia EMP. A Anti Copy Club entrará em contato em breve para darmos o próximo passo.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-3 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                    Voltar para Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen selection:bg-accent-cyan/30 overflow-x-hidden relative bg-bg-primary text-white">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] glow-purple opacity-30" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] glow-cyan opacity-20" />
            </div>

            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex justify-between items-center bg-bg-primary/50 backdrop-blur-md border-b border-white/5">
                <div className="text-xs font-bold tracking-[0.2em] uppercase">
                    Anti Copy Club — Metodologia EMP
                </div>
                {currentStep >= 0 && (
                    <div className="text-xs text-muted flex items-center gap-2">
                        Etapa <span className="text-white font-bold">{currentStep + 1}</span> de 4
                    </div>
                )}
            </nav>

            <main className="relative z-10 pt-32 pb-24 px-6 max-w-4xl mx-auto">
                {currentStep >= 0 && (
                    <FadeIn>
                        <div className="mb-12">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4 text-glow transition-all duration-500">
                                {STEPS[currentStep].title}
                            </h1>
                            <p className="text-muted text-lg font-light">
                                {STEPS[currentStep].description}
                            </p>
                        </div>
                    </FadeIn>
                )}

                {errorMsg && (
                    <div className="p-4 mb-8 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                        {errorMsg}
                    </div>
                )}

                <div className="glass-card p-6 md:p-12 mb-8">
                    <AnimatePresence mode="wait">
                        {currentStep === -1 && (
                            <motion.div
                                key="step-intro"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 text-left"
                            >
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
                            </motion.div>
                        )}

                        {currentStep === 0 && (
                            <motion.div
                                key="step-0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 text-left"
                            >
                                <div className="mb-12 space-y-4">
                                    <h3 className="text-2xl font-bold tracking-tighter text-accent-cyan">Onde {clientName} Está Hoje</h3>
                                    <div className="text-muted font-light leading-relaxed space-y-4">
                                        <p>A Computize é uma empresa especializada em proteção DDoS de alta performance, operando com nuvem de mitigação sob demanda 24/7. Seu core business está centrado em garantir que provedores, ISPs e empresas com infraestrutura crítica permaneçam online independentemente do volume ou intensidade dos ataques recebidos.</p>
                                        <p>O que a empresa entrega na prática não é apenas tecnologia. É continuidade de operação, segurança de receita e tranquilidade operacional para negócios que literalmente não podem parar. Esse valor estratégico, no entanto, ainda não está sendo comunicado com a profundidade que merece.</p>
                                        <p>O site e o Instagram atuais comunicam o lado técnico e profissional, mas ainda estão centrados no produto. Falta uma narrativa que gere urgência e comprove os resultados.</p>
                                        <p className="text-white border-l-2 border-accent-cyan pl-4 py-1 italic mt-6">A AGC26 Abrint em Maio de 2026 é o maior evento do setor. A oportunidade estratégica é chegar ao evento como uma referência aquecida, e não apenas mais um estande.</p>
                                        <p className="font-medium text-accent-cyan pt-4">Nossa Solução: A Anti Copy Club desenvolverá um influenciador IA exclusivo para ser o especialista e porta-voz da Computize, garantindo escala, consistência e personalidade forte à marca.</p>
                                    </div>
                                </div>

                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mb-6 border-b border-white/10 pb-2">O Que Precisamos Saber Para Completar o "E"</div>
                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mb-6">Sobre o negócio</div>
                                <Textarea label="1. Quais são os serviços oferecidos hoje e qual deles gera mais receita? Qual vocês querem crescer nos próximos 12 meses?" value={formData.servicos_receita} onChange={(v) => handleChange('servicos_receita', v)} />
                                <Textarea label="2. Como vocês descrevem o cliente ideal em termos de segmento, porte e principal dor que ele traz quando chega até vocês?" value={formData.cliente_ideal} onChange={(v) => handleChange('cliente_ideal', v)} />
                                <Textarea label="3. Como a maioria dos clientes chega hoje: indicação, evento, busca orgânica, redes sociais?" value={formData.origem_clientes} onChange={(v) => handleChange('origem_clientes', v)} />
                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre materiais e estrutura</div>
                                <Textarea label="4. Vocês têm apresentação comercial ou proposta padrão que usam ativamente? Estão atualizados?" value={formData.materiais_comerciais} onChange={(v) => handleChange('materiais_comerciais', v)} />
                                <Textarea label="5. Existe algum material interno, relatório, caso técnico ou documento que nunca virou conteúdo público mas poderia?" value={formData.conteudo_interno_oculto} onChange={(v) => handleChange('conteudo_interno_oculto', v)} />
                                <Textarea label="6. Quais segmentos vocês ainda não atendem mas têm intenção clara de entrar em 2026?" value={formData.segmentos_2026} onChange={(v) => handleChange('segmentos_2026', v)} />
                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre metas</div>
                                <Textarea label="7. Qual é a meta principal de negócio para 2026, seja faturamento, número de clientes novos ou expansão de segmentos?" value={formData.meta_2026} onChange={(v) => handleChange('meta_2026', v)} />
                                <Textarea label="8. O que precisa acontecer na comunicação e no digital para que essa meta seja atingida?" value={formData.necessidade_digital} onChange={(v) => handleChange('necessidade_digital', v)} />
                            </motion.div>
                        )}

                        {currentStep === 1 && (
                            <motion.div
                                key="step-1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 text-left"
                            >
                                <div className="mb-12 space-y-4">
                                    <h3 className="text-2xl font-bold tracking-tighter text-accent-purple">O Que Trava {clientName} Hoje</h3>
                                    <div className="text-muted font-light leading-relaxed space-y-4">
                                        <p>A Computize tem tudo que uma empresa precisa para dominar o mercado: operação real, entrega consistente e infraestrutura própria. O Gargalo Central é a Técnica Sem Narrativa. A comunicação atual fala para quem já sabe que precisa de proteção DDoS, mas não desperta urgência em quem ainda não viveu um ataque.</p>
                                        <p>Outro problema é a Invisibilidade das Provas. A empresa vive de confiança, e confiança se constrói com provas concretas. Hoje as provas são invisíveis para o mercado: não há histórias públicas, depoimentos ou números de impacto evidentes para quem avalia de fora.</p>
                                        <p className="text-white border-l-2 border-accent-purple pl-4 py-1 italic mt-6">O Gargalo da Comunicação Técnica: O dono de provedor que decide a compra pensa em receita, risco e SLA. É preciso traduzir o lado técnico para a linguagem do tomador de decisão.</p>
                                        <p className="font-medium text-accent-purple pt-4">Risco AGC26: Sem uma estratégia de aquecimento, a Computize chegará como "desconhecida" para boa parte do público da feira em Maio/2026.</p>
                                    </div>
                                </div>

                                <div className="text-sm tracking-widest text-accent-purple uppercase font-bold mb-6 border-b border-white/10 pb-2">O Que Precisamos Confirmar</div>
                                <div className="text-sm tracking-widest text-accent-purple uppercase font-bold mb-6">Sobre prova social</div>
                                <Textarea label="1. Existe algum cliente que autoriza ser citado publicamente por nome, logo ou setor?" value={formData.prova_social_autorizada} onChange={(v) => handleChange('prova_social_autorizada', v)} />
                                <Textarea label="2. Há algum número concreto que pode ser comunicado, como volume de ataques mitigados, pico de Gbps protegido ou tempo médio de resposta?" value={formData.numeros_impacto} onChange={(v) => handleChange('numeros_impacto', v)} />
                                <Textarea label="3. Existe algum episódio real de mitigação que pode ser transformado em história, mesmo sem citar o nome do cliente?" value={formData.historia_mitigacao} onChange={(v) => handleChange('historia_mitigacao', v)} />
                                <div className="text-sm tracking-widest text-accent-purple uppercase font-bold mt-12 mb-6">Sobre vendas e objeções</div>
                                <Textarea label="4. Quais são as principais objeções que travam o fechamento de novos clientes hoje?" value={formData.objecoes_fechamento} onChange={(v) => handleChange('objecoes_fechamento', v)} />
                                <Textarea label="5. O que o cliente fala quando decide adiar ou não comprar?" value={formData.motivo_adiamento} onChange={(v) => handleChange('motivo_adiamento', v)} />
                                <Textarea label="6. Em qual momento da jornada comercial vocẽs sentem mais dificuldade: gerar demanda, educar o lead ou fechar?" value={formData.fase_gargalo_comercial} onChange={(v) => handleChange('fase_gargalo_comercial', v)} />
                                <div className="text-sm tracking-widest text-accent-purple uppercase font-bold mt-12 mb-6">Sobre operação de conteúdo</div>
                                <Textarea label="7. O que impede a Computize de produzir mais conteúdo hoje: tempo, equipe, processo, clareza estratégica?" value={formData.impedimento_conteudo} onChange={(v) => handleChange('impedimento_conteudo', v)} />
                                <Textarea label="8. Existe algum tipo de conteúdo que o time comercial sempre pediu e nunca foi produzido?" value={formData.conteudo_desejado_comercial} onChange={(v) => handleChange('conteudo_desejado_comercial', v)} />
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 text-left"
                            >
                                <div className="mb-12 space-y-4">
                                    <h3 className="text-2xl font-bold tracking-tighter text-accent-cyan">O Que Vamos Construir Juntos</h3>
                                    <div className="text-muted font-light leading-relaxed space-y-4">
                                        <p>A Anti Copy Club assumirá a estratégia e a produção de conteúdo completa da Computize, usando IA para produzir 12 conteúdos mensais (vídeos, posts, stories) guiados pelo novo influenciador exclusivo da marca.</p>
                                        <p className="font-bold text-white mb-2 mt-4">Os 4 Pilares da Estratégia:</p>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li><strong className="text-accent-cyan">1. Urgência e Risco:</strong> O custo real de não ter proteção e de cair.</li>
                                            <li><strong className="text-accent-cyan">2. Prova Social e Cases:</strong> Histórias reais com tensão de mitigação e resultado concreto.</li>
                                            <li><strong className="text-accent-cyan">3. Bastidores e Autoridade:</strong> O que rola na operação 24/7 e os diferenciais.</li>
                                            <li><strong className="text-accent-cyan">4. Educação e Mercado:</strong> Tendências para posicionar a Computize como referência.</li>
                                        </ul>
                                        <p className="text-white border-l-2 border-accent-cyan pl-4 py-1 italic mt-6">Até maio, a estratégia mira no evento AGC26 Abrint, garantindo audiência aquecida e reuniões qualificadas no dia do evento.</p>
                                    </div>
                                </div>

                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mb-6 border-b border-white/10 pb-2">O Que Precisamos Definir Para Fechar o Plano</div>
                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mb-6">Sobre posicionamento</div>
                                <Textarea label="1. Qual é a frase que vocês querem que o mercado associe à Computize daqui a 6 meses?" value={formData.frase_posicionamento} onChange={(v) => handleChange('frase_posicionamento', v)} />
                                <Textarea label="2. Existe uma promessa central que diferencia claramente a Computize de qualquer outra solução?" value={formData.promessa_central} onChange={(v) => handleChange('promessa_central', v)} />
                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre a AGC26</div>
                                <Textarea label="3. Qual oferta estratégica vocês vão levar para o estande?" value={formData.oferta_abrint} onChange={(v) => handleChange('oferta_abrint', v)} />
                                <Textarea label="4. O que o visitante ganha ao parar no estande da Computize?" value={formData.recompensa_estande} onChange={(v) => handleChange('recompensa_estande', v)} />
                                <Textarea label="5. Quantos leads ou reuniões representam sucesso no evento?" value={formData.meta_reunioes_abrint} onChange={(v) => handleChange('meta_reunioes_abrint', v)} />
                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre prova social para o plano</div>
                                <Textarea label="6. Quais clientes podem virar case estruturado?" value={formData.clientes_case} onChange={(v) => handleChange('clientes_case', v)} />
                                <Textarea label="7. Existe algum episódio forte de mitigação que pode ser contado?" value={formData.historia_forte_mitigacao} onChange={(v) => handleChange('historia_forte_mitigacao', v)} />
                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold mt-12 mb-6">Sobre aprovação e operação</div>
                                <Textarea label="8. Quem aprova os conteúdos internamente e qual o prazo médio de retorno?" value={formData.aprovador_conteudo} onChange={(v) => handleChange('aprovador_conteudo', v)} />
                                <Textarea label="9. Qual o melhor canal para comunicação operacional do projeto?" value={formData.canal_operacional} onChange={(v) => handleChange('canal_operacional', v)} />
                                <Textarea label="10. Preferem aprovação por lote mensal ou peça por peça?" value={formData.formato_aprovacao} onChange={(v) => handleChange('formato_aprovacao', v)} />
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step-3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8 text-left"
                            >
                                <div className="mb-12 space-y-4">
                                    <h3 className="text-2xl font-bold tracking-tighter text-accent-cyan">Sua Conta e Anexos Extras</h3>
                                    <p className="text-muted font-light leading-relaxed">
                                        Para conseguirmos montar uma comunicação o mais próxima da realidade, necessitamos do seu acesso ao Instagram para estudos ou configurações, além de quaisquer PDFs ou DOCs de apresentação originais da marca.
                                    </p>
                                </div>

                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold border-b border-white/10 pb-2 mb-6">Acesso ao Instagram</div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                    <div className="flex flex-col gap-2 relative">
                                        <label className="text-white/80 font-medium text-sm">Usuário (@)</label>
                                        <input
                                            type="text"
                                            value={formData.instagram_user}
                                            onChange={(e) => handleChange('instagram_user', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 transition-all"
                                            placeholder="Ex: @computize"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 relative">
                                        <label className="text-white/80 font-medium text-sm">Senha</label>
                                        <input
                                            type="text"
                                            value={formData.instagram_pass}
                                            onChange={(e) => handleChange('instagram_pass', e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 transition-all"
                                            placeholder="Digite a senha atual"
                                        />
                                    </div>
                                </div>

                                <div className="text-sm tracking-widest text-accent-cyan uppercase font-bold border-b border-white/10 pb-2 mb-6">Documentos da Empresa</div>

                                <div className="bg-black/40 border border-dashed border-white/20 hover:border-accent-cyan/50 rounded-2xl p-8 text-center transition-all cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title="Clique para enviar arquivos"
                                    />
                                    <div className="text-white/60">
                                        <p className="font-bold mb-2">Clique ou arraste até aqui</p>
                                        <p className="text-sm font-light">Suporta PDFs, DOCs, e Imagens de apresentação.</p>
                                    </div>
                                </div>

                                {filesToUpload.length > 0 && (
                                    <div className="mt-6 flex flex-col gap-3">
                                        <h4 className="text-sm font-bold text-white/80">Arquivos anexados ({filesToUpload.length}):</h4>
                                        <ul className="space-y-2">
                                            {filesToUpload.map((file, idx) => (
                                                <li key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10 text-sm hover:border-white/20 transition-all">
                                                    <span className="truncate max-w-[80%] text-muted text-xs pr-4">{file.name}</span>
                                                    <button
                                                        onClick={() => removeFile(idx)}
                                                        className="text-red-400 hover:text-red-300 font-bold text-xs shrink-0 px-2 py-1 rounded bg-red-400/10 hover:bg-red-400/20 transition-colors"
                                                    >
                                                        Remover
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex justify-between items-center mt-8">
                    {currentStep >= 0 ? (
                        <button
                            onClick={prevStep}
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-3 border border-white/20 rounded-full text-sm font-medium transition-colors hover:bg-white/10`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Anterior
                        </button>
                    ) : (
                        <div /> // Placeholder to align "Próximo" to the right
                    )}

                    {currentStep < 0 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
                        >
                            Iniciar Diagnóstico
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : currentStep < 3 ? (
                        <button
                            onClick={nextStep}
                            className="flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all"
                        >
                            Próximo
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-accent-cyan text-black rounded-full text-sm font-bold shadow-[0_0_30px_rgba(10,240,220,0.4)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {loading ? 'Enviando...' : 'Finalizar Plano'}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-2 relative">
            <label className="text-white/80 font-medium text-sm lg:text-base leading-relaxed">{label}</label>
            <div className="relative group mt-2">
                <div className="absolute inset-0 bg-white/5 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="relative w-full min-h-[120px] bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 resize-y transition-all"
                    placeholder="Digite sua resposta aqui..."
                />
            </div>
        </div>
    );
}
