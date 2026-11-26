package com.example.sistemabd.service;

import com.example.sistemabd.dao.RelatorioDAO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Relatórios (RF7). Apenas repassa para o RelatorioDAO.
 */
@Service
public class RelatorioService {

    private final RelatorioDAO relatorioDAO;

    public RelatorioService(RelatorioDAO relatorioDAO) {
        this.relatorioDAO = relatorioDAO;
    }

    public List<Map<String, Object>> consolidadoPorAvaliado(Integer idAvaliacao, Integer minAvaliadores) {
        return relatorioDAO.consolidadoPorAvaliado(idAvaliacao, minAvaliadores);
    }

    public List<Map<String, Object>> desempenhoPorQuestao(Integer idAvaliacao, Integer idAvaliado) {
        return relatorioDAO.desempenhoPorQuestao(idAvaliacao, idAvaliado);
    }

    public List<Map<String, Object>> evolucaoPorCiclo(Integer idAvaliado, LocalDate dataInicio, LocalDate dataFim) {
        return relatorioDAO.evolucaoPorCiclo(idAvaliado, dataInicio, dataFim);
    }

    public List<Map<String, Object>> pendenciasRespostas(Integer idAvaliacao, List<String> departamentos) {
        return relatorioDAO.pendenciasRespostas(idAvaliacao, departamentos);
    }

    public List<Map<String, Object>> rankingDesempenho(Integer idAvaliacao, String departamento, Integer limite) {
        return relatorioDAO.rankingDesempenho(idAvaliacao, departamento, limite);
    }
}
