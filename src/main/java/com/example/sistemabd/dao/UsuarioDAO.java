package com.example.sistemabd.dao;

import com.example.sistemabd.model.Usuario;
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
public class UsuarioDAO {

    private final JdbcTemplate jdbcTemplate;

    private final RowMapper<Usuario> rowMapper = (rs, rowNum) -> new Usuario(
            rs.getInt("id_usuario"),
            rs.getString("nome"),
            rs.getString("email"),
            rs.getString("cargo"),
            rs.getString("departamento")
    );

    public UsuarioDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Usuario> findAll() {
        return jdbcTemplate.query("SELECT * FROM USUARIO ORDER BY id_usuario", rowMapper);
    }

    public Optional<Usuario> findById(Integer id) {
        List<Usuario> results = jdbcTemplate.query(
                "SELECT * FROM USUARIO WHERE id_usuario = ?", rowMapper, id);
        return results.stream().findFirst();
    }

    public Optional<Usuario> findByEmail(String email) {
        List<Usuario> results = jdbcTemplate.query(
                "SELECT * FROM USUARIO WHERE email = ?", rowMapper, email);
        return results.stream().findFirst();
    }

    public Usuario save(Usuario usuario) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO USUARIO (nome, email, cargo, departamento) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, usuario.getNome());
            ps.setString(2, usuario.getEmail());
            ps.setString(3, usuario.getCargo());
            ps.setString(4, usuario.getDepartamento());
            return ps;
        }, keyHolder);
        usuario.setIdUsuario(((Number) keyHolder.getKeys().get("id_usuario")).intValue());
        return usuario;
    }

    public void update(Usuario usuario) {
        jdbcTemplate.update(
                "UPDATE USUARIO SET nome = ?, email = ?, cargo = ?, departamento = ? WHERE id_usuario = ?",
                usuario.getNome(), usuario.getEmail(), usuario.getCargo(),
                usuario.getDepartamento(), usuario.getIdUsuario());
    }

    public void deleteById(Integer id) {
        jdbcTemplate.update("DELETE FROM USUARIO WHERE id_usuario = ?", id);
    }
}
