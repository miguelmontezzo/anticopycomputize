-- Criação da tabela para respostas do formulário EMP
-- Você pode executar este SQL no SQL Editor do Supabase

CREATE TABLE emp_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- E: Onde a Computize Está Hoje
    servicos_receita TEXT,
    cliente_ideal TEXT,
    origem_clientes TEXT,
    materiais_comerciais TEXT,
    conteudo_interno_oculto TEXT,
    segmentos_2026 TEXT,
    meta_2026 TEXT,
    necessidade_digital TEXT,
    
    -- M: O Que Trava a Computize Hoje
    prova_social_autorizada TEXT,
    numeros_impacto TEXT,
    historia_mitigacao TEXT,
    objecoes_fechamento TEXT,
    motivo_adiamento TEXT,
    fase_gargalo_comercial TEXT,
    impedimento_conteudo TEXT,
    conteudo_desejado_comercial TEXT,

    -- P: O Que Vamos Construir Juntos
    frase_posicionamento TEXT,
    promessa_central TEXT,
    oferta_abrint TEXT,
    recompensa_estande TEXT,
    meta_reunioes_abrint TEXT,
    clientes_case TEXT,
    historia_forte_mitigacao TEXT,
    aprovador_conteudo TEXT,
    canal_operacional TEXT,
    formato_aprovacao TEXT
);
