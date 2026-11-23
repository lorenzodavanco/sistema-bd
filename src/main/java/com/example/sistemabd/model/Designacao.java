package com.example.sistemabd.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Designacao {
    private Integer idDesignacao;
    private Integer idAvaliacao;
    private Integer idAvaliador;
    private Integer idAvaliado;
}
