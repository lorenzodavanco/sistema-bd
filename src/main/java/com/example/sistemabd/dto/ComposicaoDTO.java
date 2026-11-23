package com.example.sistemabd.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para montar uma avaliação com questões e pesos (RF3 + RF6).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComposicaoDTO {
    private List<QuestaoComPeso> questoes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestaoComPeso {
        private Integer idQuestao;
        private BigDecimal peso;
    }
}
