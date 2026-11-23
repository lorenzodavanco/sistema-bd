package com.example.sistemabd.service;

import com.example.sistemabd.dao.RelatorioDAO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service para a camada de relatórios (RF7).
 */
@Service
public class RelatorioService {

    private final RelatorioDAO relatorioDAO;

    public RelatorioService(RelatorioDAO relatorioDAO) {
        this.relatorioDAO = relatorioDAO;
    }

    /** Relatório 1 — Resultado consolidado por avaliado (média ponderada 360°). */
    public List<Map<String, Object>> consolidadoPorAvaliado(Integer idAvaliacao, Integer minAvaliadores) {
        return relatorioDAO.consolidadoPorAvaliado(idAvaliacao, minAvaliadores);
    }

    /** Relatório 2 — Radar de competências de um avaliado vs média geral. */
    public List<Map<String, Object>> desempenhoPorQuestao(Integer idAvaliacao, Integer idAvaliado) {
        return relatorioDAO.desempenhoPorQuestao(idAvaliacao, idAvaliado);
    }

    /** Relatório 3 — Evolução entre ciclos de um avaliado (com filtro de datas). */
    public List<Map<String, Object>> evolucaoPorCiclo(Integer idAvaliado, LocalDate dataInicio, LocalDate dataFim) {
        return relatorioDAO.evolucaoPorCiclo(idAvaliado, dataInicio, dataFim);
    }

    /** Relatório 4 — Pendências de resposta (quem ainda não respondeu). */
    public List<Map<String, Object>> pendenciasRespostas(Integer idAvaliacao) {
        return relatorioDAO.pendenciasRespostas(idAvaliacao);
    }

    /** Relatório 5 — Ranking de colaboradores mais bem avaliados (com RANK e filtro textual). */
    public List<Map<String, Object>> rankingDesempenho(Integer idAvaliacao, String departamento, Integer limite) {
        return relatorioDAO.rankingDesempenho(idAvaliacao, departamento, limite);
    }
}
