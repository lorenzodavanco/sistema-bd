package com.example.sistemabd.service;

import com.example.sistemabd.dao.ComposicaoDAO;
import com.example.sistemabd.dto.ComposicaoDTO;
import com.example.sistemabd.exception.BadRequestException;
import com.example.sistemabd.model.Composicao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Montar avaliação com questões e pesos (RF3 + RF6).
 */
@Service
public class ComposicaoService {

    private final ComposicaoDAO composicaoDAO;

    public ComposicaoService(ComposicaoDAO composicaoDAO) {
        this.composicaoDAO = composicaoDAO;
    }

    public List<Composicao> listarPorAvaliacao(Integer idAvaliacao) {
        return composicaoDAO.findByAvaliacaoId(idAvaliacao);
    }

    @Transactional
    public void montarAvaliacao(Integer idAvaliacao, ComposicaoDTO dto) {
        // Mesma regra do CHECK (peso > 0) da tabela COMPOSICAO
        for (ComposicaoDTO.QuestaoComPeso qp : dto.getQuestoes()) {
            if (qp.getPeso() == null || qp.getPeso().signum() <= 0) {
                throw new BadRequestException("O peso da questão " + qp.getIdQuestao() + " deve ser maior que zero.");
            }
        }
        // Remove composições anteriores e recria com os novos pesos
        composicaoDAO.deleteByAvaliacaoId(idAvaliacao);
        for (ComposicaoDTO.QuestaoComPeso qp : dto.getQuestoes()) {
            Composicao composicao = new Composicao(idAvaliacao, qp.getIdQuestao(), qp.getPeso());
            composicaoDAO.save(composicao);
        }
    }

    public void removerQuestao(Integer idAvaliacao, Integer idQuestao) {
        composicaoDAO.delete(idAvaliacao, idQuestao);
    }
}
