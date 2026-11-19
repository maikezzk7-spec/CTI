package com.cti.provedor.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.DefaultCsrfToken;
import org.springframework.stereotype.Component;

@Component
public class SignedCsrfTokenRepository
        implements CsrfTokenRepository {

    private static final String CSRF_COOKIE = "XSRF-TOKEN";
    private static final String BIND_COOKIE = "CTI_CSRF_BIND";
    private static final String HEADER = "X-XSRF-TOKEN";

    private static final String ATRIBUTO_NOVO_VINCULO =
        "CTI_NOVO_CSRF_BIND";

    private static final Duration DURACAO_COOKIE =
        Duration.ofHours(8);

    private static final int MAX_CSRF = 256;
    private static final int MAX_VINCULO = 4096;

    private final byte[] chave;
    private final boolean secure;

    private final SecureRandom random =
        new SecureRandom();

    public SignedCsrfTokenRepository(
            AppProperties props,
            @Value("${app.auth.cookie-secure:false}")
            boolean secure) {

        String segredo = props.jwt().secret();

        if (segredo == null || segredo.isBlank()) {
            throw new IllegalStateException(
                "JWT_SECRET não configurado."
            );
        }

        this.chave = segredo
            .getBytes(StandardCharsets.UTF_8)
            .clone();

        if (chave.length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET precisa ter pelo menos 32 bytes."
            );
        }

        this.secure = secure;
    }

    @Override
    public CsrfToken generateToken(
            HttpServletRequest request) {

        String vinculo = obterVinculo(request);

        if (vinculo == null) {

            String novoVinculo = gerarAleatorio();

            request.setAttribute(
                ATRIBUTO_NOVO_VINCULO,
                novoVinculo
            );

            vinculo = "ANON:" + novoVinculo;
        }

        String nonce = gerarAleatorio();
        String assinatura = assinar(vinculo, nonce);

        return criarToken(
            nonce + "." + assinatura
        );
    }

    @Override
    public void saveToken(
            CsrfToken csrfToken,
            HttpServletRequest request,
            HttpServletResponse response) {

        if (csrfToken == null) {

            removerCookie(
                response,
                CSRF_COOKIE,
                "/"
            );

            removerCookie(
                response,
                BIND_COOKIE,
                "/api"
            );

            return;
        }

        Object novoVinculo = request.getAttribute(
            ATRIBUTO_NOVO_VINCULO
        );

        if (novoVinculo instanceof String valor) {

            adicionarCookie(
                response,
                BIND_COOKIE,
                valor,
                "/api",
                true
            );
        }

        adicionarCookie(
            response,
            CSRF_COOKIE,
            csrfToken.getToken(),
            "/",
            true
        );
    }

    @Override
    public CsrfToken loadToken(
            HttpServletRequest request) {

        String valor = cookie(
            request,
            CSRF_COOKIE
        );

        String vinculo = obterVinculo(request);

        if (valor == null || vinculo == null) {
            return null;
        }

        if (valor.length() > MAX_CSRF) {
            return null;
        }

        String[] partes = valor.split("\\.", -1);

        if (partes.length != 2
                || partes[0].isBlank()
                || partes[1].isBlank()) {
            return null;
        }

        String assinaturaEsperada = assinar(
            vinculo,
            partes[0]
        );

        boolean assinaturaValida =
            MessageDigest.isEqual(
                assinaturaEsperada.getBytes(
                    StandardCharsets.US_ASCII
                ),
                partes[1].getBytes(
                    StandardCharsets.US_ASCII
                )
            );

        if (!assinaturaValida) {
            return null;
        }

        return criarToken(valor);
    }

    private CsrfToken criarToken(String valor) {

        return new DefaultCsrfToken(
            HEADER,
            "_csrf",
            valor
        );
    }

    // O CSRF utiliza um vínculo aleatório próprio,
    // independente do JWT de autenticação.
    private String obterVinculo(
            HttpServletRequest request) {

        String vinculo = cookie(
            request,
            BIND_COOKIE
        );

        if (vinculo == null || vinculo.isBlank()) {
            return null;
        }

        return "ANON:" + vinculo;
    }

    private String gerarAleatorio() {

        byte[] bytes = new byte[32];

        random.nextBytes(bytes);

        return Base64.getUrlEncoder()
            .withoutPadding()
            .encodeToString(bytes);
    }

    private String assinar(
            String vinculo,
            String nonce) {

        try {
            Mac mac = Mac.getInstance(
                "HmacSHA256"
            );

            mac.init(
                new SecretKeySpec(
                    chave,
                    "HmacSHA256"
                )
            );

            byte[] assinatura = mac.doFinal(
                (vinculo + ":" + nonce)
                    .getBytes(StandardCharsets.UTF_8)
            );

            return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(assinatura);

        } catch (Exception e) {

            throw new IllegalStateException(
                "Falha ao gerar assinatura CSRF.",
                e
            );
        }
    }

    private static String cookie(
            HttpServletRequest request,
            String nome) {

        Cookie[] cookies = request.getCookies();

        if (cookies == null) {
            return null;
        }

        String encontrado = null;

        for (Cookie cookie : cookies) {

            if (nome.equals(cookie.getName())) {

                String valor = cookie.getValue();

                if (valor == null
                        || valor.isBlank()
                        || valor.length() > MAX_VINCULO) {
                    return null;
                }

                if (encontrado != null) {
                    return null;
                }

                encontrado = valor;
            }
        }

        return encontrado;
    }

    private void adicionarCookie(
            HttpServletResponse response,
            String nome,
            String valor,
            String caminho,
            boolean httpOnly) {

        ResponseCookie cookie = ResponseCookie
            .from(nome, valor)
            .httpOnly(httpOnly)
            .secure(secure)
            .sameSite("Lax")
            .path(caminho)
            .maxAge(DURACAO_COOKIE)
            .build();

        response.addHeader(
            HttpHeaders.SET_COOKIE,
            cookie.toString()
        );
    }

    private void removerCookie(
            HttpServletResponse response,
            String nome,
            String caminho) {

        ResponseCookie cookie = ResponseCookie
            .from(nome, "")
            .httpOnly(true)
            .secure(secure)
            .sameSite("Lax")
            .path(caminho)
            .maxAge(Duration.ZERO)
            .build();

        response.addHeader(
            HttpHeaders.SET_COOKIE,
            cookie.toString()
        );
    }
}