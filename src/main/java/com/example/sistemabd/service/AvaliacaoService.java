package com.example.sistemabd.service;

import com.example.sistemabd.dao.AvaliacaoDAO;
import com.example.sistemabd.exception.BadRequestException;
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
        validarDatas(avaliacao);
        return avaliacaoDAO.save(avaliacao);
    }

    public Avaliacao atualizar(Integer id, Avaliacao avaliacao) {
        buscarPorId(id);
        validarDatas(avaliacao);
        avaliacao.setIdAvaliacao(id);
        avaliacaoDAO.update(avaliacao);
        return avaliacao;
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        avaliacaoDAO.deleteById(id);
    }

    /** Mesma regra do CHECK (data_fim >= data_inicio) da tabela AVALIACAO. */
    private void validarDatas(Avaliacao avaliacao) {
        if (avaliacao.getDataInicio() == null || avaliacao.getDataFim() == null) {
            throw new BadRequestException("Data de início e data de fim são obrigatórias.");
        }
        if (avaliacao.getDataFim().isBefore(avaliacao.getDataInicio())) {
            throw new BadRequestException("A data de fim não pode ser anterior à data de início.");
        }
    }
}
