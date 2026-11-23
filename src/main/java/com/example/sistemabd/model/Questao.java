package com.example.sistemabd.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Questao {
    private Integer idQuestao;
    private String enunciado;
    private String tipoQuestao; // MULTIPLA_ESCOLHA ou TEXTO_LIVRE
}
