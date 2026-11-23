package com.example.sistemabd.service;

import com.example.sistemabd.dao.AvaliacaoDAO;
import com.example.sistemabd.exception.ResourceNotFoundException;
import com.example.sistemabd.model.Avaliacao;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AvaliacaoService {

    private final AvaliacaoDAO avaliacaoDAO;

    public AvaliacaoService(AvaliacaoDAO avaliacaoDAO) {
        this.avaliacaoDAO = avaliacaoDAO;
    }

    public List<Avaliacao> listarTodas() {
        return avaliacaoDAO.findAll();
    }

    public Avaliacao buscarPorId(Integer id) {
        return avaliacaoDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação com id " + id + " não encontrada."));
    }

    public Avaliacao criar(Avaliacao avaliacao) {
        return avaliacaoDAO.save(avaliacao);
    }

    public Avaliacao atualizar(Integer id, Avaliacao avaliacao) {
        buscarPorId(id);
        avaliacao.setIdAvaliacao(id);
        avaliacaoDAO.update(avaliacao);
        return avaliacao;
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        avaliacaoDAO.deleteById(id);
    }
}
