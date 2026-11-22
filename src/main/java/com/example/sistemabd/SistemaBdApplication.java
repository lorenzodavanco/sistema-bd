package com.example.sistemabd;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class SistemaBdApplication {

    public static void main(String[] args) {
        SpringApplication.run(SistemaBdApplication.class, args);
    }

    @Bean
    CommandLineRunner testarConexao(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                Integer totalUsuarios = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM USUARIO", Integer.class
                );
                System.out.println("==================================================");
                System.out.println(">>> CONEXAO COM O BANCO REALIZADA COM SUCESSO! <<<");
                System.out.println(">>> Total de usuarios cadastrados: " + totalUsuarios);
                System.out.println("==================================================");
            } catch (Exception e) {
                System.err.println(">>> FALHA AO TESTAR CONEXAO COM O BANCO: " + e.getMessage());
            }
        };
    }

}
