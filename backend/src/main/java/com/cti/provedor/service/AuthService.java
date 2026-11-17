package com.cti.provedor.service;

import com.cti.provedor.config.ApiException;
import com.cti.provedor.config.JwtService;
import com.cti.provedor.dto.UsuarioDto;
import com.cti.provedor.dto.AuthDtos.*;
import com.cti.provedor.model.PerfilUsuario;
import com.cti.provedor.model.StatusUsuario;
import com.cti.provedor.model.Usuario;
import com.cti.provedor.repository.UsuarioRepository;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(
            UsuarioRepository repo,
            PasswordEncoder encoder,
            JwtService jwt) {

        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional
    public MensagemResponse cadastrar(CadastroRequest req) {

        String email = req.email()
            .trim()
            .toLowerCase(Locale.ROOT);

        validarTamanhoSenha(req.senha());

        if (repo.existsByEmailIgnoreCase(email)) {
            throw new ApiException(
                HttpStatus.CONFLICT,
                "Já existe um cadastro com este e-mail."
            );
        }

        Usuario usuario = new Usuario();

        usuario.setNome(req.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(
            encoder.encode(req.senha())
        );
        usuario.setMatricula(
            vazioParaNulo(req.matricula())
        );
        usuario.setTurma(
            vazioParaNulo(req.turma())
        );
        usuario.setPerfil(PerfilUsuario.USER);
        usuario.setStatus(StatusUsuario.PENDENTE);
        usuario.setCriadoEm(Datas.agoraUtc());
        usuario.setVersaoSessao(0L);

        repo.save(usuario);

        return new MensagemResponse(
            "Cadastro recebido! Você poderá entrar assim que o administrador liberar o seu acesso."
        );
    }

    public record LoginAutenticado(
        String token,
        long expiracaoSegundos,
        UsuarioDto usuario
    ) {}

    @Transactional(readOnly = true)
    public LoginAutenticado entrar(LoginRequest req) {

        String email = req.email().trim();

        Usuario usuario = repo
            .findByEmailIgnoreCase(email)
            .orElse(null);

        if (usuario == null
                || !encoder.matches(
                    req.senha(),
                    usuario.getSenhaHash()
                )) {

            throw new ApiException(
                HttpStatus.UNAUTHORIZED,
                "E-mail ou senha inválidos."
            );
        }

        if (usuario.getStatus() == StatusUsuario.PENDENTE) {
            throw new ApiException(
                HttpStatus.FORBIDDEN,
                "Seu cadastro ainda aguarda a liberação do administrador."
            );
        }

        if (usuario.getStatus() == StatusUsuario.BLOQUEADO) {
            throw new ApiException(
                HttpStatus.FORBIDDEN,
                "Seu acesso está bloqueado. Fale com o administrador."
            );
        }

        if (usuario.getStatus() != StatusUsuario.APROVADO) {
            throw new ApiException(
                HttpStatus.FORBIDDEN,
                "Sua conta não está autorizada."
            );
        }

        return new LoginAutenticado(
            jwt.gerar(usuario),
            jwt.getExpiracaoSegundos(),
            UsuarioDto.de(usuario)
        );
    }

    private static void validarTamanhoSenha(
            String senha) {

        if (senha == null
                || senha.getBytes(
                    StandardCharsets.UTF_8
                ).length > 72) {

            throw new ApiException(
                HttpStatus.BAD_REQUEST,
                "A senha é longa demais (limite do BCrypt: 72 bytes)."
            );
        }
    }

    private static String vazioParaNulo(String valor) {
        return valor == null || valor.isBlank()
            ? null
            : valor.trim();
    }
}
