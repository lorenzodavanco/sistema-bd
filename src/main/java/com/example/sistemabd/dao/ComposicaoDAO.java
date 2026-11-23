package com.example.sistemabd.dao;

import com.example.sistemabd.model.Composicao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ComposicaoDAO {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Composicao> rowMapper = (rs, rowNum) -> new Composicao(
            rs.getInt("id_avaliacao"),
            rs.getInt("id_questao"),
            rs.getBigDecimal("peso")
    );

    public ComposicaoDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Composicao> findByAvaliacaoId(Integer idAvaliacao) {
        return jdbcTemplate.query(
                "SELECT * FROM COMPOSICAO WHERE id_avaliacao = ? ORDER BY id_questao",
                rowMapper, idAvaliacao);
    }

    public void save(Composicao composicao) {
        jdbcTemplate.update(
                "INSERT INTO COMPOSICAO (id_avaliacao, id_questao, peso) VALUES (?, ?, ?)",
                composicao.getIdAvaliacao(), composicao.getIdQuestao(), composicao.getPeso());
    }

    public void updatePeso(Integer idAvaliacao, Integer idQuestao, java.math.BigDecimal peso) {
        jdbcTemplate.update(
                "UPDATE COMPOSICAO SET peso = ? WHERE id_avaliacao = ? AND id_questao = ?",
                peso, idAvaliacao, idQuestao);
    }

    public void delete(Integer idAvaliacao, Integer idQuestao) {
        jdbcTemplate.update(
                "DELETE FROM COMPOSICAO WHERE id_avaliacao = ? AND id_questao = ?",
                idAvaliacao, idQuestao);
    }

    public void deleteByAvaliacaoId(Integer idAvaliacao) {
        jdbcTemplate.update("DELETE FROM COMPOSICAO WHERE id_avaliacao = ?", idAvaliacao);
    }
}
