package com.example.sistemabd.controller;

import com.example.sistemabd.dto.QuestaoDTO;
import com.example.sistemabd.model.Alternativa;
import com.example.sistemabd.model.Questao;
import com.example.sistemabd.service.QuestaoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questoes")
@CrossOrigin(origins = "*")
public class QuestaoController {

    private final QuestaoService questaoService;

    public QuestaoController(QuestaoService questaoService) {
        this.questaoService = questaoService;
    }

    @GetMapping
    public List<Questao> listarTodas() {
        return questaoService.listarTodas();
    }

    @GetMapping("/{id}")
    public Questao buscarPorId(@PathVariable Integer id) {
        return questaoService.buscarPorId(id);
    }

    @GetMapping("/{id}/alternativas")
    public List<Alternativa> listarAlternativas(@PathVariable Integer id) {
        return questaoService.buscarAlternativas(id);
    }

    /** Cadastrar questão com alternativas (RF1). */
    @PostMapping
    public ResponseEntity<Questao> criar(@RequestBody QuestaoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questaoService.criar(dto));
    }

    @PutMapping("/{id}")
    public Questao atualizar(@PathVariable Integer id, @RequestBody QuestaoDTO dto) {
        return questaoService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        questaoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
