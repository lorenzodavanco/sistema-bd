package com.example.sistemabd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para criação/atualização de questão (RF1).
 * Inclui as alternativas embutidas quando o tipo é MULTIPLA_ESCOLHA.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestaoDTO {
    private String enunciado;
    private String tipoQuestao; // MULTIPLA_ESCOLHA ou TEXTO_LIVRE
    private List<AlternativaDTO> alternativas; // obrigatório se tipoQuestao = MULTIPLA_ESCOLHA

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlternativaDTO {
        private Integer idAlternativa;
        private String texto;
    }
}
