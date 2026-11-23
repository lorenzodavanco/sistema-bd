package com.example.sistemabd.dao;

import com.example.sistemabd.model.Avaliacao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class AvaliacaoDAO {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Avaliacao> rowMapper = (rs, rowNum) -> new Avaliacao(
            rs.getInt("id_avaliacao"),
            rs.getString("titulo"),
            rs.getString("descricao"),
            rs.getDate("data_inicio").toLocalDate(),
            rs.getDate("data_fim").toLocalDate()
    );

    public AvaliacaoDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Avaliacao> findAll() {
        return jdbcTemplate.query("SELECT * FROM AVALIACAO ORDER BY id_avaliacao", rowMapper);
    }

    public Optional<Avaliacao> findById(Integer id) {
        List<Avaliacao> results = jdbcTemplate.query(
                "SELECT * FROM AVALIACAO WHERE id_avaliacao = ?", rowMapper, id);
        return results.stream().findFirst();
    }

    public Avaliacao save(Avaliacao avaliacao) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO AVALIACAO (titulo, descricao, data_inicio, data_fim) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, avaliacao.getTitulo());
            ps.setString(2, avaliacao.getDescricao());
            ps.setDate(3, Date.valueOf(avaliacao.getDataInicio()));
            ps.setDate(4, Date.valueOf(avaliacao.getDataFim()));
            return ps;
        }, keyHolder);
        avaliacao.setIdAvaliacao(((Number) keyHolder.getKeys().get("id_avaliacao")).intValue());
        return avaliacao;
    }

    public void update(Avaliacao avaliacao) {
        jdbcTemplate.update(
                "UPDATE AVALIACAO SET titulo = ?, descricao = ?, data_inicio = ?, data_fim = ? WHERE id_avaliacao = ?",
                avaliacao.getTitulo(), avaliacao.getDescricao(),
                Date.valueOf(avaliacao.getDataInicio()), Date.valueOf(avaliacao.getDataFim()),
                avaliacao.getIdAvaliacao());
    }

    public void deleteById(Integer id) {
        jdbcTemplate.update("DELETE FROM AVALIACAO WHERE id_avaliacao = ?", id);
    }
}
