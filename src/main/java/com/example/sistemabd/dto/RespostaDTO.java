package com.example.sistemabd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para registrar as respostas de uma designação (RF5).
 * O avaliador envia todas as respostas de uma vez.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespostaDTO {
    private List<RespostaItem> respostas;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RespostaItem {
        private Integer idQuestao;
        private String valorResposta;
    }
}
