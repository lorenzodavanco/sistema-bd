package com.example.sistemabd.dao;

import com.example.sistemabd.model.Designacao;
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
public class DesignacaoDAO {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Designacao> rowMapper = (rs, rowNum) -> new Designacao(
            rs.getInt("id_designacao"),
            rs.getInt("id_avaliacao"),
            rs.getInt("id_avaliador"),
            rs.getInt("id_avaliado")
    );

    public DesignacaoDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Designacao> findAll() {
        return jdbcTemplate.query("SELECT * FROM DESIGNACAO ORDER BY id_designacao", rowMapper);
    }

    public Optional<Designacao> findById(Integer id) {
        List<Designacao> results = jdbcTemplate.query(
                "SELECT * FROM DESIGNACAO WHERE id_designacao = ?", rowMapper, id);
        return results.stream().findFirst();
    }

    public List<Designacao> findByAvaliacaoId(Integer idAvaliacao) {
        return jdbcTemplate.query(
                "SELECT * FROM DESIGNACAO WHERE id_avaliacao = ? ORDER BY id_designacao",
                rowMapper, idAvaliacao);
    }

    public List<Designacao> findByAvaliadorId(Integer idAvaliador) {
        return jdbcTemplate.query(
                "SELECT * FROM DESIGNACAO WHERE id_avaliador = ? ORDER BY id_designacao",
                rowMapper, idAvaliador);
    }

    public List<Designacao> findByAvaliadoId(Integer idAvaliado) {
        return jdbcTemplate.query(
                "SELECT * FROM DESIGNACAO WHERE id_avaliado = ? ORDER BY id_designacao",
                rowMapper, idAvaliado);
    }

    public Designacao save(Designacao designacao) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO DESIGNACAO (id_avaliacao, id_avaliador, id_avaliado) VALUES (?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, designacao.getIdAvaliacao());
            ps.setInt(2, designacao.getIdAvaliador());
            ps.setInt(3, designacao.getIdAvaliado());
            return ps;
        }, keyHolder);
        designacao.setIdDesignacao(((Number) keyHolder.getKeys().get("id_designacao")).intValue());
        return designacao;
    }

    public void deleteById(Integer id) {
        jdbcTemplate.update("DELETE FROM DESIGNACAO WHERE id_designacao = ?", id);
    }
}
