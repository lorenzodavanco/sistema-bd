package com.example.sistemabd.service;

import com.example.sistemabd.dao.DesignacaoDAO;
import com.example.sistemabd.exception.ResourceNotFoundException;
import com.example.sistemabd.model.Designacao;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Designar avaliadores e avaliados em uma avaliação (RF4).
 */
@Service
public class DesignacaoService {

    private final DesignacaoDAO designacaoDAO;

    public DesignacaoService(DesignacaoDAO designacaoDAO) {
        this.designacaoDAO = designacaoDAO;
    }

    public List<Designacao> listarTodas() {
        return designacaoDAO.findAll();
    }

    public Designacao buscarPorId(Integer id) {
        return designacaoDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designação com id " + id + " não encontrada."));
    }

    public List<Designacao> listarPorAvaliacao(Integer idAvaliacao) {
        return designacaoDAO.findByAvaliacaoId(idAvaliacao);
    }

    public List<Designacao> listarPorAvaliador(Integer idAvaliador) {
        return designacaoDAO.findByAvaliadorId(idAvaliador);
    }

    public List<Designacao> listarPorAvaliado(Integer idAvaliado) {
        return designacaoDAO.findByAvaliadoId(idAvaliado);
    }

    public Designacao criar(Designacao designacao) {
        return designacaoDAO.save(designacao);
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        designacaoDAO.deleteById(id);
    }
}
