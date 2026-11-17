package com.cti.provedor.service;

import com.cti.provedor.config.ApiException;
import com.cti.provedor.dto.UsuarioDto;
import com.cti.provedor.model.PerfilUsuario;
import com.cti.provedor.model.StatusUsuario;
import com.cti.provedor.model.Usuario;
import com.cti.provedor.repository.UsuarioRepository;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;

    public UsuarioService(
            UsuarioRepository repo,
            PasswordEncoder encoder) {

        this.repo = repo;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public Usuario atual(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ApiException(
                HttpStatus.UNAUTHORIZED,
                "Sessão inválida. Entre novamente."
            );
        }

        Usuario usuario = repo
            .findByEmailIgnoreCase(authentication.getName())
            .orElseThrow(() -> new ApiException(
                HttpStatus.UNAUTHORIZED,
                "Sessão inválida. Entre novamente."
            ));

        if (usuario.getStatus() != StatusUsuario.APROVADO) {
            throw new ApiException(
                HttpStatus.UNAUTHORIZED,
                "Sessão inválida. Entre novamente."
            );
        }

        return usuario;
    }

    @Transactional(readOnly = true)
    public List<UsuarioDto> listar(StatusUsuario status) {

        List<Usuario> lista = status == null
            ? repo.findAllByOrderByCriadoEmDesc()
            : repo.findByStatusOrderByCriadoEmDesc(status);

        return lista.stream()
            .map(UsuarioDto::de)
            .toList();
    }

    @Transactional
    public UsuarioDto alterarStatus(
            Long id,
            StatusUsuario novoStatus,
            Usuario quemAltera) {

        validarAdministrador(quemAltera);

        if (novoStatus == null) {
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Informe um status válido."
            );
        }

        Usuario alvo = buscar(id);

        impedirPropriaConta(alvo, quemAltera);

        if (alvo.getStatus() != novoStatus) {
            alvo.setStatus(novoStatus);
            incrementarVersaoSessao(alvo);
        }

        return UsuarioDto.de(repo.save(alvo));
    }

    @Transactional
    public UsuarioDto promoverParaAdmin(
            Long id,
            Usuario administrador) {

        validarAdministrador(administrador);

        Usuario alvo = buscar(id);

        impedirPropriaConta(alvo, administrador);

        if (alvo.getPerfil() == PerfilUsuario.ADMIN) {
            throw new ApiException(
                HttpStatus.CONFLICT,
                "Este usuário já possui o perfil ADMIN."
            );
        }

        if (alvo.getPerfil() != PerfilUsuario.USER) {
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "O usuário não possui um perfil elegível."
            );
        }

        if (alvo.getStatus() != StatusUsuario.APROVADO) {
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Somente usuários aprovados podem ser promovidos."
            );
        }

        alvo.setPerfil(PerfilUsuario.ADMIN);
        incrementarVersaoSessao(alvo);

        return UsuarioDto.de(repo.save(alvo));
    }

    @Transactional
    public void redefinirSenha(
            Long id,
            String novaSenha,
            Usuario administrador) {

        validarAdministrador(administrador);

        Usuario alvo = buscar(id);

        impedirPropriaConta(alvo, administrador);

        if (alvo.isAdmin()) {
            throw new ApiException(
                HttpStatus.FORBIDDEN,
                "Não é permitido redefinir a senha de outro administrador."
            );
        }

        if (novaSenha == null
                || !novaSenha.matches(
                    "(?s)^(?=.*[A-Za-z])(?=.*\\d).{8,72}$"
                )) {

            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "A senha deve ter de 8 a 72 caracteres, com letras e números."
            );
        }

        if (novaSenha.getBytes(
                StandardCharsets.UTF_8
            ).length > 72) {

            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "A senha é longa demais (limite do BCrypt: 72 bytes)."
            );
        }

        if (encoder.matches(
                novaSenha,
                alvo.getSenhaHash()
            )) {

            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "A nova senha deve ser diferente da senha atual."
            );
        }

        alvo.setSenhaHash(
            encoder.encode(novaSenha)
        );

        incrementarVersaoSessao(alvo);
        repo.save(alvo);
    }

    private Usuario buscar(Long id) {
        return repo.findById(id)
            .orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND,
                "Usuário não encontrado."
            ));
    }

    private void validarAdministrador(
            Usuario administrador) {

        if (administrador == null
                || !administrador.isAdmin()
                || administrador.getStatus()
                    != StatusUsuario.APROVADO) {

            throw new ApiException(
                HttpStatus.FORBIDDEN,
                "Somente administradores aprovados podem executar esta operação."
            );
        }
    }

    private void impedirPropriaConta(
            Usuario alvo,
            Usuario administrador) {

        if (alvo.getId().equals(administrador.getId())) {
            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "Você não pode alterar sua própria conta por esta rota."
            );
        }
    }

    private void incrementarVersaoSessao(
            Usuario usuario) {

        long atual = usuario.getVersaoSessao() == null
            ? 0L
            : usuario.getVersaoSessao();

        usuario.setVersaoSessao(atual + 1L);
    }
}