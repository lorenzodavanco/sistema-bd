package com.example.sistemabd.service;

import com.example.sistemabd.dao.QuestaoDAO;
import com.example.sistemabd.dto.QuestaoDTO;
import com.example.sistemabd.exception.BadRequestException;
import com.example.sistemabd.exception.ResourceNotFoundException;
import com.example.sistemabd.model.Alternativa;
import com.example.sistemabd.model.Questao;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class QuestaoService {

    private final QuestaoDAO questaoDAO;

    public QuestaoService(QuestaoDAO questaoDAO) {
        this.questaoDAO = questaoDAO;
    }

    public List<Questao> listarTodas() {
        return questaoDAO.findAll();
    }

    public Questao buscarPorId(Integer id) {
        return questaoDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Questão com id " + id + " não encontrada."));
    }

    public List<Alternativa> buscarAlternativas(Integer idQuestao) {
        buscarPorId(idQuestao);
        return questaoDAO.findAlternativasByQuestaoId(idQuestao);
    }

    /**
     * Cria questão com alternativas (RF1).
     * Se MULTIPLA_ESCOLHA, exige pelo menos 2 alternativas.
     */
    @Transactional
    public Questao criar(QuestaoDTO dto) {
        validarTipo(dto);

        Questao questao = new Questao(null, dto.getEnunciado(), dto.getTipoQuestao());
        questao = questaoDAO.save(questao);

        if ("MULTIPLA_ESCOLHA".equals(dto.getTipoQuestao()) && dto.getAlternativas() != null) {
            for (QuestaoDTO.AlternativaDTO altDto : dto.getAlternativas()) {
                Alternativa alt = new Alternativa(questao.getIdQuestao(), altDto.getIdAlternativa(), altDto.getTexto());
                questaoDAO.saveAlternativa(alt);
            }
        }

        return questao;
    }

    @Transactional
    public Questao atualizar(Integer id, QuestaoDTO dto) {
        buscarPorId(id);
        validarTipo(dto);

        Questao questao = new Questao(id, dto.getEnunciado(), dto.getTipoQuestao());
        questaoDAO.update(questao);

        // Recria alternativas
        questaoDAO.deleteAlternativasByQuestaoId(id);
        if ("MULTIPLA_ESCOLHA".equals(dto.getTipoQuestao()) && dto.getAlternativas() != null) {
            for (QuestaoDTO.AlternativaDTO altDto : dto.getAlternativas()) {
                Alternativa alt = new Alternativa(id, altDto.getIdAlternativa(), altDto.getTexto());
                questaoDAO.saveAlternativa(alt);
            }
        }

        return questao;
    }

    public void deletar(Integer id) {
        buscarPorId(id);
        questaoDAO.deleteById(id);
    }

    private void validarTipo(QuestaoDTO dto) {
        if (!"MULTIPLA_ESCOLHA".equals(dto.getTipoQuestao()) && !"TEXTO_LIVRE".equals(dto.getTipoQuestao())) {
            throw new BadRequestException("tipoQuestao deve ser MULTIPLA_ESCOLHA ou TEXTO_LIVRE.");
        }
        if ("MULTIPLA_ESCOLHA".equals(dto.getTipoQuestao())) {
            if (dto.getAlternativas() == null || dto.getAlternativas().size() < 2) {
                throw new BadRequestException("Questão de múltipla escolha deve ter pelo menos 2 alternativas.");
            }
        }
    }
}
