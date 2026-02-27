import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
    ArrowRight,
    ArrowLeft,
    ChevronDown,
    Check,
    Zap,
    Target,
    Layers,
    Play,
    Film,
    BookOpen,
    BarChart2,
    Mail,
    Grid,
    MessageCircle,
} from "lucide-react";
import { FadeIn } from "../components/Shared";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const slides = [
    {
        id: "intro",
        label: "Introdução",
        phase: null,
    },
    {
        id: "emp-equation",
        label: "A Equação",
        phase: null,
    },
    {
        id: "origin",
        label: "A Origem",
        phase: null,
    },
    {
        id: "fase-e",
        label: "Fase E",
        phase: "E",
    },
    {
        id: "fase-mas",
        label: "Fase Mas",
        phase: "Mas",
    },
    {
        id: "fase-porisso",
        label: "Fase Por Isso",
        phase: "Por Isso",
    },
    {
        id: "aplicacao",
        label: "Aplicações",
        phase: null,
    },
    {
        id: "exemplos",
        label: "Exemplos Reais",
        phase: null,
    },
    {
        id: "galeria",
        label: "O Que Já Fizemos",
        phase: null,
    },
    {
        id: "diagnostico",
        label: "Diagnóstico de Roteiro",
        phase: null,
    },
    {
        id: "checklist",
        label: "Checklist",
        phase: null,
    },
];

const applicationTable = [
    { context: "Diagnóstico de cliente", e: "O que a empresa já tem", mas: "O que está travando o crescimento", porisso: "A estratégia que vamos executar", icon: <Target className="w-5 h-5" /> },
    { context: "Roteiro de vídeo", e: "Gancho — situação inicial", mas: "Conflito — a dor, a virada", porisso: "Resolução — a solução, o CTA", icon: <Film className="w-5 h-5" /> },
    { context: "Copy de post/anúncio", e: "Linha 1 — contexto do público", mas: "Desenvolvimento — a tensão", porisso: "Fechamento — prova + CTA", icon: <BookOpen className="w-5 h-5" /> },
    { context: "Carrossel", e: "Slide 1 — gancho visual", mas: "Slides do meio — o ensinamento", porisso: "Último slide — conclusão + CTA", icon: <Grid className="w-5 h-5" /> },
    { context: "E-mail / WhatsApp", e: "Abertura — realidade do leitor", mas: "Meio — o problema não resolvido", porisso: "Fechamento — ação imediata", icon: <Mail className="w-5 h-5" /> },
    { context: "Análise de resultado", e: "O que foi entregue", mas: "O que não performou como esperado", porisso: "O que ajustamos no próximo mês", icon: <BarChart2 className="w-5 h-5" /> },
];

const realExamples = [
    {
        sector: "🏢 Empresa de Tecnologia B2B",
        e: "A empresa tem operação técnica sólida, time especializado, clientes satisfeitos e está confirmada em um evento de setor importante.",
        mas: "O mercado não enxerga nada disso. A comunicação é técnica demais, não há cases públicos, não há prova social, e a presença nas redes é inconsistente. A empresa é boa, mas invisível.",
        porisso: "A Anti Copy Club criou uma estratégia de conteúdo com IA que transforma a operação técnica em autoridade visível: influenciador IA como porta-voz, narrativa humanizada com cases reais e 12 conteúdos mensais que constroem posicionamento semana a semana.",
        color: "indigo",
    },
    {
        sector: "🛍️ Loja de Moda Feminina Local",
        e: "A loja existe há 8 anos, tem clientela fiel, produto de qualidade e uma dona com história poderosa de empreendedorismo feminino.",
        mas: "O Instagram parece um catálogo sem alma. Todos os posts são foto de produto com preço. Não há storytelling, não há conexão emocional, a audiência não cresce e novos clientes não aparecem.",
        porisso: "Criamos uma série de Reels com a história da fundadora como âncora narrativa, carrosséis de estilo com conflito de identidade e stories sequenciais que constroem relacionamento antes de vender.",
        color: "rose",
    },
    {
        sector: "💊 Profissional de Saúde (Nutricionista)",
        e: "Nutricionista com 6 anos de experiência, especialização em nutrição esportiva, resultados reais com pacientes e agenda cheia no consultório.",
        mas: "Nas redes, ela posta dicas soltas sobre alimentação que qualquer perfil de saúde já posta. Nada diferencia ela da concorrência. O conteúdo não converte porque não demonstra autoridade única.",
        porisso: "Desenvolvemos pilares de conteúdo baseados nos conflitos reais dos seus pacientes, roteiros de Reels com ganchos de tensão técnica e uma série de carrosséis de diagnóstico que posicionam ela como a especialista que pensa diferente.",
        color: "emerald",
    },
];

