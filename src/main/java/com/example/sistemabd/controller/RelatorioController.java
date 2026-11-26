package com.example.sistemabd.controller;

import com.example.sistemabd.service.RelatorioService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Endpoints REST dos relatórios obrigatórios (RF7).
 * Retornam dados estruturados em JSON para renderização de tabelas e gráficos.
 */
@RestController
@RequestMapping("/api/relatorios")
@CrossOrigin(origins = "*")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    /**
     * Relatório 1: Resultado consolidado por avaliado.
     * GET /api/relatorios/consolidado?idAvaliacao=1&minAvaliadores=1
     */
    @GetMapping("/consolidado")
    public List<Map<String, Object>> consolidado(
            @RequestParam Integer idAvaliacao,
            @RequestParam(required = false, defaultValue = "1") Integer minAvaliadores) {
        return relatorioService.consolidadoPorAvaliado(idAvaliacao, minAvaliadores);
    }

    /**
     * Relatório 2: Radar de competências com comparativo geral.
     * GET /api/relatorios/competencias?idAvaliacao=1&idAvaliado=2
     */
    @GetMapping("/competencias")
    public List<Map<String, Object>> competencias(
            @RequestParam Integer idAvaliacao,
            @RequestParam Integer idAvaliado) {
        return relatorioService.desempenhoPorQuestao(idAvaliacao, idAvaliado);
    }

    /**
     * Relatório 3: Evolução histórica entre ciclos por avaliado.
     * GET /api/relatorios/evolucao?idAvaliado=2&dataInicio=2025-01-01&dataFim=2026-12-31
     */
    @GetMapping("/evolucao")
    public List<Map<String, Object>> evolucao(
            @RequestParam Integer idAvaliado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return relatorioService.evolucaoPorCiclo(idAvaliado, dataInicio, dataFim);
    }

    /**
     * Relatório 4: Pendências de avaliação (avaliadores que ainda não responderam).
     * GET /api/relatorios/pendencias?idAvaliacao=1&departamentos=Tecnologia&departamentos=RH
     */
    @GetMapping("/pendencias")
    public List<Map<String, Object>> pendencias(
            @RequestParam Integer idAvaliacao,
            @RequestParam(required = false) List<String> departamentos) {
        return relatorioService.pendenciasRespostas(idAvaliacao, departamentos);
    }

    /**
     * Relatório 5: Ranking de colaboradores mais bem avaliados (com janela analítica RANK()).
     * GET /api/relatorios/ranking?idAvaliacao=1&departamento=Tecnologia&limite=10
     */
    @GetMapping("/ranking")
    public List<Map<String, Object>> ranking(
            @RequestParam Integer idAvaliacao,
            @RequestParam(required = false) String departamento,
            @RequestParam(required = false, defaultValue = "10") Integer limite) {
        return relatorioService.rankingDesempenho(idAvaliacao, departamento, limite);
    }
}
