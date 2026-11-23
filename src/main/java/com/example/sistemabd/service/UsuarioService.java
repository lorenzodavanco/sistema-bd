package com.example.sistemabd.service;

import com.example.sistemabd.dao.UsuarioDAO;
import com.example.sistemabd.exception.ResourceNotFoundException;
import com.example.sistemabd.model.Usuario;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioDAO usuarioDAO;

    public UsuarioService(UsuarioDAO usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
    }

    public List<Usuario> listarTodos() {
        return usuarioDAO.findAll();
    }

    public Usuario buscarPorId(Integer id) {
        return usuarioDAO.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário com id " + id + " não encontrado."));
    }

    public Usuario criar(Usuario usuario) {
        return usuarioDAO.save(usuario);
    }

    public Usuario atualizar(Integer id, Usuario usuario) {
        buscarPorId(id); // garante que existe
        usuario.setIdUsuario(id);
        usuarioDAO.update(usuario);
        return usuario;
    }

    public void deletar(Integer id) {
        buscarPorId(id); // garante que existe
        usuarioDAO.deleteById(id);
    }
}
