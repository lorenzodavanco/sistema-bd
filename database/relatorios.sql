-- Consultas dos relatórios (RF7)
--
-- Recursos da seção 5 do enunciado usados nas consultas:
--   1. Junção interna (JOIN)
--   2. Junção externa (LEFT JOIN)
--   3. Agregação e agrupamento (COUNT, AVG, SUM, GROUP BY, HAVING)
--   4. Subconsulta
--   5. Ordenação e ranking (ORDER BY, RANK() e FETCH FIRST)
--   6. Filtros diversos (WHERE com datas e faixas no R3, IN no R4, ILIKE no R5)

-- RELATÓRIO 1: Resultado Consolidado por Avaliado (Média Ponderada 360°)
-- Endpoint: GET /api/relatorios/consolidado?idAvaliacao=1&minAvaliadores=1
-- Objetivo:
--   Consolidar a média ponderada final de cada colaborador avaliado no ciclo,
--   respeitando o peso de cada critério na avaliação (RF6). Filtra avaliados que
--   possuem um volume mínimo de avaliadores para conferir validade estatística.
-- Recursos SQL utilizados:
--   - Junção interna (JOIN de 5 tabelas: RESPOSTA, DESIGNACAO, COMPOSICAO, QUESTAO, USUARIO)
--   - Agregação (SUM para soma ponderada, COUNT DISTINCT de avaliadores)
--   - Agrupamento (GROUP BY nos dados cadastrais do avaliado)
--   - Cláusula HAVING (HAVING COUNT(DISTINCT d.id_avaliador) >= :minAvaliadores)
--   - Ordenação (ORDER BY media_ponderada DESC)
SELECT
    u.id_usuario,
    u.nome,
    u.cargo,
    u.departamento,
    ROUND(
        SUM(CAST(r.valor_resposta AS NUMERIC) * c.peso) / SUM(c.peso), 2
    ) AS media_ponderada,
    COUNT(DISTINCT d.id_avaliador) AS total_avaliadores,
    COUNT(r.id_resposta) AS total_respostas_computadas
FROM RESPOSTA r
JOIN DESIGNACAO d ON r.id_designacao = d.id_designacao
JOIN COMPOSICAO c ON c.id_avaliacao = d.id_avaliacao AND c.id_questao = r.id_questao
JOIN QUESTAO q ON q.id_questao = r.id_questao
JOIN USUARIO u ON u.id_usuario = d.id_avaliado
WHERE d.id_avaliacao = :idAvaliacao
  AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
GROUP BY u.id_usuario, u.nome, u.cargo, u.departamento
HAVING COUNT(DISTINCT d.id_avaliador) >= :minAvaliadores
ORDER BY media_ponderada DESC;

-- RELATÓRIO 2: Radar de Competências com Comparativo da Média Geral da Empresa
-- Endpoint: GET /api/relatorios/competencias?idAvaliacao=1&idAvaliado=2
-- Objetivo:
--   Comparar o desempenho de um avaliado específico em cada competência (questão)
--   com a média geral de todos os avaliados da empresa no mesmo ciclo, permitindo
--   alimentar gráficos do tipo radar/teia ou barras sobrepostas.
-- Recursos SQL utilizados:
--   - Junção interna (JOIN)
--   - Agregação (AVG, COUNT)
--   - Agrupamento (GROUP BY)
--   - Subconsulta correlacionada (calcula a média geral de todos os avaliados para a mesma questão)
--   - Ordenação (ORDER BY)
SELECT
    q.id_questao,
    q.enunciado AS competencia,
    c.peso,
    ROUND(AVG(CAST(r.valor_resposta AS NUMERIC)), 2) AS media_avaliado,
    (
        -- Subconsulta: média da mesma questão entre todos os participantes da avaliação
        SELECT ROUND(AVG(CAST(r2.valor_resposta AS NUMERIC)), 2)
        FROM RESPOSTA r2
        JOIN DESIGNACAO d2 ON r2.id_designacao = d2.id_designacao
        WHERE d2.id_avaliacao = d.id_avaliacao
          AND r2.id_questao = q.id_questao
    ) AS media_geral_empresa,
    COUNT(r.id_resposta) AS total_avaliacoes_recebidas
FROM RESPOSTA r
JOIN DESIGNACAO d ON r.id_designacao = d.id_designacao
JOIN COMPOSICAO c ON c.id_avaliacao = d.id_avaliacao AND c.id_questao = r.id_questao
JOIN QUESTAO q ON q.id_questao = r.id_questao
WHERE d.id_avaliacao = :idAvaliacao
  AND d.id_avaliado = :idAvaliado
  AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
GROUP BY q.id_questao, q.enunciado, c.peso, d.id_avaliacao
ORDER BY q.id_questao;

-- RELATÓRIO 3: Evolução Histórica entre Ciclos por Avaliado (com Filtro Temporal)
-- Endpoint: GET /api/relatorios/evolucao?idAvaliado=2&dataInicio=2025-01-01&dataFim=2026-12-31
-- Objetivo:
--   Apresentar a trajetória de desempenho do colaborador ao longo do tempo através
--   dos diferentes ciclos de avaliação 360°, permitindo filtrar por intervalo de datas.
-- Recursos SQL utilizados:
--   - Junção interna (JOIN de 5 tabelas)
--   - Agregação (SUM ponderada, COUNT DISTINCT)
--   - Agrupamento (GROUP BY nos dados da avaliação)
--   - Filtro temporal e faixas de datas (WHERE a.data_inicio >= :dataInicio AND a.data_fim <= :dataFim)
--   - Ordenação cronológica (ORDER BY a.data_inicio ASC)
SELECT
    a.id_avaliacao,
    a.titulo AS ciclo,
    a.data_inicio,
    a.data_fim,
    ROUND(
        SUM(CAST(r.valor_resposta AS NUMERIC) * c.peso) / SUM(c.peso), 2
    ) AS media_ponderada,
    COUNT(DISTINCT d.id_avaliador) AS total_avaliadores
