package com.example.sistemabd.controller;

import com.example.sistemabd.dto.ComposicaoDTO;
import com.example.sistemabd.model.Avaliacao;
import com.example.sistemabd.model.Composicao;
import com.example.sistemabd.service.AvaliacaoService;
import com.example.sistemabd.service.ComposicaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes")
@CrossOrigin(origins = "*")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;
    private final ComposicaoService composicaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService, ComposicaoService composicaoService) {
        this.avaliacaoService = avaliacaoService;
        this.composicaoService = composicaoService;
    }

    // CRUD Avaliação

    @GetMapping
    public List<Avaliacao> listarTodas() {
        return avaliacaoService.listarTodas();
    }

    @GetMapping("/{id}")
    public Avaliacao buscarPorId(@PathVariable Integer id) {
        return avaliacaoService.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Avaliacao> criar(@RequestBody Avaliacao avaliacao) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avaliacaoService.criar(avaliacao));
    }

    @PutMapping("/{id}")
    public Avaliacao atualizar(@PathVariable Integer id, @RequestBody Avaliacao avaliacao) {
        return avaliacaoService.atualizar(id, avaliacao);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        avaliacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // Montagem da Avaliação com Questões e Pesos

    @GetMapping("/{id}/questoes")
    public List<Composicao> listarQuestoes(@PathVariable Integer id) {
        return composicaoService.listarPorAvaliacao(id);
    }

    @PutMapping("/{id}/questoes")
    public ResponseEntity<Void> montarAvaliacao(@PathVariable Integer id, @RequestBody ComposicaoDTO dto) {
        composicaoService.montarAvaliacao(id, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{idAvaliacao}/questoes/{idQuestao}")
    public ResponseEntity<Void> removerQuestao(@PathVariable Integer idAvaliacao, @PathVariable Integer idQuestao) {
        composicaoService.removerQuestao(idAvaliacao, idQuestao);
        return ResponseEntity.noContent().build();
    }
}
