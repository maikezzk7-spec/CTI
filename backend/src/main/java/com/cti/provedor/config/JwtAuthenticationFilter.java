package com.cti.provedor.config;

import com.cti.provedor.model.Usuario;
import com.cti.provedor.repository.UsuarioRepository;
import com.cti.provedor.service.RevogacaoTokenService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioDetailsService detailsService;
    private final UsuarioRepository usuarioRepository;
    private final RevogacaoTokenService revogacao;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UsuarioDetailsService detailsService,
            UsuarioRepository usuarioRepository,
            RevogacaoTokenService revogacao) {

        this.jwtService = jwtService;
        this.detailsService = detailsService;
        this.usuarioRepository = usuarioRepository;
        this.revogacao = revogacao;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain)
            throws ServletException, IOException {

        if (SecurityContextHolder.getContext()
                .getAuthentication() == null) {

            String token = extrairTokenCookie(request);

            if (token != null) {
                autenticarToken(token, request);
            }
        }

        chain.doFilter(request, response);
    }

    private String extrairTokenCookie(
            HttpServletRequest request) {

        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        String tokenEncontrado = null;

        for (Cookie cookie : cookies) {

            if (AuthCookieService.NOME_COOKIE.equals(
                    cookie.getName())) {

                String valor = cookie.getValue();

                if (valor == null || valor.isBlank()) {
                    return null;
                }

                // Não aceitar cookies duplicados de autenticação.
                if (tokenEncontrado != null) {
                    return null;
                }

                tokenEncontrado = valor;
            }
        }

        return tokenEncontrado;
    }

    private void autenticarToken(
            String token,
            HttpServletRequest request) {

        jwtService.emailDoToken(token)
            .ifPresent(email -> {

                try {
                    if (revogacao.estaRevogado(token)) {
                        return;
                    }

                    Usuario usuario = usuarioRepository
                        .findByEmailIgnoreCase(email)
                        .orElse(null);

                    if (usuario == null) {
                        return;
                    }

                    if (!jwtService.versaoSessaoValida(
                            token,
                            usuario.getVersaoSessao())) {
                        return;
                    }

                    UserDetails detalhes =
                        detailsService.loadUserByUsername(
                            email
                        );

                    if (!detalhes.isEnabled()) {
                        return;
                    }

                    var autenticacao =
                        new UsernamePasswordAuthenticationToken(
                            detalhes,
                            null,
                            detalhes.getAuthorities()
                        );

                    autenticacao.setDetails(
                        new WebAuthenticationDetailsSource()
                            .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                        .setAuthentication(autenticacao);

                } catch (UsernameNotFoundException e) {
                    SecurityContextHolder.clearContext();
                }
            });
    }
}