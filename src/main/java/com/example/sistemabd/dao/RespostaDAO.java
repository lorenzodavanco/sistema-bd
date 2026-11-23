package com.example.sistemabd.dao;

import com.example.sistemabd.model.Resposta;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class RespostaDAO {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Resposta> rowMapper = (rs, rowNum) -> new Resposta(
            rs.getInt("id_resposta"),
            rs.getInt("id_designacao"),
            rs.getInt("id_questao"),
            rs.getString("valor_resposta")
    );

    public RespostaDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Resposta> findAll() {
        return jdbcTemplate.query("SELECT * FROM RESPOSTA ORDER BY id_resposta", rowMapper);
    }

    public Optional<Resposta> findById(Integer id) {
        List<Resposta> results = jdbcTemplate.query(
                "SELECT * FROM RESPOSTA WHERE id_resposta = ?", rowMapper, id);
        return results.stream().findFirst();
    }

    public List<Resposta> findByDesignacaoId(Integer idDesignacao) {
        return jdbcTemplate.query(
                "SELECT * FROM RESPOSTA WHERE id_designacao = ? ORDER BY id_questao",
                rowMapper, idDesignacao);
    }

    public Resposta save(Resposta resposta) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO RESPOSTA (id_designacao, id_questao, valor_resposta) VALUES (?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, resposta.getIdDesignacao());
            ps.setInt(2, resposta.getIdQuestao());
            ps.setString(3, resposta.getValorResposta());
            return ps;
        }, keyHolder);
        resposta.setIdResposta(((Number) keyHolder.getKeys().get("id_resposta")).intValue());
        return resposta;
    }

    public void update(Resposta resposta) {
        jdbcTemplate.update(
                "UPDATE RESPOSTA SET valor_resposta = ? WHERE id_resposta = ?",
                resposta.getValorResposta(), resposta.getIdResposta());
    }

    public void deleteById(Integer id) {
        jdbcTemplate.update("DELETE FROM RESPOSTA WHERE id_resposta = ?", id);
    }
}
