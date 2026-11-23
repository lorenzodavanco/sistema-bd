package com.example.sistemabd.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Composicao {
    private Integer idAvaliacao;
    private Integer idQuestao;
    private BigDecimal peso;
}
