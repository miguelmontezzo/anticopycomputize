export type ApprovalStatus = 'pendente' | 'aprovado' | 'reprovado';

export type CalendarPost = {
  date: string;
  dayLabel: string;
  title: string;
  format: string;
  pillar: string;
  theme: string;
  objective: string;
  caption: string;
  stories: string[];
};

export const computoWeekLabel = '02/03 a 08/03/2026';

export const computoCalendarPosts: CalendarPost[] = [
  {
    date: '2026-03-03',
    dayLabel: 'Terça-feira',
    title: 'Post 1 — O Ataque Histórico',
    format: 'Reels',
    pillar: 'Autoridade Técnica',
    theme: 'Resiliência em cenário de ataque DDoS',
    objective:
      'Mostrar autoridade técnica da Computize e preparar o terreno para a AGC 2026.',
    caption:
      'Enquanto o Brasil balançava, a gente segurou. Na semana passada registramos um dos maiores volumes de ataque DDoS da nossa história. Nossa estrutura absorveu tudo — sem queda, sem latência, sem susto. Em maio, na AGC 2026, vamos apresentar ao vivo o servidor físico por trás disso.',
    stories: [
      'Story 1: Print do Reels com seta + “Você viu o que publicamos hoje?”',
      'Story 2: “A rede nacional balançou. A Computize segurou.”',
      'Story 3: Teaser AGC 2026 + “Em maio mostramos ao vivo como essa estrutura funciona.”',
    ],
  },
  {
    date: '2026-03-05',
    dayLabel: 'Quinta-feira',
    title: 'Post 2 — A Morte do Ticket',
    format: 'Carrossel',
    pillar: 'Humanização + Dor do Mercado',
    theme: 'Suporte em momentos críticos',
    objective:
      'Conectar com a dor real do provedor durante incidentes e posicionar o suporte da Computize como diferencial.',
    caption:
      'Você já abriu ticket no meio de um ataque DDoS e ficou esperando? A gente sabe o que isso custa. Em cancelamentos, em estresse, em reputação. Na Computize, a gente não pede ticket. A gente já está agindo.',
    stories: [
      'Story 1: Print do carrossel + “Publicamos algo hoje que vai fazer sentido pra você.”',
      'Story 2: “Ticket aberto no meio do ataque. Esse é o padrão do mercado. Não o nosso.”',
      'Story 3: CTA humano + “Quer entender como nosso suporte funciona na prática? Direct aberto.”',
    ],
  },
  {
    date: '2026-03-07',
    dayLabel: 'Sábado',
    title: 'Post 3 — Algo está chegando em maio',
    format: 'Post Estático',
    pillar: 'Semente AGC 2026',
    theme: 'Antecipação de novidade',
    objective:
      'Criar curiosidade e expectativa para o lançamento na AGC 2026, sem revelar tudo.',
    caption:
      'Em maio a Computize estará na AGC 2026 — o maior evento de provedores de internet da América Latina. Não vamos só marcar presença. Vamos apresentar algo que muda a forma como provedores lidam com mitigação DDoS dentro da própria estrutura. Detalhes em breve.',
    stories: [
      'Story 1: Print do post + “Você viu o que publicamos hoje no feed?”',
      'Story 2: “Maio está chegando. E a gente vai levar algo físico pra AGC que o mercado ainda não viu.”',
      'Story 3: “Se você for à AGC 2026, vai querer passar no nosso estande.”',
    ],
  },
];
