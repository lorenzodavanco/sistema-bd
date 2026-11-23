package com.example.sistemabd.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resposta {
    private Integer idResposta;
    private Integer idDesignacao;
    private Integer idQuestao;
    private String valorResposta;
}
