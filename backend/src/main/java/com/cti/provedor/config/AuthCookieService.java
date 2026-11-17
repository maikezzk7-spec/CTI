package com.cti.provedor.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthCookieService {

    public static final String NOME_COOKIE = "CTI_AUTH";

    private final boolean secure;
    private final String sameSite;

    public AuthCookieService(
            @Value("${app.auth.cookie-secure:false}")
            boolean secure,

            @Value("${app.auth.cookie-same-site:Lax}")
            String sameSite) {

        if (!"Lax".equals(sameSite)
                && !"Strict".equals(sameSite)
                && !"None".equals(sameSite)) {

            throw new IllegalStateException(
                "SameSite deve ser Lax, Strict ou None."
            );
        }

        if ("None".equals(sameSite) && !secure) {
            throw new IllegalStateException(
                "SameSite=None exige cookie Secure."
            );
        }

        this.secure = secure;
        this.sameSite = sameSite;
    }

    public void criarCookie(
            HttpServletResponse response,
            String token,
            long expiracaoSegundos) {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                "Token de autenticação inválido."
            );
        }

        if (expiracaoSegundos <= 0) {
            throw new IllegalArgumentException(
                "Expiração do cookie inválida."
            );
        }

        ResponseCookie cookie = ResponseCookie
            .from(NOME_COOKIE, token)
            .httpOnly(true)
            .secure(secure)
            .path("/api")
            .sameSite(sameSite)
            .maxAge(
                Duration.ofSeconds(expiracaoSegundos)
            )
            .build();

        response.setHeader(
            HttpHeaders.CACHE_CONTROL,
            "no-store"
        );

        response.addHeader(
            HttpHeaders.SET_COOKIE,
            cookie.toString()
        );
    }

    public void removerCookie(
            HttpServletResponse response) {

        ResponseCookie cookie = ResponseCookie
            .from(NOME_COOKIE, "")
            .httpOnly(true)
            .secure(secure)
            .path("/api")
            .sameSite(sameSite)
            .maxAge(Duration.ZERO)
            .build();

        response.setHeader(
            HttpHeaders.CACHE_CONTROL,
            "no-store"
        );

        response.addHeader(
            HttpHeaders.SET_COOKIE,
            cookie.toString()
        );
    }
}
