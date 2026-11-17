package com.cti.provedor.controller;

import com.cti.provedor.config.AuthCookieService;
import com.cti.provedor.dto.AuthDtos.*;
import com.cti.provedor.dto.UsuarioDto;
import com.cti.provedor.service.AuthService;
import com.cti.provedor.service.UsuarioService;
import com.cti.provedor.service.RevogacaoTokenService;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService auth;
    private final UsuarioService usuarios;
    private final AuthCookieService cookies;
    private final CsrfTokenRepository csrfRepository;
    private final RevogacaoTokenService revogacao;

    public AuthController(
            AuthService auth,
            UsuarioService usuarios,
            AuthCookieService cookies,
            CsrfTokenRepository csrfRepository,
            RevogacaoTokenService revogacao) {

        this.auth = auth;
        this.usuarios = usuarios;
        this.cookies = cookies;
        this.csrfRepository = csrfRepository;
        this.revogacao = revogacao;
    }

    @GetMapping("/auth/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of(
            "headerName", token.getHeaderName(),
            "token", token.getToken()
        );
    }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public MensagemResponse cadastrar(
            @Valid @RequestBody CadastroRequest req) {
        return auth.cadastrar(req);
    }

    @PostMapping("/auth/login")
    public LoginResponse entrar(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest request,
            HttpServletResponse response) {

        AuthService.LoginAutenticado resultado =
            auth.entrar(req);

        csrfRepository.saveToken(
            null, request, response
        );

        cookies.criarCookie(
            response,
            resultado.token(),
            resultado.expiracaoSegundos()
        );

        response.setHeader(
            "Cache-Control", "no-store"
        );

        return new LoginResponse(
            resultado.expiracaoSegundos(),
            resultado.usuario()
        );
    }

    @GetMapping("/auth/me")
    public UsuarioDto eu(
            Authentication authentication,
            HttpServletResponse response) {

        response.setHeader(
            "Cache-Control", "no-store"
        );

        return UsuarioDto.de(
            usuarios.atual(authentication)
        );
    }

    @PostMapping("/auth/logout")
    public MensagemResponse sair(
            HttpServletRequest request,
            HttpServletResponse response) {

        String token = extrairToken(request);

        if (token == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Sessão não encontrada."
            );
        }

        revogacao.revogar(token);

        csrfRepository.saveToken(
            null, request, response
        );

        cookies.removerCookie(response);

        response.setHeader(
            "Cache-Control", "no-store"
        );

        return new MensagemResponse(
            "Sessão encerrada neste navegador."
        );
    }

    @GetMapping("/health")
    public Map<String, String> saude() {
        return Map.of("status", "ok");
    }

    private String extrairToken(
            HttpServletRequest request) {

        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        String encontrado = null;

        for (Cookie cookie : cookies) {
            if (AuthCookieService.NOME_COOKIE.equals(
                    cookie.getName())) {

                String valor = cookie.getValue();

                if (valor == null || valor.isBlank()
                        || encontrado != null) {
                    return null;
                }

                encontrado = valor;
            }
        }

        return encontrado;
    }
}
