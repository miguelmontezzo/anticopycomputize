import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Check,
    Cpu,
    RefreshCw,
    Box,
    Settings,
    Users,
    Target,
    Zap,
    Activity,
    Play,
    Layout,
    Send
} from "lucide-react";
import { FadeIn } from "../components/Shared";

const IAServicePage = () => {
    const [form, setForm] = useState({ nome: '', empresa: '', whatsapp: '' });
    const [enviado, setEnviado] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const msg = encodeURIComponent(
            `Olá Miguel! Gostaria de solicitar um diagnóstico estratégico.%0A%0ANome: ${form.nome}%0AEmpresa: ${form.empresa}%0AWhatsApp: ${form.whatsapp}`
        );
        window.open(`https://wa.me/5534999320196?text=${msg}`, '_blank');
        setEnviado(true);
    };
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">

            {/* HEADER / NAV */}
            <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        Anti Copy AI
                    </Link>

                    <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
                        <a href="#problema" className="hover:text-gray-900 transition-colors">O Problema</a>
                        <a href="#solucao" className="hover:text-gray-900 transition-colors">A Solução</a>
                        <a href="#servicos" className="hover:text-gray-900 transition-colors">Entregáveis</a>
                        <a href="#galeria" className="hover:text-gray-900 transition-colors">Galeria</a>
                        <a href="#funcionamento" className="hover:text-gray-900 transition-colors">Como Funciona</a>
                    </div>

                    <a
                        href="#contato"
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-full transition-colors"
                    >
                        Diagnóstico Estratégico
                    </a>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="pt-32 pb-16 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    {/* Main Hero Image/Card */}
                    <FadeIn>
                        <div className="relative w-full rounded-[2rem] overflow-hidden bg-gray-900 min-h-[70vh] flex flex-col justify-between p-10 md:p-16">
                            {/* Video background */}
                            <div className="absolute inset-0 z-0">
                                <video
                                    src="https://nthfbwootpzgpsjnerdw.supabase.co/storage/v1/object/sign/digital/bf9d9e4c-6774-413f-84f0-903aeab48993_hd.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMDM3Y2M3My1iMWUxLTQwYmQtODVjNS1lNjk1ZGM3ZmU1YzUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkaWdpdGFsL2JmOWQ5ZTRjLTY3NzQtNDEzZi04NGYwLTkwM2FlYWI0ODk5M19oZC5tcDQiLCJpYXQiOjE3NzE5NzM0ODQsImV4cCI6MTgwMzUwOTQ4NH0.T6xwP4oB1dxDnf9LyvJMwe8mnrpM_GG1_je6HeGJwtA"
                                    className="w-full h-full object-cover opacity-50 mix-blend-overlay"
                                    autoPlay loop muted playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
                            </div>

                            <div className="relative z-10 max-w-3xl mt-auto">
                                <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-medium text-white mb-6 uppercase tracking-wider">
                                    ANTI COPY AI
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                                    Gestão Estratégica de Conteúdo com IA
                                </h1>
                                <p className="text-lg md:text-xl text-gray-300 font-light mb-10 max-w-xl leading-relaxed">
                                    Criamos, estruturamos e gerenciamos sua presença digital utilizando inteligência artificial para otimizar tempo e escala de produção.
                                </p>
                                <div className="flex flex-wrap items-center gap-6">
                                    <a
                                        href="#contato"
                                        className="flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-600 transition-colors"
                                    >
                                        Solicitar Diagnóstico <ArrowRight className="w-5 h-5" />
                                    </a>
                                    <div className="text-sm text-gray-400 font-medium whitespace-nowrap">
                                        Não substituímos você.<br />
                                        <span className="text-white">Potencializamos sua presença.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* SECTION - O PROBLEMA / STATEMENT */}
            <section id="problema" className="py-24 px-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:items-center">
                    <FadeIn className="lg:w-1/2">
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
                            Produzir conteúdo <br />
                            <span className="text-gray-400 font-light">exige muito de você.</span>
                        </h2>
                        <p className="text-xl text-gray-500 font-light leading-relaxed mb-8">
                            A maioria das marcas trava na execução, não na estratégia. Para criar conteúdo em escala, atualmente são necessários:
                        </p>

                        <div className="flex flex-wrap gap-4">
                            {[
                                { label: "Tempo" },
                                { label: "Energia" },
                                { label: "Constância" },
                                { label: "Equipe" },
                                { label: "Custo de produção" }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-full text-gray-700 font-medium border border-gray-100">
                                    <div className="w-2 h-2 rounded-full bg-red-400" />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2} className="lg:w-1/2">
                        <div className="bg-emerald-50 p-10 md:p-14 rounded-3xl border border-emerald-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/50 rounded-full blur-3xl -mr-20 -mt-20"></div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-6 relative z-10">A Solução</h3>
                            <p className="text-lg text-gray-700 mb-8 leading-relaxed relative z-10">
                                Na Anti Copy AI, utilizamos IA como <strong>ferramenta de produção e otimização.</strong>
                            </p>

                            <div className="space-y-4 mb-10 relative z-10">
                                <div className="flex gap-4 items-center">
                                    <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                                    <p className="text-gray-600 font-medium">Otimização de tempo</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                                    <p className="text-gray-600 font-medium">Redução de custo operacional</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                                    <p className="text-gray-600 font-medium">Aumento de frequência de conteúdo</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                                    <p className="text-gray-600 font-medium">Estratégia estruturada</p>
                                </div>
                            </div>

                            <div className="border-t border-emerald-200/60 pt-6 relative z-10">
                                <p className="text-xl font-bold text-emerald-800 leading-snug">Você continua sendo a essência.<br /><span className="font-light">Nós aceleramos a execução.</span></p>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* O QUE ENTREGAMOS (SERVIÇOS) */}
            <section id="servicos" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                            O Que Entregamos
                        </h2>
                        <p className="text-xl text-gray-500 font-light">
                            IA é ferramenta. Estratégia é o centro.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Influencer de IA",
                                desc: "Criamos um influenciador digital estratégico para representar sua marca em conteúdos específicos.",
                                obj: "Ampliar sua presença digital com eficiência de produção.",
                                tags: ["Desenvolvimento da persona", "Identidade visual", "Direção criativa", "Produção recorrente de conteúdos com IA", "Gestão editorial", "Planejamento estratégico"],
                                icon: <Cpu className="w-8 h-8 text-indigo-500" />
                            },
                            {
                                title: "Clone Digital",
                                desc: "Criamos conteúdos utilizando sua imagem e voz através de tecnologia de IA, com acompanhamento estratégico.",
                                obj: "Reduzir sua necessidade de gravação constante sem perder identidade.",
                                tags: ["Modelagem visual", "Modelagem de voz", "Direcionamento de roteiro", "Produção otimizada", "Gestão de calendário", "Revisão estratégica"],
                                icon: <RefreshCw className="w-8 h-8 text-emerald-500" />
                            },
                            {
                                title: "Gestão Completa de Conteúdo com IA",
                                desc: "Integramos tudo em uma estrutura corporativa. Estratégia, design e produção entregando consistência sem amadores.",
                                obj: "Organizar e acelerar sua produção digital corporativa.",
                                tags: ["Planejamento editorial", "Criação de roteiros", "Produção visual com IA", "Design profissional", "Otimização de tempo", "Relatórios de performance"],
                                icon: <Box className="w-8 h-8 text-amber-500" />
                            }
                        ].map((service, i) => (
                            <FadeIn key={i} delay={i * 0.1} className="flex">
                                <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col h-full hover:border-emerald-200 transition-colors">
                                    <div className="mb-6">
                                        {service.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                                    <p className="text-gray-500 mb-8 leading-relaxed font-light">
                                        {service.desc}
                                    </p>

                                    <div className="mb-8 flex-grow">
                                        <p className="font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">Inclui:</p>
                                        <ul className="space-y-3">
                                            {service.tags.map((tag, tIndex) => (
                                                <li key={tIndex} className="flex gap-3 text-sm text-gray-600">
                                                    <span className="text-emerald-500 font-bold">•</span>
                                                    {tag}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 mt-auto">
                                        <p className="text-sm font-bold text-gray-900 mb-1">Objetivo principal:</p>
                                        <p className="text-sm text-gray-500 leading-relaxed italic">{service.obj}</p>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>

                    <div className="mt-16 text-center max-w-2xl mx-auto">
                        <p className="text-xl font-light text-gray-500 mb-2">Não vendemos promessa de automação mágica.</p>
                        <p className="text-xl font-bold text-gray-900">Vendemos otimização de tempo e redução de custo operacional.</p>
                    </div>
                </div>
            </section>

            {/* SECTION - GALERIA EXPLORAR INSTAGRAM (NOSSOS TRABALHOS) */}
            <section id="galeria" className="py-24 px-6 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto">
                    <FadeIn>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                                    O que já construímos
                                </h2>
                                <p className="text-gray-400 text-lg font-light">
                                    Nossa estratégia e IA materializada na prática. Explore o nível das nossas entregas.
                                </p>
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        {/* Bento Grid - Estilo Instgram Explore */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-[150px] md:auto-rows-[250px]">

                            {/* Bloco 1: Vídeo maior (Destaque) */}
                            <div className="col-span-2 row-span-2 relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer bg-gray-800 border border-gray-700">
                                <video
                                    src="https://antiplanos.com.br/backend/uploads/1771626122_1771557580_9.mp4"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                    autoPlay loop muted playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-80" />
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur p-2 rounded-full z-10">
                                    <Play className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute bottom-6 left-6 z-10 translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <p className="text-white font-bold md:text-2xl">Clone Estratégico</p>
                                    <p className="text-emerald-400 font-medium text-sm">Produção Automatizada</p>
                                </div>
                            </div>

                            {/* Bloco 2: Vídeo Estendido (Vertical) */}
                            <div className="row-span-2 relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer bg-gray-800 border border-gray-700">
                                <video
                                    src="https://antiplanos.com.br/backend/uploads/1771626173_1771557430_10.mp4"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    autoPlay loop muted playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
                                <div className="absolute bottom-6 left-6 z-10">
                                    <p className="text-white font-bold text-lg">Direção Visual</p>
                                </div>
                            </div>

                            {/* Bloco 3: Vídeo Padrão Menor */}
                            <div className="relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer bg-gray-800 border border-gray-700">
                                <video
                                    src="https://antiplano.com.br/uploads/media_699751cc03513.mp4"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    autoPlay loop muted playsInline
                                />
                                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur p-1.5 rounded-full z-10">
                                    <Play className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            {/* Bloco 4: Vídeo Padrão Menor */}
                            <div className="relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer bg-gray-800 border border-gray-700">
                                <video
                                    src="https://antiplano.com.br/uploads/media_6997511ba1d6f.mp4"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    autoPlay loop muted playsInline
                                />
                                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur p-1.5 rounded-full z-10">
                                    <Play className="w-3 h-3 text-white" />
                                </div>
                            </div>

                            {/* Bloco 5: Vídeo Larga + 2 Linhas */}
                            <div className="col-span-2 row-span-2 relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer bg-gray-800 border border-gray-700">
                                <video
                                    src="https://nthfbwootpzgpsjnerdw.supabase.co/storage/v1/object/sign/digital/03_02.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMDM3Y2M3My1iMWUxLTQwYmQtODVjNS1lNjk1ZGM3ZmU1YzUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkaWdpdGFsLzAzXzAyLm1wNCIsImlhdCI6MTc3MTk3MjgyNCwiZXhwIjoxODAzNTA4ODI0fQ.wtMmZdMg3orz7ymNjm_7PJiuXqBEga27uXk_oz5Btd8"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                                    autoPlay loop muted playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                                <div className="absolute bottom-6 left-6 z-10">
                                    <p className="text-gray-300 font-medium text-sm mb-1">Avatar High-End</p>
                                    <p className="text-white font-bold text-2xl mb-1">Criação de Identidade</p>
                                </div>
                            </div>

                            {/* Bloco 6: Vídeo Vertical */}
                            <div className="row-span-2 relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer bg-gray-800 border border-gray-700">
                                <video
                                    src="https://nthfbwootpzgpsjnerdw.supabase.co/storage/v1/object/sign/digital/freepik_closeup-de-uma-jovem-mulher-com-cabelo-rosa-vibran_kling-25_720p_9-16_24fps_44246.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMDM3Y2M3My1iMWUxLTQwYmQtODVjNS1lNjk1ZGM3ZmU1YzUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkaWdpdGFsL2ZyZWVwaWtfY2xvc2V1cC1kZS11bWEtam92ZW0tbXVsaGVyLWNvbS1jYWJlbG8tcm9zYS12aWJyYW5fa2xpbmctMjVfNzIwcF85LTE2XzI0ZnBzXzQ0MjQ2Lm1wNCIsImlhdCI6MTc3MTk3Mjg0MiwiZXhwIjoxODAzNTA4ODQyfQ.eafiQVfX9Z51RyrugnVrXfyMhg3-tFbe4u82ND2_lGQ"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    autoPlay loop muted playsInline
                                />
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur p-2 rounded-full z-10">
                                    <Play className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            {/* Bloco 7: Vídeo Vertical */}
                            <div className="row-span-2 relative rounded-xl md:rounded-2xl overflow-hidden group cursor-pointer bg-gray-800 border border-gray-700">
                                <video
                                    src="https://nthfbwootpzgpsjnerdw.supabase.co/storage/v1/object/sign/digital/hf_20260120_013820_8ba7202c-f442-4eb5-9b82-dcc2919596a0.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iMDM3Y2M3My1iMWUxLTQwYmQtODVjNS1lNjk1ZGM3ZmU1YzUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkaWdpdGFsL2hmXzIwMjYwMTIwXzAxMzgyMF84YmE3MjAyYy1mNDQyLTRlYjUtOWI4Mi1kY2MyOTE5NTk2YTAubXA0IiwiaWF0IjoxNzcxOTcyODUyLCJleHAiOjE4MDM1MDg4NTJ9.ZV77gJE1dHX_wpSSRl-guYblC-y31gzE3GOw8A1Yiho"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                    autoPlay loop muted playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                            </div>

                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* SECTION - COMO FUNCIONA */}
            <section id="funcionamento" className="py-24 px-6 border-b border-gray-100 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                            Como Funciona
                        </h2>
                        <p className="text-gray-500 text-lg font-light">
                            Um fluxo direto, sem atritos, focado apenas no que importa: posicionamento e escala.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[
                            { num: "01", title: "Diagnóstico estratégico" },
                            { num: "02", title: "Definição de posicionamento" },
                            { num: "03", title: "Construção da estrutura criativa" },
                            { num: "04", title: "Implementação com IA" },
                            { num: "05", title: "Gestão contínua e ajustes" }
                        ].map((step, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="bg-white p-6 rounded-2xl h-full border border-gray-100 relative group hover:bg-emerald-50 hover:border-emerald-100 transition-colors shadow-sm">
                                    <div className="text-4xl font-bold text-gray-200 group-hover:text-emerald-200 mb-6 font-display">
                                        {step.num}
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-emerald-900">{step.title}</h4>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION - PARA QUEM É E NÃO É */}
            <section className="py-24 px-6 border-b border-gray-100">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    <FadeIn>
                        <div className="bg-white p-10 rounded-3xl border border-gray-200 shadow-sm h-full relative overflow-hidden">
                            <h3 className="text-3xl font-bold text-gray-900 mb-8">Para Quem É</h3>
                            <ul className="space-y-6">
                                {[
                                    "Especialistas que querem produzir mais sem gravar diariamente",
                                    "Marcas que desejam constância",
                                    "Empresas que buscam eficiência na criação de conteúdo",
                                    "Criadores que precisam escalar produção sem expandir equipe"
                                ].map((text, i) => (
                                    <li key={i} className="flex gap-4 items-center text-gray-600 font-medium">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        <div className="bg-gray-50 p-10 rounded-3xl border border-gray-200 h-full flex flex-col justify-center">
                            <h3 className="text-3xl font-bold text-gray-900 mb-6">Investimento</h3>
                            <p className="text-gray-500 font-light leading-relaxed mb-6">
                                Cada projeto é único. O investimento é definido a partir do diagnóstico estratégico, onde mapeamos seus objetivos, estrutura atual e o que é necessário para escalar sua presença digital com IA.
                            </p>
                            <a
                                href="#contato"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full font-bold text-sm hover:bg-emerald-600 transition-colors w-fit"
                            >
                                Solicitar diagnóstico <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>
                    </FadeIn>
                </div>
            </section>

            {/* SECTION - DIAGNÓSTICO */}
            <section id="contato" className="py-24 px-6 bg-gray-50 border-t border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <FadeIn>
                        <div className="text-center mb-16">
                            <div className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-widest mb-6">
                                Diagnóstico gratuito
                            </div>
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
                                Vamos entender o seu negócio<br /><span className="text-gray-400 font-light">antes de propor qualquer coisa.</span>
                            </h2>
                            <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">
                                Preencha os dados abaixo e nosso time entra em contato para agendar uma conversa estratégica sem compromisso.
                            </p>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.2}>
                        {enviado ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-12 text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Solicitação enviada!</h3>
                                <p className="text-gray-500 font-light">Abrimos o WhatsApp para você completar a solicitação. Retornaremos em breve.</p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.05)] space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Nome</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Seu nome"
                                            value={form.nome}
                                            onChange={e => setForm(p => ({ ...p, nome: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Empresa / Projeto</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nome da empresa ou marca"
                                            value={form.empresa}
                                            onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">WhatsApp</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="(XX) 9XXXX-XXXX"
                                        value={form.whatsapp}
                                        onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors text-base"
                                >
                                    Solicitar Diagnóstico Estratégico <Send className="w-4 h-4" />
                                </button>
                                <p className="text-center text-xs text-gray-400 font-light">Sem compromisso. Sem spam. Apenas uma conversa estratégica.</p>
                            </form>
                        )}
                    </FadeIn>
                </div>
            </section>

            {/* FOOTER BOTTOM */}
            <footer className="py-8 px-6 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold tracking-widest uppercase text-gray-400">
                    <div className="text-gray-900">Anti Copy AI</div>
                    <div>Gestão Estratégica de Conteúdo com IA</div>
                    <div>Todos os direitos reservados</div>
                </div>
            </footer>

        </div>
    );
};

export default IAServicePage;