const checklistItems = {
    e: [
        "Briefing narrativo preenchido e validado",
        "Diagnóstico de presença digital realizado",
        "Conflito central identificado",
        "Persona e objetivos de negócio mapeados",
    ],
    mas: [
        "Posicionamento narrativo definido",
        "Pilares de conteúdo aprovados",
        "Calendário editorial do mês estruturado",
        "Tom de voz e formatos definidos",
    ],
    porisso: [
        "Cada peça tem gancho (E), conflito (Mas) e resolução/CTA (Por Isso)",
        "Conteúdo alinhado aos pilares",
        "Linguagem no tom de voz aprovado",
        "CTA claro e direcionado ao objetivo do mês",
    ],
};

/* ─────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────── */

const EMPBadge = ({ letter, color }: { letter: string; color: string }) => {
    const colors: Record<string, string> = {
        e: "bg-amber-400 text-amber-900",
        mas: "bg-rose-500 text-white",
        porisso: "bg-emerald-500 text-white",
    };
    return (
        <span className={`inline-flex items-center justify-center font-black text-xs px-2 py-0.5 rounded ${colors[color] || "bg-gray-200 text-gray-700"}`}>
            {letter}
        </span>
    );
};

const PhaseTag = ({ phase }: { phase: string | null }) => {
    if (!phase) return null;
    const map: Record<string, { bg: string; text: string; label: string }> = {
        E: { bg: "bg-amber-100", text: "text-amber-700", label: "Fase E — Estado" },
        Mas: { bg: "bg-rose-100", text: "text-rose-700", label: "Fase Mas — Conflito" },
        "Por Isso": { bg: "bg-emerald-100", text: "text-emerald-700", label: "Fase Por Isso — Solução" },
    };
    const s = map[phase];
    return (
        <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full ${s.bg} ${s.text}`}>
            {s.label}
        </span>
    );
};

/* ─────────────────────────────────────────────
   SLIDE COMPONENTS
───────────────────────────────────────────── */

const SlideIntro = () => (
    <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto h-full px-4 py-20">
        <FadeIn>
            <div className="inline-block px-4 py-1.5 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-widest mb-8">
                Anti Copy Club · Metodologia Proprietária
            </div>
        </FadeIn>
        <FadeIn delay={0.1}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-none mb-6">
                Método{" "}
                <span className="relative inline-block">
                    <span className="relative z-10">EMP</span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-emerald-400/40 -z-0 rounded" />
                </span>
            </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
            <div className="flex items-center gap-3 justify-center mb-8 text-4xl md:text-6xl font-bold tracking-tight">
                <span className="text-amber-500">E</span>
                <span className="text-gray-300 font-light text-2xl">→</span>
                <span className="text-rose-500">Mas</span>
                <span className="text-gray-300 font-light text-2xl">→</span>
                <span className="text-emerald-500">Por Isso</span>
            </div>
        </FadeIn>
        <FadeIn delay={0.3}>
            <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed max-w-2xl">
                "Toda empresa tem uma história. Toda história tem um estado atual, um conflito e uma virada.{" "}
                <strong className="text-gray-800 font-semibold">O Método EMP é o sistema que transforma essa história em estratégia, conteúdo e resultado.</strong>"
            </p>
        </FadeIn>
        <FadeIn delay={0.4}>
            <p className="mt-6 text-sm text-gray-400 font-medium uppercase tracking-widest">— Anti Copy Club</p>
        </FadeIn>
    </div>
);

const SlideEMPEquation = () => {
    const [revealed, setRevealed] = useState(0);
    useEffect(() => {
        const timers = [
            setTimeout(() => setRevealed(1), 300),
            setTimeout(() => setRevealed(2), 900),
            setTimeout(() => setRevealed(3), 1600),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    const items = [
        { letter: "E", title: "Estado Atual", desc: "Onde a empresa está. O que ela já tem.", color: "amber", bg: "bg-amber-50", border: "border-amber-200", accent: "text-amber-600" },
        { letter: "Mas", title: "O Conflito", desc: "O gargalo. O vilão da história.", color: "rose", bg: "bg-rose-50", border: "border-rose-200", accent: "text-rose-600" },
        { letter: "Por Isso", title: "A Solução", desc: "A estratégia. A execução.", color: "emerald", bg: "bg-emerald-50", border: "border-emerald-200", accent: "text-emerald-600" },
    ];

    return (
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto h-full px-4 py-20 text-center">
            <FadeIn>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-4">A Equação do EMP</h2>
                <p className="text-gray-500 font-light mb-16 text-lg">Três elementos. Uma lógica inquebrável.</p>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {items.map((item, i) => (
                    <AnimatePresence key={i}>
                        {revealed > i && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={`${item.bg} ${item.border} border-2 rounded-3xl p-10 flex flex-col items-center text-center gap-4 relative overflow-hidden`}
                            >
                                <div className={`text-5xl font-black ${item.accent}`}>{item.letter}</div>
                                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                                <p className="text-gray-500 font-light text-sm leading-relaxed">{item.desc}</p>

                                {i < 2 && (
                                    <div className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center">
                                        <ArrowRight className="w-5 h-5 text-gray-300" />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                ))}
            </div>

            {revealed === 3 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 text-lg text-gray-600 font-light max-w-2xl"
                >
                    Sem <strong className="text-amber-600">E</strong>, não há diagnóstico. Sem <strong className="text-rose-600">Mas</strong>, não há estratégia. Sem{" "}
                    <strong className="text-emerald-600">Por Isso</strong>, não há entrega.
                </motion.p>
            )}
        </div>
    );
};

const SlideOrigin = () => (
    <div className="flex flex-col max-w-5xl mx-auto h-full px-4 py-16 justify-center gap-10">
        <FadeIn>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">A Origem: Pixar, South Park</h2>
            <p className="text-gray-400 font-light text-xl">e a Narrativa Mais Poderosa do Mundo</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Pixar */}
            <FadeIn delay={0.1}>
                <div className="bg-gray-900 text-white rounded-3xl overflow-hidden flex flex-col h-full">
                    {/* YouTube embed — Pixar (FIXED COVER) */}
                    <div className="relative w-full aspect-video overflow-hidden">
                        <iframe
                            className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            src="https://www.youtube.com/embed/c51ND9Hdbw0?autoplay=1&mute=1&controls=0&loop=1&playlist=c51ND9Hdbw0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&autohide=1"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title="Pixar — E Mas Por Isso"
                            style={{ border: 'none' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent pointer-events-none" />
                    </div>
                    <div className="p-8 flex flex-col gap-4 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🎬</span>
                            <h3 className="text-xl font-bold">A Pixar e o E... Mas... Por Isso</h3>
                        </div>
                        <p className="text-gray-400 font-light text-sm leading-relaxed">
                            A Pixar usa essa mesma lógica para construir <em>todas</em> as suas histórias. É a espinha dorsal de Toy Story, Up, Soul — todos os filmes que fazem adultos chorarem em sala escura.
                        </p>
                        <div className="border-t border-white/10 pt-4 space-y-2">
                            <div className="flex gap-3 items-start">
                                <span className="text-amber-400 font-bold text-xs w-6 shrink-0 mt-0.5">E</span>
                                <p className="text-xs text-gray-300">Carl é um velho viúvo que prometeu levar sua esposa às Cataratas Paradiso.</p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="text-rose-400 font-bold text-xs w-6 shrink-0 mt-0.5">Mas</span>
                                <p className="text-xs text-gray-300">Ele vai ser removido de sua casa, e o tempo está se esgotando.</p>
                            </div>
                            <div className="flex gap-3 items-start">
                                <span className="text-emerald-400 font-bold text-xs w-6 shrink-0 mt-0.5">P.I.</span>
                                <p className="text-xs text-gray-300">Ele prende milhares de balões na casa e parte em uma aventura impossível.</p>
                            </div>
                        </div>
                        <p className="text-xs text-emerald-400 font-semibold">É exatamente isso que fazemos com marcas.</p>
                    </div>
                </div>
            </FadeIn>

            {/* Card South Park */}
            <FadeIn delay={0.2}>
                <div className="bg-gray-50 rounded-3xl overflow-hidden flex flex-col h-full border border-gray-200">
                    {/* YouTube embed — South Park Masterclass (FIXED COVER) */}
                    <div className="relative w-full aspect-video overflow-hidden">
                        <iframe
                            className="absolute top-1/2 left-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            src="https://www.youtube.com/embed/Qe60U7DXxaY?autoplay=1&mute=1&controls=0&loop=1&playlist=Qe60U7DXxaY&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&start=0&autohide=1"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title="South Park — Regra do Então/Mas"
                            style={{ border: 'none' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/60 to-transparent pointer-events-none" />
                    </div>
                    <div className="p-8 flex flex-col gap-4 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🎭</span>
                            <h3 className="text-xl font-bold text-gray-900">South Park e a Regra do Então/Mas</h3>
                        </div>
                        <p className="text-gray-500 font-light text-sm leading-relaxed">
                            Trey Parker e Matt Stone: toda cena ruim de roteiro pode ser diagnosticada com um único teste.
                        </p>
                        <div className="space-y-3">
                            <div className="flex gap-3 items-center p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                                <p className="text-xs text-gray-700 font-medium">"X, <strong>mas</strong> obstáculo Y, <strong>por isso</strong> ele faz Z." ✅</p>
                            </div>
                            <div className="flex gap-3 items-center p-3 bg-red-50 rounded-xl border border-red-100">
                                <span className="text-red-400 font-bold shrink-0">✕</span>
                                <p className="text-xs text-gray-700 font-medium">"X, <em>e então</em> Y, <em>e então</em> Z." ❌</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-light mt-auto">
                            A diferença entre conteúdo que para o dedo e conteúdo que ninguém assiste.
                        </p>
                    </div>
                </div>
            </FadeIn>
        </div>
    </div>
);

const SlideFaseE = () => (
    <div className="flex flex-col max-w-4xl mx-auto h-full px-4 py-20 justify-center gap-10">
        <FadeIn>
            <PhaseTag phase="E" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 mt-4 mb-2">
                Entendimento
            </h2>
            <p className="text-xl text-gray-400 font-light">Diagnóstico</p>
        </FadeIn>
        <FadeIn delay={0.1}>
            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-2xl">
                Antes de qualquer post, qualquer vídeo, qualquer copy — mapeamos a realidade do cliente. Não informação básica. A <strong className="text-gray-800">narrativa do negócio</strong>.
            </p>
        </FadeIn>
        <FadeIn delay={0.2}>
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-6">O que entra no E</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        "Identidade da marca e transformação que ela entrega",
                        "Ativos existentes: site, redes, conteúdos, tom de voz atual",
                        "Presença digital e desempenho atual",
                        "Objetivos de negócio e datas estratégicas",
                        "Provas sociais: cases, depoimentos, números",
                        "Persona: quem compra, o que motiva, quais são as objeções",
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-amber-700" />
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{item}</p>
                        </div>
                    ))}
                </div>
            </div>
        </FadeIn>
        <FadeIn delay={0.3}>
            <div className="flex gap-4 items-center p-6 bg-gray-900 text-white rounded-2xl">
                <Zap className="w-6 h-6 text-amber-400 shrink-0" />
                <p className="text-sm font-medium">
                    <strong className="text-amber-400">Entrega:</strong> Diagnóstico documentado com narrativa atual do cliente, mapa de ativos e conflito central identificado.
                </p>
            </div>
        </FadeIn>
    </div>
);

const SlideFaseMas = () => (
    <div className="flex flex-col max-w-4xl mx-auto h-full px-4 py-20 justify-center gap-10">
        <FadeIn>
            <PhaseTag phase="Mas" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 mt-4 mb-2">
                Mapa Estratégico
            </h2>
            <p className="text-xl text-gray-400 font-light">A fase mais crítica</p>
        </FadeIn>
        <FadeIn delay={0.1}>
            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-2xl">
                Aqui nomeamos o <strong className="text-rose-600">vilão da história</strong> — o que está impedindo a marca de crescer. Pode ser invisibilidade, comunicação técnica demais, falta de prova social, posicionamento genérico, inconsistência de publicação.
            </p>
            <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <p className="text-sm text-rose-700 font-medium">💡 O Mas não é crítica. É diagnóstico honesto que abre espaço para solução.</p>
            </div>
        </FadeIn>
        <FadeIn delay={0.2}>
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8">
                <p className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-6">O que entra no Mas</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        "Conflito central da marca",
                        "Posicionamento narrativo (como a marca se torna protagonista)",
                        "Pilares de conteúdo (3 a 5 temas estratégicos)",
                        "Tom de voz, formatos prioritários e calendário editorial",
                        "Métricas de sucesso do mês",
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <div className="w-5 h-5 rounded-full bg-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-rose-700" />
                            </div>
                            <p className="text-sm text-gray-700 font-medium">{item}</p>
                        </div>
                    ))}
                </div>
            </div>
        </FadeIn>
        <FadeIn delay={0.3}>
            <div className="flex gap-4 items-center p-6 bg-gray-900 text-white rounded-2xl">
                <Target className="w-6 h-6 text-rose-400 shrink-0" />
                <p className="text-sm font-medium">
                    <strong className="text-rose-400">Entrega:</strong> Plano estratégico completo com posicionamento, pilares, calendário e métricas.
                </p>
            </div>
        </FadeIn>
    </div>
);

const SlideFasePorIsso = () => (
    <div className="flex flex-col max-w-4xl mx-auto h-full px-4 py-20 justify-center gap-10">
        <FadeIn>
            <PhaseTag phase="Por Isso" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 mt-4 mb-2">
                Produção e Execução
            </h2>
            <p className="text-xl text-gray-400 font-light">Onde a estratégia vira conteúdo</p>
        </FadeIn>
        <FadeIn delay={0.1}>
            <p className="text-lg text-gray-600 font-light leading-relaxed max-w-2xl">
                Cada peça produzida pela Anti Copy Club tem obrigatoriamente os três elementos do EMP.{" "}
                <strong className="text-gray-800">Não existe conteúdo sem gancho, conflito e resolução.</strong>
            </p>
        </FadeIn>
        <FadeIn delay={0.2}>
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 flex flex-col gap-6">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">O que entra no Por Isso</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { icon: "🎬", title: "Roteiros", desc: "Cada vídeo com gancho, conflito e CTA." },
                        { icon: "✍️", title: "Copies", desc: "Textos que geram tensão antes de converter." },
                        { icon: "📱", title: "Carrosséis", desc: "Slides com narrativa EMP do início ao fim." },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="text-3xl">{item.icon}</div>
                            <h4 className="font-bold text-gray-900">{item.title}</h4>
                            <p className="text-sm text-gray-500 font-light">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </FadeIn>
        <FadeIn delay={0.3}>
            <div className="flex gap-4 items-center p-6 bg-gray-900 text-white rounded-2xl">
                <Layers className="w-6 h-6 text-emerald-400 shrink-0" />
                <p className="text-sm font-medium">
                    <strong className="text-emerald-400">Entrega:</strong> Mínimo de 12 conteúdos mensais com IA, todos estruturados na lógica EMP, revisados e entregues para aprovação.
                </p>
            </div>
        </FadeIn>
    </div>
);

const SlideAplicacao = () => {
    const [activeRow, setActiveRow] = useState<number | null>(null);

    return (
        <div className="flex flex-col max-w-5xl mx-auto h-full px-4 py-16 justify-center gap-8">
            <FadeIn>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">O EMP É o Motor de Tudo</h2>
                <p className="text-gray-500 font-light text-lg">Clique em um contexto para expandir</p>
            </FadeIn>

            <FadeIn delay={0.1}>
                <div className="rounded-3xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-[2fr_3fr_3fr_3fr] bg-gray-900 text-white text-xs font-bold uppercase tracking-widest">
                        <div className="p-4">Contexto</div>
                        <div className="p-4 text-amber-400">E</div>
                        <div className="p-4 text-rose-400">Mas</div>
                        <div className="p-4 text-emerald-400">Por Isso</div>
                    </div>

                    {applicationTable.map((row, i) => (
                        <motion.div
                            key={i}
                            className={`grid grid-cols-[2fr_3fr_3fr_3fr] border-t border-gray-100 cursor-pointer transition-colors ${activeRow === i ? "bg-gray-50" : "bg-white hover:bg-gray-50/60"}`}
                            onClick={() => setActiveRow(activeRow === i ? null : i)}
                        >
                            <div className="p-4 flex items-center gap-3">
                                <span className="text-gray-400">{row.icon}</span>
                                <span className="text-sm font-semibold text-gray-800">{row.context}</span>
                            </div>
                            <div className="p-4 text-sm text-gray-500 font-light">{row.e}</div>
                            <div className="p-4 text-sm text-gray-500 font-light">{row.mas}</div>
                            <div className="p-4 text-sm text-gray-500 font-light">{row.porisso}</div>
                        </motion.div>
                    ))}
                </div>
            </FadeIn>
        </div>
    );
};

const SlideExemplos = () => {
    const [active, setActive] = useState(0);
    const ex = realExamples[active];

    const colorMap: Record<string, { bg: string; border: string; text: string }> = {
        indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
        rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
        emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    };

    return (
        <div className="flex flex-col max-w-5xl mx-auto h-full px-4 py-16 justify-center gap-8">
            <FadeIn>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">Análises EMP na Prática</h2>
                <p className="text-gray-500 font-light text-lg">Exemplos reais de como o EMP é aplicado</p>
            </FadeIn>

            {/* Tabs */}
            <FadeIn delay={0.1}>
                <div className="flex gap-3 flex-wrap">
                    {realExamples.map((e, i) => (
                        <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${active === i ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                        >
                            {e.sector}
                        </button>
                    ))}
                </div>
            </FadeIn>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {[
                        { key: "e", letter: "E", label: "Estado Atual", content: ex.e, bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", accent: "text-amber-600" },
                        { key: "mas", letter: "Mas", label: "O Conflito", content: ex.mas, bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", accent: "text-rose-600" },
                        { key: "porisso", letter: "Por Isso", label: "A Solução", content: ex.porisso, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", accent: "text-emerald-600" },
                    ].map((col) => (
                        <div key={col.key} className={`${col.bg} ${col.border} border-2 rounded-3xl p-8 flex flex-col gap-4`}>
                            <div className={`text-3xl font-black ${col.accent}`}>{col.letter}</div>
                            <p className={`text-xs font-bold uppercase tracking-widest ${col.text}`}>{col.label}</p>
                            <p className="text-gray-700 font-light text-sm leading-relaxed">{col.content}</p>
                        </div>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

/* ─────────────────────────────────────────────
   GALERIA
───────────────────────────────────────────── */

const portfolio = [
    // vídeos do Supabase/portfólio
    { type: 'video', src: 'https://antiplanos.com.br/backend/uploads/1771626122_1771557580_9.mp4', label: 'Clone Estratégico', tag: 'Produção Automatizada', span: 'col-span-2 row-span-2' },
    { type: 'video', src: 'https://antiplanos.com.br/backend/uploads/1771626173_1771557430_10.mp4', label: 'Direção Visual', tag: '', span: 'row-span-2' },
    { type: 'video', src: 'https://antiplano.com.br/uploads/media_699751cc03513.mp4', label: '', tag: '', span: '' },
    { type: 'video', src: 'https://antiplano.com.br/uploads/media_6997511ba1d6f.mp4', label: '', tag: '', span: '' },
    { type: 'video', src: 'https://nthfbwootpzgpsjnerdw.supabase.co/storage/v1/object/sign/digital/03_02.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMDM3Y2M3My1iMWUxLTQwYmQtODVjNS1lNjk1ZGM3ZmU1YzUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkaWdpdGFsLzAzXzAyLm1wNCIsImlhdCI6MTc3MTk3MjgyNCwiZXhwIjoxODAzNTA4ODI0fQ.wtMmZdMg3orz7ymNjm_7PJiuXqBEga27uXk_oz5Btd8', label: 'Criação de Identidade', tag: 'Avatar High-End', span: 'col-span-2 row-span-2' },
    { type: 'video', src: 'https://nthfbwootpzgpsjnerdw.supabase.co/storage/v1/object/sign/digital/freepik_closeup-de-uma-jovem-mulher-com-cabelo-rosa-vibran_kling-25_720p_9-16_24fps_44246.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMDM3Y2M3My1iMWUxLTQwYmQtODVjNS1lNjk1ZGM3ZmU1YzUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkaWdpdGFsL2ZyZWVwaWtfY2xvc2V1cC1kZS11bWEtam92ZW0tbXVsaGVyLWNvbS1jYWJlbG8tcm9zYS12aWJyYW5fa2xpbmctMjVfNzIwcF85LTE2XzI0ZnBzXzQ0MjQ2Lm1wNCIsImlhdCI6MTc3MTk3Mjg0MiwiZXhwIjoxODAzNTA4ODQyfQ.eafiQVfX9Z51RyrugnVrXfyMhg3-tFbe4u82ND2_lGQ', label: '', tag: '', span: 'row-span-2' },
    { type: 'video', src: 'https://nthfbwootpzgpsjnerdw.supabase.co/storage/v1/object/sign/digital/hf_20260120_013820_8ba7202c-f442-4eb5-9b82-dcc2919596a0.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMDM3Y2M3My1iMWUxLTQwYmQtODVjNS1lNjk1ZGM3ZmU1YzUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkaWdpdGFsL2hmXzIwMjYwMTIwXzAxMzgyMF84YmE3MjAyYy1mNDQyLTRlYjUtOWI4Mi1kY2MyOTE5NTk2YTAubXA0IiwiaWF0IjoxNzcxOTcyODUyLCJleHAiOjE4MDM1MDg4NTJ9.ZV77gJE1dHX_wpSSRl-guYblC-y31gzE3GOw8A1Yiho', label: '', tag: '', span: 'row-span-2' },
];

const SlideGaleria = () => (
    <div className="flex flex-col max-w-7xl mx-auto h-full px-4 py-16 justify-center gap-8">
        <FadeIn>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">O Que Já Construímos</h2>
            <p className="text-gray-500 font-light text-lg">Estratégia e IA materializada na prática. O EMP em execução.</p>
        </FadeIn>

        <FadeIn delay={0.15}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 auto-rows-[130px] md:auto-rows-[220px]">
                {portfolio.map((item, i) => (
                    <div
                        key={i}
                        className={`${item.span || ''} relative rounded-2xl overflow-hidden group cursor-pointer bg-gray-900 border border-gray-800`}
                    >
                        <video
                            src={item.src}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                        {(item.label || item.tag) && (
                            <div className="absolute bottom-4 left-4 z-10">
                                {item.tag && <p className="text-emerald-400 text-xs font-semibold mb-1">{item.tag}</p>}
                                {item.label && <p className="text-white font-bold text-sm md:text-lg">{item.label}</p>}
                            </div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/30 backdrop-blur p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-3 h-3 text-white" />
                        </div>
                    </div>
                ))}
            </div>
        </FadeIn>

        <FadeIn delay={0.3}>
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 font-light uppercase tracking-widest">Anti Copy Club — Portfólio de Produção com IA</p>
                <a
                    href="https://www.instagram.com/anticopyclub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest"
                >
                    Ver mais no Instagram →
                </a>
            </div>
        </FadeIn>
    </div>
);

const SlideDiagnostico = () => {
    const [showAfter, setShowAfter] = useState(false);

    return (
        <div className="flex flex-col max-w-4xl mx-auto h-full px-4 py-16 justify-center gap-10">
            <FadeIn>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">Diagnóstico de Roteiro</h2>
                <p className="text-gray-500 font-light text-lg">O teste South Park aplicado ao conteúdo</p>
            </FadeIn>

            <FadeIn delay={0.1}>
                <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Checklist de Roteiro</p>
                    <div className="space-y-4">
                        {[
                            { icon: "🟡", text: "O gancho abre com o estado atual do público ou com uma situação reconhecível?", badge: "E" },
                            { icon: "🔴", text: "Existe um conflito, virada ou tensão que faz o espectador querer continuar assistindo?", badge: "Mas" },
                            { icon: "🟢", text: "A resolução é clara, entrega valor e direciona para uma ação?", badge: "Por Isso" },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-gray-100">
                                <span className="text-xl">{item.icon}</span>
                                <p className="text-gray-700 font-medium text-sm flex-1">{item.text}</p>
                                <EMPBadge letter={item.badge} color={item.badge === "E" ? "e" : item.badge === "Mas" ? "mas" : "porisso"} />
                            </div>
                        ))}
                    </div>
                </div>
            </FadeIn>

            <FadeIn delay={0.2}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Veja na prática</p>
                        <button
                            onClick={() => setShowAfter(!showAfter)}
                            className="px-4 py-2 rounded-full text-xs font-bold bg-gray-900 text-white transition-colors"
                        >
                            {showAfter ? "Ver versão ruim" : "Ver versão EMP"}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {!showAfter ? (
                            <motion.div key="before" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 bg-red-50 border border-red-100 rounded-2xl">
                                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-3">❌ Antes — sem EMP</p>
                                <p className="text-gray-600 italic text-sm leading-relaxed">
                                    "Hoje vou falar sobre alimentação saudável. Comer bem é importante. Aqui vão 5 dicas. Dica 1: beba água..."
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div key="after" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">✅ Depois — com EMP</p>
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    "<span className="text-amber-600 font-bold">Você segue dieta há 3 meses e a balança não move.</span>{" "}
                                    <span className="text-rose-600 font-bold">Mas o problema não é sua força de vontade — é que você está comendo na hora errada para o seu metabolismo.</span>{" "}
                                    <span className="text-emerald-600 font-bold">Por isso eu vou te mostrar o protocolo que uso com meus pacientes que perderam até 8kg sem cortar carboidrato.</span>"
                                </p>
                                <p className="text-xs text-gray-400 mt-3 font-light">A diferença entre parar o dedo e ser ignorado.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </FadeIn>
        </div>
    );
};

const SlideChecklist = () => {
    const [checked, setChecked] = useState<Record<string, boolean>>({});

    const toggle = (key: string) => setChecked(prev => ({ ...prev, [key]: !prev[key] }));

    const total = Object.values(checklistItems).flat().length;
    const done = Object.values(checked).filter(Boolean).length;
    const pct = Math.round((done / total) * 100);

    return (
        <div className="flex flex-col max-w-4xl mx-auto h-full px-4 py-16 justify-center gap-8">
            <FadeIn>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900 mb-2">Checklist Final de Entrega</h2>
                <p className="text-gray-500 font-light text-lg">Antes de qualquer entrega ao cliente, toda peça passa por este filtro</p>
            </FadeIn>

            {/* Progress bar */}
            <FadeIn delay={0.1}>
                <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-emerald-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-16 text-right">{done}/{total}</span>
                </div>
            </FadeIn>

            <FadeIn delay={0.2}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(["e", "mas", "porisso"] as const).map((phase) => {
                        const styles = {
                            e: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", label: "Fase E", check: "bg-amber-400" },
                            mas: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", label: "Fase Mas", check: "bg-rose-500" },
                            porisso: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", label: "Fase Por Isso", check: "bg-emerald-500" },
                        }[phase];

                        return (
                            <div key={phase} className={`${styles.bg} ${styles.border} border-2 rounded-3xl p-6 flex flex-col gap-4`}>
                                <p className={`text-xs font-black uppercase tracking-widest ${styles.text}`}>{styles.label}</p>
                                <div className="space-y-3">
                                    {checklistItems[phase].map((item, i) => {
                                        const id = `${phase}-${i}`;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => toggle(id)}
                                                className={`w-full flex gap-3 items-start text-left p-3 rounded-xl transition-colors ${checked[id] ? "bg-white/70" : "bg-white/40 hover:bg-white/60"}`}
                                            >
                                                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border-2 transition-colors ${checked[id] ? `${styles.check} border-transparent` : "border-gray-300 bg-white"}`}>
                                                    {checked[id] && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <p className={`text-xs font-medium leading-relaxed ${checked[id] ? "text-gray-400 line-through" : "text-gray-700"}`}>{item}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </FadeIn>

            {done === total && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4 p-6 bg-emerald-500 text-white rounded-2xl"
                >
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold">Tudo conferido!</p>
                        <p className="text-emerald-100 text-sm font-light">Do diagnóstico à execução. Da técnica à conversão.</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

/* ─────────────────────────────────────────────
   SLIDE REGISTRY
───────────────────────────────────────────── */

const SLIDE_COMPONENTS: React.FC[] = [
    SlideIntro,
    SlideEMPEquation,
    SlideOrigin,
    SlideFaseE,
    SlideFaseMas,
    SlideFasePorIsso,
    SlideAplicacao,
    SlideExemplos,
    SlideGaleria,
    SlideDiagnostico,
    SlideChecklist,
];

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */

const MetodoEMPPage = () => {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const goTo = (idx: number) => {
        if (idx < 0 || idx >= slides.length) return;
        setDirection(idx > current ? 1 : -1);
        setCurrent(idx);
        containerRef.current?.scrollTo({ top: 0 });
    };

    const handleKey = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(current + 1);
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(current - 1);
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [current]);

    const SlideComponent = SLIDE_COMPONENTS[current];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">

            {/* ── NAV ── */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-base font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        Anti Copy Club
                    </Link>

                    {/* Step indicators — desktop */}
                    <div className="hidden md:flex items-center gap-1">
                        {slides.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                title={s.label}
                                className={`h-1.5 rounded-full transition-all duration-300 ${current === i ? "w-8 bg-emerald-500" : "w-2 bg-gray-200 hover:bg-gray-400"}`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {current + 1} / {slides.length}
                        </span>
                        <Link
                            to="/ia-service"
                            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-full transition-colors"
                        >
                            Serviços <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── SLIDE AREA ── */}
            <div ref={containerRef} className="flex-1 pt-16 overflow-hidden relative min-h-screen">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        variants={{
                            enter: (d: number) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
                            center: { opacity: 1, x: 0 },
                            exit: (d: number) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="min-h-[calc(100vh-64px)] flex flex-col"
                    >
                        <SlideComponent />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── BOTTOM NAVIGATION ── */}
            <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    {/* Left — prev */}
                    <button
                        onClick={() => goTo(current - 1)}
                        disabled={current === 0}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        <ArrowLeft className="w-4 h-4" /> Anterior
                    </button>

                    {/* Center — slide name */}
                    <div className="text-center hidden sm:block">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{slides[current].label}</p>
                        {slides[current].phase && <PhaseTag phase={slides[current].phase} />}
                    </div>

                    {/* Right — next */}
                    {current < slides.length - 1 ? (
                        <button
                            onClick={() => goTo(current + 1)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-gray-900 text-white hover:bg-emerald-600 transition-colors"
                        >
                            Próximo <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <Link
                            to="/ia-service"
                            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                        >
                            Conhecer Serviço <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MetodoEMPPage;
