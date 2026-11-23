package com.example.sistemabd.controller;

import com.example.sistemabd.dto.RespostaDTO;
import com.example.sistemabd.model.Designacao;
import com.example.sistemabd.model.Resposta;
import com.example.sistemabd.service.DesignacaoService;
import com.example.sistemabd.service.RespostaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designacoes")
@CrossOrigin(origins = "*")
public class DesignacaoController {

    private final DesignacaoService designacaoService;
    private final RespostaService respostaService;

    public DesignacaoController(DesignacaoService designacaoService, RespostaService respostaService) {
        this.designacaoService = designacaoService;
        this.respostaService = respostaService;
    }

    // ===== CRUD Designação (RF4) =====

    @GetMapping
    public List<Designacao> listarTodas() {
        return designacaoService.listarTodas();
    }

    @GetMapping("/{id}")
    public Designacao buscarPorId(@PathVariable Integer id) {
        return designacaoService.buscarPorId(id);
    }

    @GetMapping(params = "idAvaliacao")
    public List<Designacao> listarPorAvaliacao(@RequestParam Integer idAvaliacao) {
        return designacaoService.listarPorAvaliacao(idAvaliacao);
    }

    @GetMapping(params = "idAvaliador")
    public List<Designacao> listarPorAvaliador(@RequestParam Integer idAvaliador) {
        return designacaoService.listarPorAvaliador(idAvaliador);
    }

    @GetMapping(params = "idAvaliado")
    public List<Designacao> listarPorAvaliado(@RequestParam Integer idAvaliado) {
        return designacaoService.listarPorAvaliado(idAvaliado);
    }

    /** Designar um avaliador para avaliar um avaliado em uma avaliação (RF4). */
    @PostMapping
    public ResponseEntity<Designacao> criar(@RequestBody Designacao designacao) {
        return ResponseEntity.status(HttpStatus.CREATED).body(designacaoService.criar(designacao));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        designacaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    // ===== Respostas da Designação (RF5) =====

    @GetMapping("/{id}/respostas")
    public List<Resposta> listarRespostas(@PathVariable Integer id) {
        return respostaService.listarPorDesignacao(id);
    }

    /** Registrar as respostas de uma designação (RF5). */
    @PostMapping("/{id}/respostas")
    public ResponseEntity<Void> responder(@PathVariable Integer id, @RequestBody RespostaDTO dto) {
        respostaService.responder(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
