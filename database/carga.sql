-- =============================================================================
-- CARGA DE DADOS DE TESTE (SEEDS) - SISTEMA DE AVALIAÇÃO DE DESEMPENHO 360°
-- BANCO DE DADOS: PostgreSQL
-- =============================================================================

-- 1. USUARIOS (Colaboradores de diferentes níveis e departamentos)
INSERT INTO USUARIO (nome, email, cargo, departamento) VALUES
('Carlos Eduardo Silva', 'carlos.silva@empresa.com', 'Gerente de Engenharia', 'Tecnologia'),
('Ana Paula Souza', 'ana.souza@empresa.com', 'Tech Lead', 'Tecnologia'),
('Lucas Ferreira', 'lucas.ferreira@empresa.com', 'Desenvolvedor Pleno', 'Tecnologia'),
('Beatriz Santos', 'beatriz.santos@empresa.com', 'Product Designer', 'Produto'),
('Mariana Costa', 'mariana.costa@empresa.com', 'Especialista em RH', 'Gente e Gestão');

-- 2. AVALIACOES (Ciclos de Avaliação 360°)
INSERT INTO AVALIACAO (titulo, descricao, data_inicio, data_fim) VALUES
('Avaliação de Desempenho 360° - 2026.1', 'Ciclo semestral para avaliação de competências técnicas, entregas e liderança.', '2026-01-15', '2026-03-31'),
('Avaliação de Desempenho 360° - 2026.2', 'Ciclo do segundo semestre para acompanhamento do PDI.', '2026-07-01', '2026-08-31');

-- 3. QUESTOES (Multipla Escolha e Texto Livre)
INSERT INTO QUESTAO (enunciado, tipo_questao) VALUES
('Como você avalia a capacidade de comunicação e colaboração do avaliado com a equipe?', 'MULTIPLA_ESCOLHA'),
('Qual é o nível de pontualidade e comprometimento do avaliado com os prazos acordados?', 'MULTIPLA_ESCOLHA'),
('Quais são os principais pontos fortes demonstrados pelo avaliado no ciclo?', 'TEXTO_LIVRE'),
('Quais oportunidades de desenvolvimento e melhoria você sugere para o avaliado?', 'TEXTO_LIVRE');

-- 4. ALTERNATIVAS (Entidade Fraca vinculada às questões de múltipla escolha)
-- Alternativas para a Questão 1 (Comunicação e Colaboração)
INSERT INTO ALTERNATIVA (id_questao, id_alternativa, texto) VALUES
(1, 1, 'Insatisfatório: Apresenta ruídos frequentes de comunicação e pouca abertura para colaborar.'),
(1, 2, 'Regular: Comunica o básico, mas necessita de acompanhamento para manter alinhamentos.'),
(1, 3, 'Bom: Comunica-se de forma clara, colabora com os pares e apoia o time.'),
(1, 4, 'Excelente: Comunicação exemplar, proativo na resolução de conflitos e inspira a colaboração.');

-- Alternativas para a Questão 2 (Pontualidade e Comprometimento)
INSERT INTO ALTERNATIVA (id_questao, id_alternativa, texto) VALUES
(2, 1, 'Raramente cumpre prazos e demonstra pouco senso de urgência.'),
(2, 2, 'Cumpre prazos somente mediante cobranças pontuais.'),
(2, 3, 'Geralmente pontual e comprometido com a qualidade das entregas.'),
(2, 4, 'Supera as expectativas com entregas antes do prazo e alto nível técnico.');

-- 5. COMPOSICAO (Vínculo N:M entre Avaliação e Questões)
-- Avaliação 1 (2026.1) possui todas as 4 questões
INSERT INTO COMPOSICAO (id_avaliacao, id_questao) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
-- Avaliação 2 (2026.2) possui questões selecionadas
(2, 1),
(2, 3);

-- 6. DESIGNACAO (Relação Ternária: Avaliação + Avaliador + Avaliado)
-- Simulação da Avaliação 360° no Ciclo 2026.1 (id_avaliacao = 1):
-- 1: Carlos (Gerente) avalia Ana (Tech Lead) -> Gestor avalia Liderado
-- 2: Ana (Tech Lead) avalia Carlos (Gerente) -> Liderado avalia Gestor
-- 3: Ana (Tech Lead) avalia Lucas (Dev Pleno) -> Liderança avalia Desenvolvedor
-- 4: Lucas (Dev Pleno) avalia Ana (Tech Lead) -> Par/Liderado avalia Liderança
-- 5: Beatriz (Product Designer) avalia Ana (Tech Lead) -> Avaliação interdepartamental entre pares
INSERT INTO DESIGNACAO (id_avaliacao, id_avaliador, id_avaliado) VALUES
(1, 1, 2),
(1, 2, 1),
(1, 2, 3),
(1, 3, 2),
(1, 4, 2);

-- 7. RESPOSTAS (Respostas registradas para cada Pacote de Resposta / Designação)

-- Designação 1: Carlos (Gerente) avaliando Ana (Tech Lead)
INSERT INTO RESPOSTA (id_designacao, id_questao, valor_resposta) VALUES
(1, 1, '4'),
(1, 2, '4'),
(1, 3, 'Liderança técnica impecável, grande capacidade de tomada de decisão e facilidade em apoiar os desenvolvedores mais jovens.'),
(1, 4, 'Pode aprimorar a delegação de tarefas operacionais para se dedicar mais ao roadmap arquitetural de longo prazo.');

-- Designação 2: Ana (Tech Lead) avaliando Carlos (Gerente)
INSERT INTO RESPOSTA (id_designacao, id_questao, valor_resposta) VALUES
(2, 1, '3'),
(2, 2, '3'),
(2, 3, 'Excelente clareza nos objetivos corporativos e ótimo suporte para manter o time focado sem distrações externas.'),
(2, 4, 'Aumentar a regularidade das conversas 1-on-1 para acompanhamento de carreira da equipe técnica.');

-- Designação 3: Ana (Tech Lead) avaliando Lucas (Dev Pleno)
INSERT INTO RESPOSTA (id_designacao, id_questao, valor_resposta) VALUES
(3, 1, '3'),
(3, 2, '4'),
(3, 3, 'Evolução técnica expressiva no último semestre, autonomia em tarefas complexas e pontualidade exemplar.'),
(3, 4, 'Buscar participar mais ativamente dos refinamentos técnicos propondo soluções de arquitetura.');

-- Designação 4: Lucas (Dev Pleno) avaliando Ana (Tech Lead)
INSERT INTO RESPOSTA (id_designacao, id_questao, valor_resposta) VALUES
(4, 1, '4'),
(4, 2, '4'),
(4, 3, 'Sempre disponível para code review construtivo, paciente para mentorar e referência em boas práticas de engenharia.'),
(4, 4, 'Nenhum ponto crítico, continuar mantendo esse nível de engajamento com o time.');

-- Designação 5: Beatriz (Product Designer) avaliando Ana (Tech Lead)
INSERT INTO RESPOSTA (id_designacao, id_questao, valor_resposta) VALUES
(5, 1, '4'),
(5, 2, '3'),
(5, 3, 'Ótima parceria entre Engenharia e Produto/Design, sempre aberta a encontrar o melhor equilíbrio entre UX e viabilidade.'),
(5, 4, 'Envolver o time de desenvolvimento ainda na etapa de wireframes de baixa fidelidade para acelerar as validações.');
