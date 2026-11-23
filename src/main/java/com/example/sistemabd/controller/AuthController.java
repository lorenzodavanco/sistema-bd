package com.example.sistemabd.controller;

import com.example.sistemabd.dao.UsuarioDAO;
import com.example.sistemabd.exception.BadRequestException;
import com.example.sistemabd.exception.ResourceNotFoundException;
import com.example.sistemabd.model.Usuario;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioDAO usuarioDAO;

    public AuthController(UsuarioDAO usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
    }

    @PostMapping("/login")
    public Usuario login(@RequestBody Map<String, String> credenciais) {
        String email = credenciais.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("O email é obrigatório para identificação/login.");
        }
        return usuarioDAO.findByEmail(email.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com o email: " + email));
    }
}
