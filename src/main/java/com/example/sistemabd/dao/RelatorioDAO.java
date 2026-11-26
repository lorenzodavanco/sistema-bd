package com.example.sistemabd.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Consultas dos relatórios (RF7). O SQL comentado está em database/relatorios.sql.
 */
@Repository
public class RelatorioDAO {

    private final JdbcTemplate jdbcTemplate;

    public RelatorioDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Relatório 1: Resultado consolidado por avaliado (com peso por critério).
     * Recursos: JOIN, SUM, AVG, COUNT DISTINCT, GROUP BY, HAVING, ORDER BY.
     */
    public List<Map<String, Object>> consolidadoPorAvaliado(Integer idAvaliacao, Integer minAvaliadores) {
        int corteAvaliadores = (minAvaliadores != null && minAvaliadores > 0) ? minAvaliadores : 1;
        String sql = """
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
                WHERE d.id_avaliacao = ?
                  AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
                GROUP BY u.id_usuario, u.nome, u.cargo, u.departamento
                HAVING COUNT(DISTINCT d.id_avaliador) >= ?
                ORDER BY media_ponderada DESC
                """;
        return jdbcTemplate.queryForList(sql, idAvaliacao, corteAvaliadores);
    }

    /**
     * Relatório 2: Radar de Competências com Comparativo Geral da Empresa.
     * Recursos: JOIN, AVG, COUNT, GROUP BY, Subconsulta correlacionada, ORDER BY.
     */
    public List<Map<String, Object>> desempenhoPorQuestao(Integer idAvaliacao, Integer idAvaliado) {
        String sql = """
                SELECT
                    q.id_questao,
                    q.enunciado AS competencia,
                    c.peso,
                    ROUND(AVG(CAST(r.valor_resposta AS NUMERIC)), 2) AS media_avaliado,
                    (
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
                WHERE d.id_avaliacao = ?
                  AND d.id_avaliado = ?
                  AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
                GROUP BY q.id_questao, q.enunciado, c.peso, d.id_avaliacao
                ORDER BY q.id_questao
                """;
        return jdbcTemplate.queryForList(sql, idAvaliacao, idAvaliado);
    }

    /**
     * Relatório 3: Evolução Histórica entre Ciclos (com filtro temporal).
     * Recursos: JOIN, SUM, COUNT, GROUP BY, WHERE com faixa de datas, ORDER BY cronológico.
     */
    public List<Map<String, Object>> evolucaoPorCiclo(Integer idAvaliado, LocalDate dataInicio, LocalDate dataFim) {
        StringBuilder sql = new StringBuilder("""
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
                WHERE d.id_avaliado = ?
                  AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
                """);

        List<Object> params = new ArrayList<>();
        params.add(idAvaliado);

        if (dataInicio != null) {
            sql.append(" AND a.data_inicio >= ?");
            params.add(dataInicio);
        }
        if (dataFim != null) {
            sql.append(" AND a.data_fim <= ?");
            params.add(dataFim);
        }

        sql.append(" GROUP BY a.id_avaliacao, a.titulo, a.data_inicio, a.data_fim ORDER BY a.data_inicio ASC");
        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    /**
     * Relatório 4: Pendências de Resposta (Quem ainda não avaliou).
     * Recursos: LEFT JOIN (para identificar ausência de respostas), filtro IN por departamento, GROUP BY, HAVING COUNT=0, ORDER BY.
     */
    public List<Map<String, Object>> pendenciasRespostas(Integer idAvaliacao, List<String> departamentos) {
        List<Object> params = new ArrayList<>();
        params.add(idAvaliacao);

        StringBuilder sql = new StringBuilder("""
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
                WHERE d.id_avaliacao = ?
                """);

        // Filtro IN: departamentos do avaliador escolhidos na tela (opcional)
        List<String> filtro = departamentos == null ? List.of()
                : departamentos.stream().filter(dep -> dep != null && !dep.isBlank()).map(String::trim).toList();
        if (!filtro.isEmpty()) {
            sql.append(" AND u_avaliador.departamento IN (")
               .append(String.join(", ", java.util.Collections.nCopies(filtro.size(), "?")))
               .append(")");
            params.addAll(filtro);
        }

        sql.append("""
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
                ORDER BY u_avaliador.nome ASC, u_avaliado.nome ASC
                """);
        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }

    /**
     * Relatório 5: Ranking de Desempenho com Função de Janela e Filtro Textual.
     * Recursos: RANK() OVER, FETCH FIRST, LIKE/ILIKE, JOIN, GROUP BY, HAVING.
     */
    public List<Map<String, Object>> rankingDesempenho(Integer idAvaliacao, String departamento, Integer limite) {
        int maxLinhas = (limite != null && limite > 0) ? limite : 10;
        List<Object> params = new ArrayList<>();
        params.add(idAvaliacao);

        StringBuilder sql = new StringBuilder("""
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
                WHERE d.id_avaliacao = ?
                  AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
                """);

        if (departamento != null && !departamento.isBlank()) {
            sql.append(" AND u.departamento ILIKE ?");
            params.add("%" + departamento.trim() + "%");
        }

        sql.append("""
                 GROUP BY u.id_usuario, u.nome, u.cargo, u.departamento
                 HAVING COUNT(DISTINCT d.id_avaliador) >= 1
                 ORDER BY posicao_ranking ASC
                 FETCH FIRST ? ROWS ONLY
                """);
        params.add(maxLinhas);

        return jdbcTemplate.queryForList(sql.toString(), params.toArray());
    }
}