FROM RESPOSTA r
JOIN DESIGNACAO d ON r.id_designacao = d.id_designacao
JOIN COMPOSICAO c ON c.id_avaliacao = d.id_avaliacao AND c.id_questao = r.id_questao
JOIN QUESTAO q ON q.id_questao = r.id_questao
JOIN AVALIACAO a ON a.id_avaliacao = d.id_avaliacao
WHERE d.id_avaliado = :idAvaliado
  AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
  AND a.data_inicio >= COALESCE(:dataInicio, '1900-01-01')
  AND a.data_fim <= COALESCE(:dataFim, '2100-12-31')
GROUP BY a.id_avaliacao, a.titulo, a.data_inicio, a.data_fim
ORDER BY a.data_inicio ASC;

-- RELATÓRIO 4: Pendências de Resposta (Quem Ainda Não Avaliou)
-- Endpoint: GET /api/relatorios/pendencias?idAvaliacao=1&departamentos=Tecnologia&departamentos=RH
-- Objetivo:
--   Identificar avaliadores que possuem designações ativas mas ainda não preencheram
--   suas avaliações, permitindo cobrança preventiva antes do encerramento do prazo.
-- Recursos SQL utilizados:
--   - Junção externa (LEFT JOIN com a tabela RESPOSTA para capturar ausência de dados)
--   - Junção interna (JOIN com AVALIACAO e USUARIO para dados de avaliador e avaliado)
--   - Agrupamento (GROUP BY)
--   - Cláusula HAVING com contagem zero (HAVING COUNT(r.id_resposta) = 0)
--   - Filtro com IN (departamentos do avaliador marcados na tela; opcional:
--     o DAO só acrescenta esta linha quando há departamentos selecionados)
--   - Ordenação (ORDER BY)
SELECT
    d.id_designacao,
    a.titulo AS avaliacao,
    u_avaliador.id_usuario AS id_avaliador,
    u_avaliador.nome AS avaliador_nome,
    u_avaliador.email AS avaliador_email,
    u_avaliador.departamento AS avaliador_departamento,
    u_avaliado.id_usuario AS id_avaliado,
    u_avaliado.nome AS avaliado_nome,
    u_avaliado.cargo AS avaliado_cargo,
    u_avaliado.departamento AS avaliado_departamento
FROM DESIGNACAO d
JOIN AVALIACAO a ON d.id_avaliacao = a.id_avaliacao
JOIN USUARIO u_avaliador ON d.id_avaliador = u_avaliador.id_usuario
JOIN USUARIO u_avaliado ON d.id_avaliado = u_avaliado.id_usuario
LEFT JOIN RESPOSTA r ON d.id_designacao = r.id_designacao
WHERE d.id_avaliacao = :idAvaliacao
  AND u_avaliador.departamento IN ('Tecnologia', 'Produto')
GROUP BY
    d.id_designacao,
    a.titulo,
    u_avaliador.id_usuario,
    u_avaliador.nome,
    u_avaliador.email,
    u_avaliador.departamento,
    u_avaliado.id_usuario,
    u_avaliado.nome,
    u_avaliado.cargo,
    u_avaliado.departamento
HAVING COUNT(r.id_resposta) = 0
ORDER BY u_avaliador.nome ASC, u_avaliado.nome ASC;

-- RELATÓRIO 5: Ranking de Desempenho com Função de Janela e Filtro Textual
-- Endpoint: GET /api/relatorios/ranking?idAvaliacao=1&departamento=Tec&limite=10
-- Objetivo:
--   Gerar o ranking dos colaboradores mais bem avaliados no ciclo (top performers),
--   com suporte a filtro por padrão textual de departamento e limite de registros.
-- Recursos SQL utilizados:
--   - Função de janela e ranking analítico (RANK() OVER (ORDER BY media_ponderada DESC))
--   - Limitação de resultados (FETCH FIRST :limite ROWS ONLY)
--   - Filtro textual com operador LIKE/ILIKE (u.departamento ILIKE :departamento)
--   - Junção interna (JOIN)
--   - Agregação e agrupamento (SUM, COUNT, GROUP BY, HAVING)
SELECT
    RANK() OVER (
        ORDER BY ROUND(SUM(CAST(r.valor_resposta AS NUMERIC) * c.peso) / SUM(c.peso), 2) DESC
    ) AS posicao_ranking,
    u.id_usuario,
    u.nome,
    u.cargo,
    u.departamento,
    ROUND(
        SUM(CAST(r.valor_resposta AS NUMERIC) * c.peso) / SUM(c.peso), 2
    ) AS media_ponderada,
    COUNT(DISTINCT d.id_avaliador) AS total_avaliadores
FROM RESPOSTA r
JOIN DESIGNACAO d ON r.id_designacao = d.id_designacao
JOIN COMPOSICAO c ON c.id_avaliacao = d.id_avaliacao AND c.id_questao = r.id_questao
JOIN QUESTAO q ON q.id_questao = r.id_questao
JOIN USUARIO u ON u.id_usuario = d.id_avaliado
WHERE d.id_avaliacao = :idAvaliacao
  AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
  AND (:departamento IS NULL OR u.departamento ILIKE :departamento)
GROUP BY u.id_usuario, u.nome, u.cargo, u.departamento
HAVING COUNT(DISTINCT d.id_avaliador) >= 1
ORDER BY posicao_ranking ASC
FETCH FIRST :limite ROWS ONLY;
