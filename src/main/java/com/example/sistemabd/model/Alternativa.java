package com.example.sistemabd.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alternativa {
    private Integer idQuestao;
    private Integer idAlternativa;
    private String texto;
}
