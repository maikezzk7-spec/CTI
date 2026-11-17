package com.cti.provedor.config;

import com.cti.provedor.model.StatusUsuario;
import com.cti.provedor.model.Usuario;
import com.cti.provedor.repository.UsuarioRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioDetailsService
        implements UserDetailsService {

    private final UsuarioRepository repo;

    public UsuarioDetailsService(
            UsuarioRepository repo) {

        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(
            String email)
            throws UsernameNotFoundException {

        if (email == null || email.isBlank()) {
            throw new UsernameNotFoundException(
                "Usuário não encontrado."
            );
        }

        Usuario usuario = repo
            .findByEmailIgnoreCase(email.trim())
            .orElseThrow(() ->
                new UsernameNotFoundException(
                    "Usuário não encontrado."
                )
            );

        if (usuario.getPerfil() == null
                || usuario.getStatus() == null
                || usuario.getSenhaHash() == null
                || usuario.getEmail() == null) {

            throw new IllegalStateException(
                "Cadastro de usuário inconsistente."
            );
        }

        return User.withUsername(
                usuario.getEmail()
            )
            .password(
                usuario.getSenhaHash()
            )
            .authorities(
                "ROLE_" + usuario.getPerfil().name()
            )
            .disabled(
                usuario.getStatus()
                    != StatusUsuario.APROVADO
            )
            .build();
    }
}