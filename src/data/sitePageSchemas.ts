export type FieldType = 'text' | 'textarea' | 'url' | 'repeater';

export interface FieldSchema {
  label: string;
  type: FieldType;
  placeholder?: string;
}

export interface SectionSchema {
  label: string;
  fields: Record<string, FieldSchema>;
}

export interface PageSchema {
  label: string;
  sections: Record<string, SectionSchema>;
}

export const sitePageSchemas: Record<string, PageSchema> = {
  computize: {
    label: 'Computize — Landing Page',
    sections: {
      hero: {
        label: 'Hero',
        fields: {
          heading_line1: { label: 'Linha 1 do título', type: 'text', placeholder: 'Sua tecnologia' },
          heading_line2: { label: 'Linha 2 do título', type: 'text', placeholder: 'protege centenas' },
          heading_line3: { label: 'Linha 3 (itálico)', type: 'text', placeholder: 'de empresas todos os dias.' },
          heading_line4: { label: 'Linha 4 (itálico)', type: 'text', placeholder: 'O mercado ainda não sabe disso.' },
          subtext: { label: 'Subtexto', type: 'textarea', placeholder: 'Analisamos sua presença digital...' },
          cta_label: { label: 'Label do CTA', type: 'text', placeholder: 'Ver a Análise' },
          cta_href: { label: 'Destino do CTA (href)', type: 'text', placeholder: '#analise' },
        },
      },
      numbers: {
        label: 'Números do Mercado',
        fields: {
          stat1_value: { label: 'Dado 1 — Número', type: 'text', placeholder: '90%' },
          stat1_desc: { label: 'Dado 1 — Descrição', type: 'textarea' },
          stat2_value: { label: 'Dado 2 — Número', type: 'text', placeholder: '67%' },
          stat2_desc: { label: 'Dado 2 — Descrição', type: 'textarea' },
          stat3_value: { label: 'Dado 3 — Número', type: 'text', placeholder: '478%' },
          stat3_desc: { label: 'Dado 3 — Descrição', type: 'textarea' },
          quote: { label: 'Citação em destaque', type: 'textarea' },
        },
      },
      analysis: {
        label: 'Análise (O que encontramos)',
        fields: {
          site_text: { label: 'SITE — texto', type: 'textarea' },
          instagram_text: { label: 'INSTAGRAM — texto', type: 'textarea' },
          linkedin_text: { label: 'LINKEDIN — texto', type: 'textarea' },
        },
      },
      expert: {
        label: 'O Expert',
        fields: {
          title: { label: 'Título', type: 'text', placeholder: 'Apresentamos o Expert da Computize.' },
          description: { label: 'Descrição', type: 'textarea' },
          video_url: { label: 'URL do vídeo (YouTube)', type: 'url', placeholder: 'https://www.youtube.com/watch?v=...' },
        },
      },
      plan: {
        label: 'O Plano (O que vamos construir)',
        fields: {
          site_desc: { label: 'Site — descrição', type: 'textarea' },
          instagram_desc: { label: 'Instagram — descrição', type: 'textarea' },
          linkedin_desc: { label: 'LinkedIn — descrição', type: 'textarea' },
          identity_desc: { label: 'Identidade Visual — descrição', type: 'textarea' },
        },
      },
      cta: {
        label: 'CTA Final',
        fields: {
          heading: { label: 'Título do CTA', type: 'textarea' },
          whatsapp_url: { label: 'Link WhatsApp', type: 'url' },
          whatsapp_label: { label: 'Label do botão', type: 'text', placeholder: 'Vamos para o briefing →' },
        },
      },
    },
  },
  'ia-service': {
    label: 'IA Service',
    sections: {
      hero: {
        label: 'Hero',
        fields: {
          title: { label: 'Título', type: 'text' },
          subtitle: { label: 'Subtítulo', type: 'textarea' },
          cta_label: { label: 'Label CTA', type: 'text' },
        },
      },
      features: {
        label: 'Funcionalidades',
        fields: {
          feature1_title: { label: 'Feature 1 — Título', type: 'text' },
          feature1_desc: { label: 'Feature 1 — Descrição', type: 'textarea' },
          feature2_title: { label: 'Feature 2 — Título', type: 'text' },
          feature2_desc: { label: 'Feature 2 — Descrição', type: 'textarea' },
          feature3_title: { label: 'Feature 3 — Título', type: 'text' },
          feature3_desc: { label: 'Feature 3 — Descrição', type: 'textarea' },
        },
      },
    },
  },
  'metodo-emp': {
    label: 'Método EMP',
    sections: {
      hero: {
        label: 'Hero',
        fields: {
          title: { label: 'Título', type: 'text' },
          subtitle: { label: 'Subtítulo', type: 'textarea' },
        },
      },
      phases: {
        label: 'Fases E/M/P',
        fields: {
          e_title: { label: 'Fase E — Título', type: 'text' },
          e_desc: { label: 'Fase E — Descrição', type: 'textarea' },
          m_title: { label: 'Fase M — Título', type: 'text' },
          m_desc: { label: 'Fase M — Descrição', type: 'textarea' },
          p_title: { label: 'Fase P — Título', type: 'text' },
          p_desc: { label: 'Fase P — Descrição', type: 'textarea' },
        },
      },
    },
  },
};
