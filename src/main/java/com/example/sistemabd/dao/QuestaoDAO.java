package com.example.sistemabd.dao;

import com.example.sistemabd.model.Questao;
import com.example.sistemabd.model.Alternativa;
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
public class QuestaoDAO {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Questao> rowMapper = (rs, rowNum) -> new Questao(
            rs.getInt("id_questao"),
            rs.getString("enunciado"),
            rs.getString("tipo_questao")
    );

    private final RowMapper<Alternativa> alternativaRowMapper = (rs, rowNum) -> new Alternativa(
            rs.getInt("id_questao"),
            rs.getInt("id_alternativa"),
            rs.getString("texto")
    );

    public QuestaoDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Questao> findAll() {
        return jdbcTemplate.query("SELECT * FROM QUESTAO ORDER BY id_questao", rowMapper);
    }

    public Optional<Questao> findById(Integer id) {
        List<Questao> results = jdbcTemplate.query(
                "SELECT * FROM QUESTAO WHERE id_questao = ?", rowMapper, id);
        return results.stream().findFirst();
    }

    public Questao save(Questao questao) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO QUESTAO (enunciado, tipo_questao) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, questao.getEnunciado());
            ps.setString(2, questao.getTipoQuestao());
            return ps;
        }, keyHolder);
        questao.setIdQuestao(((Number) keyHolder.getKeys().get("id_questao")).intValue());
        return questao;
    }

    public void update(Questao questao) {
        jdbcTemplate.update(
                "UPDATE QUESTAO SET enunciado = ?, tipo_questao = ? WHERE id_questao = ?",
                questao.getEnunciado(), questao.getTipoQuestao(), questao.getIdQuestao());
    }

    public void deleteById(Integer id) {
        jdbcTemplate.update("DELETE FROM QUESTAO WHERE id_questao = ?", id);
    }

    // ===== Alternativas =====

    public List<Alternativa> findAlternativasByQuestaoId(Integer idQuestao) {
        return jdbcTemplate.query(
                "SELECT * FROM ALTERNATIVA WHERE id_questao = ? ORDER BY id_alternativa",
                alternativaRowMapper, idQuestao);
    }

    public void saveAlternativa(Alternativa alternativa) {
        jdbcTemplate.update(
                "INSERT INTO ALTERNATIVA (id_questao, id_alternativa, texto) VALUES (?, ?, ?)",
                alternativa.getIdQuestao(), alternativa.getIdAlternativa(), alternativa.getTexto());
    }

    public void deleteAlternativasByQuestaoId(Integer idQuestao) {
        jdbcTemplate.update("DELETE FROM ALTERNATIVA WHERE id_questao = ?", idQuestao);
    }
}
