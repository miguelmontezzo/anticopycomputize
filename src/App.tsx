/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  Globe,
  Instagram,
  Linkedin,
  Palette,
  Play,
  BookOpen,
  Trophy,
  Shield,
  MessageCircle
} from "lucide-react";

import { FadeIn, VideoPlayer } from "./components/Shared";
import IAServicePage from "./pages/IAServicePage";
import EmpPage from "./pages/EmpPage";

const ComputizePage = () => {

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] glow-purple opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] glow-cyan opacity-50" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-8 flex justify-between items-center mix-blend-difference">
        <Link to="/" className="text-xs font-bold tracking-[0.2em] uppercase hover:text-accent-cyan transition-colors">
          Anti Copy Club
        </Link>
        <div className="hidden md:flex gap-8 text-[10px] font-medium tracking-widest uppercase text-muted">
          <a href="#analise" className="hover:text-white transition-colors">Análise</a>
          <a href="#solucao" className="hover:text-white transition-colors">Solução</a>
          <a href="#expert" className="hover:text-white transition-colors">Expert IA</a>
          <a href="#investimento" className="hover:text-white transition-colors">Investimento</a>
          <a href="#briefing" className="hover:text-white transition-colors">Briefing</a>
        </div>
      </nav>

      {/* SECTION 1 — HERO */}
      <section className="relative h-screen flex flex-col justify-center px-6 md:px-24 z-10">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="https://i.ibb.co/ZRC3KPrc/freepik-imagine-prompt-an-abstract-ultraminimalist-visuali-87174.png"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-20 md:opacity-30 mix-blend-overlay"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/80 via-transparent to-bg-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[80%] h-[80%] glow-mixed opacity-40" />
          </div>
        </div>

        <div className="max-w-5xl relative z-10">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tighter mb-8">
              <span className="block text-white">Sua tecnologia</span>
              <span className="block text-white">protege centenas</span>
              <span className="block text-muted font-light italic">de empresas todos os dias.</span>
              <span className="block text-muted font-light italic">O mercado ainda não sabe disso.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-muted max-w-xl mb-10 font-light">
              Analisamos sua presença digital e chegamos com um plano para mudar isso.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <a
              href="#analise"
              className="inline-flex items-center gap-3 px-8 py-4 border border-white rounded-full text-sm font-medium hover:bg-white hover:text-black transition-all duration-500 group"
            >
              Ver a Análise
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </FadeIn>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
          <span className="text-[10px] tracking-[0.3em] text-muted uppercase">Scroll Now</span>
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center animate-bounce">
            <ArrowDown className="w-4 h-4 text-muted" />
          </div>
        </div>
      </section>

      {/* SECTION 2 — MARKET NUMBERS */}
      <section className="py-32 px-6 md:px-24 bg-bg-secondary relative z-10">
        <FadeIn>
          <div className="text-[10px] tracking-[0.3em] text-muted uppercase mb-20">O MERCADO</div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-24">
          {[
            { val: "90%", desc: "dos compradores B2B pesquisam online antes do primeiro contato" },
            { val: "67%", desc: "mais leads qualificados com estratégia de conteúdo ativa" },
            { val: "478%", desc: "é o ROI médio do marketing de conteúdo no segmento B2B" }
          ].map((stat, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="flex flex-col gap-4">
                <div className="text-7xl md:text-8xl font-bold tracking-tighter">{stat.val}</div>
                <p className="text-muted text-sm leading-relaxed max-w-[240px]">{stat.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.4}>
          <p className="text-2xl md:text-4xl text-muted italic font-light leading-tight max-w-4xl">
            "O decisor que vai contratar a Computize já formou uma opinião sobre vocês antes de atender o telefone."
          </p>
        </FadeIn>
      </section>

      {/* SECTION 3 — ANALYSIS */}
      <section id="analise" className="py-32 px-6 md:px-24 relative z-10">
        <FadeIn>
          <div className="text-[10px] tracking-[0.3em] text-muted uppercase mb-20">O QUE ENCONTRAMOS</div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "SITE", text: "A proposta de valor não está clara para quem decide. Sem prova social. Sem funil. O site não está convertendo." },
            { title: "INSTAGRAM", text: "O conteúdo informa mas não conecta. Sem rosto, sem história, sem Reels. O potencial está represado." },
            { title: "LINKEDIN", text: "O perfil existe. A estratégia não. O canal onde o contrato B2B é fechado está em silêncio." }
          ].map((card, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="glass-card p-10 h-full flex flex-col gap-6 group hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                  <span className="text-xs font-bold tracking-widest">{card.title}</span>
                </div>
                <p className="text-muted leading-relaxed font-light">{card.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* SECTION 4 — COMPETITIVE CONTEXT */}
      <section className="py-48 px-6 md:px-24 bg-bg-primary relative overflow-hidden z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full glow-purple opacity-30 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-12">
              Os concorrentes já estão nessa conversa.
            </h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-muted font-light leading-relaxed mb-16">
              Os players mais fortes do mercado já constroem autoridade nas redes sociais toda semana. Eles educam o mercado antes de vender. São lembrados antes do primeiro contato comercial.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="bg-white/[0.02] border-l-2 border-accent-cyan p-10 text-left">
              <p className="text-xl md:text-2xl font-medium">
                A Computize tem um produto superior. Mas ainda não está nessa conversa.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 5 — THE EXPERT */}
      <section id="expert" className="py-32 px-6 md:px-24 relative z-10 overflow-hidden">
        {/* Background Video with 20% opacity */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <VideoPlayer
            src="https://www.youtube.com/watch?v=zG0nw695qIg"
            className="w-full h-full object-cover grayscale"
            opacity={0.2}
            isBackground={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />
        </div>

        <FadeIn>
          <div className="text-[10px] tracking-[0.3em] text-muted uppercase mb-20 relative z-10">O GRANDE DIFERENCIAL</div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start relative z-10">
          <div className="flex flex-col gap-12">
            <FadeIn>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9]">
                Apresentamos o Expert da Computize.
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-xl text-muted font-light leading-relaxed">
                Um especialista criado com Inteligência Artificial que representa a voz técnica e comercial da Computize — com rosto, voz e autoridade.
              </p>
            </FadeIn>

            <div className="flex flex-col gap-8">
              {[
                { icon: <BookOpen className="w-5 h-5 text-accent-cyan" />, title: "Educação", text: "Desmistifica o serviço para qualquer decisor de negócio" },
                { icon: <Trophy className="w-5 h-5 text-accent-cyan" />, title: "Autoridade", text: "Dados reais que posicionam a Computize como referência nacional" },
                { icon: <Shield className="w-5 h-5 text-accent-cyan" />, title: "Confiança", text: "Casos reais que provam a entrega antes do contato comercial" }
              ].map((item, i) => (
                <FadeIn key={i} delay={0.3 + i * 0.1}>
                  <div className="flex gap-6">
                    <div className="mt-1">{item.icon}</div>
                    <div>
                      <h4 className="font-bold mb-1">{item.title}</h4>
                      <p className="text-muted text-sm font-light">{item.text}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <FadeIn delay={0.5}>
            <div className="glass-card aspect-video relative flex items-center justify-center group overflow-hidden rounded-2xl">
              {/* Expert Video Box */}
              <VideoPlayer
                src="https://www.youtube.com/watch?v=zG0nw695qIg"
                className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-accent-cyan/20 opacity-30 group-hover:opacity-10 transition-opacity pointer-events-none" />

              <div className="absolute bottom-6 left-6 z-10 text-[10px] font-bold tracking-widest uppercase opacity-80 flex items-center gap-2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                Expert — Computize Network
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 6 — THE PLAN */}
      <section id="solucao" className="py-32 px-6 md:px-24 bg-bg-secondary relative z-10">
        <FadeIn>
          <div className="text-[10px] tracking-[0.3em] text-muted uppercase mb-20">O QUE VAMOS CONSTRUIR</div>
        </FadeIn>

        <div className="flex flex-col border-t border-white/10">
          {[
            { icon: <Globe className="w-6 h-6" />, title: "Site", desc: "Auditoria e plano de melhorias de comunicação para o site começar a converter." },
            { icon: <Instagram className="w-6 h-6" />, title: "Instagram", desc: "Nova identidade visual, nova estratégia e conteúdo semanal que conecta com quem decide." },
            { icon: <Linkedin className="w-6 h-6" />, title: "LinkedIn", desc: "Perfil reestruturado e rotina de conteúdo que posiciona a Computize como referência B2B." },
            { icon: <Palette className="w-6 h-6" />, title: "Identidade Visual", desc: "Padrão visual consistente e premium em todos os canais digitais." }
          ].map((item, i) => (
            <FadeIn key={i}>
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_2fr] items-center py-12 border-bottom border-white/10 group hover:bg-white/[0.02] transition-colors px-4">
                <div className="text-muted group-hover:text-accent-cyan transition-colors mb-4 md:mb-0">{item.icon}</div>
                <div className="text-xl font-bold mb-2 md:mb-0">{item.title}</div>
                <div className="text-muted font-light">{item.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* SECTION 7 — ABRINT 2026 */}
      <section className="py-48 px-6 md:px-24 relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-1/2 h-full glow-cyan opacity-20 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-4xl">
            <FadeIn>
              <div className="inline-block px-4 py-1 border border-accent-cyan/30 rounded-full text-[10px] font-bold tracking-widest uppercase text-accent-cyan mb-8">
                Maio de 2026 — São Paulo
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-12 leading-[1.1]">
                O maior evento de provedores do Brasil está chegando.
              </h2>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-xl text-muted font-light leading-relaxed mb-12 max-w-3xl">
                O Abrint Global Congress reúne os decisores do setor. Criamos uma campanha estratégica para a Computize chegar lá como a marca que o mercado já conhece.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-xl italic text-muted font-light">
                "Cada semana que passa é uma semana de vantagem que os concorrentes ganham."
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.5}>
            <div className="glass-card p-4 rounded-2xl overflow-hidden group">
              <img
                src="https://i.ibb.co/xKH32Ddj/freepik-carregue-trs-ativos-no-espao-de-trabalho-uma-foto-28406.png"
                alt="Abrint Event"
                className="w-full h-full object-cover rounded-xl grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                referrerPolicy="no-referrer"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 8 — INVESTMENT */}
      <section id="investimento" className="py-32 px-6 md:px-24 bg-bg-secondary relative z-10">
        <FadeIn>
          <div className="text-[10px] tracking-[0.3em] text-muted uppercase mb-20">O INVESTIMENTO</div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-end mb-20">
          <FadeIn>
            <div className="glass-card p-12 flex flex-col gap-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Plano Mensal Recorrente</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">R$ 9.000</span>
                    <span className="text-muted text-sm">/mês</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "15 a 20 peças de conteúdo por mês",
                  "Instagram + LinkedIn ativos toda semana",
                  "Vídeos com Expert de IA inclusos",
                  "Identidade visual completa (1º mês)",
                  "Consultoria de site (1º mês)",
                  "Relatório mensal de desempenho"
                ].map((check, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent-cyan/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent-cyan" />
                    </div>
                    <span className="text-sm text-muted font-light">{check}</span>
                  </div>
                ))}
              </div>

              <div className="text-[10px] tracking-widest uppercase text-muted/50">
                Fidelidade mínima: 3 meses
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="glass-card p-10 border-accent-cyan/30 flex flex-col gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="px-3 py-1 bg-accent-cyan text-black text-[8px] font-black tracking-widest uppercase rounded-full">
                  Projeto Único
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-2">Abrint 2026</h3>
                <div className="text-4xl font-bold">+ R$ 3.000</div>
                <p className="text-[10px] text-muted mt-2 font-light">
                  Pagamento gradual até o mês do evento
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  "Planejamento estratégico para o evento",
                  "Campanha de aquecimento pré-Abrint",
                  "Peças específicas para a feira",
                  "Vídeo especial do Expert"
                ].map((check, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-3 h-3 text-accent-cyan" />
                    <span className="text-xs text-muted font-light">{check}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.4}>
          <div className="text-center">
            <div className="text-3xl md:text-5xl font-bold tracking-tighter">
              Total no mês do evento: <span className="text-accent-cyan">R$ 12.000</span>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* SECTION 9 — FINAL CTA */}
      <section id="briefing" className="relative h-screen flex flex-col justify-center items-center text-center px-6 z-10 overflow-hidden">
        <div className="absolute inset-0 glow-mixed opacity-50 rotate-45 pointer-events-none" />

        <div className="max-w-4xl relative z-10">
          <FadeIn>
            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9] mb-12">
              A rede de vocês nunca parou.<br />
              <span className="text-muted font-light italic">A comunicação começa agora.</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-xl text-muted font-light mb-16 max-w-2xl mx-auto">
              Precisamos de 1 hora com vocês para o briefing. Com isso em mãos, a máquina começa a rodar.
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex justify-center">
              <a
                href="https://wa.me/5534999320196?text=Miguel%20achei%20top%20demais%2C%20bora%20j%C3%A1%20pro%20pr%C3%B3ximo%20passo"
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform inline-block"
              >
                Vamos para o briefing →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 md:px-24 border-t border-white/5 relative z-10">
        <div className="flex flex-col md:grid md:grid-cols-3 gap-8 items-center md:items-start text-[10px] font-bold tracking-[0.2em] uppercase text-muted">
          <div className="text-white">Anti Copy Club</div>
          <div className="text-center md:text-left">Fevereiro 2026 — Documento Confidencial para Computize Network</div>
          <div className="text-center md:text-right font-medium text-[8px] tracking-widest">
            Comunicação Potencializada por Inteligência Artificial
          </div>
        </div>
      </footer>
    </div>
  );
};

const HomePage = () => {
  const [clicks, setClicks] = useState(0);
  const isBlue = clicks >= 5;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6 select-none">
      <FadeIn>
        <h1
          onClick={() => setClicks(prev => prev + 1)}
          className={`text-6xl md:text-8xl font-bold tracking-tighter text-center cursor-pointer transition-colors duration-700 ${isBlue ? 'text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'text-white'}`}
        >
          Anti Copy Club
        </h1>
      </FadeIn>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/computize" element={<ComputizePage />} />
        <Route path="/computize/emp" element={<EmpPage />} />
        <Route path="/ia-service" element={<IAServicePage />} />
        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
