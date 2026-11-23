package com.example.sistemabd.service;

import com.example.sistemabd.dao.RespostaDAO;
import com.example.sistemabd.dto.RespostaDTO;
import com.example.sistemabd.exception.ResourceNotFoundException;
import com.example.sistemabd.model.Resposta;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Registrar respostas de um avaliador para um avaliado (RF5).
 */
@Service
public class RespostaService {

    private final RespostaDAO respostaDAO;

    public RespostaService(RespostaDAO respostaDAO) {
        this.respostaDAO = respostaDAO;
    }

    public List<Resposta> listarPorDesignacao(Integer idDesignacao) {
        return respostaDAO.findByDesignacaoId(idDesignacao);
    }

    public Resposta buscarPorId(Integer id) {
        return respostaDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resposta com id " + id + " não encontrada."));
    }

    /**
     * Registra todas as respostas de uma designação de uma vez (RF5).
     */
    @Transactional
    public void responder(Integer idDesignacao, RespostaDTO dto) {
        for (RespostaDTO.RespostaItem item : dto.getRespostas()) {
            Resposta resposta = new Resposta(null, idDesignacao, item.getIdQuestao(), item.getValorResposta());
            respostaDAO.save(resposta);
        }
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        respostaDAO.deleteById(id);
    }
}
