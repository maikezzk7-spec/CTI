package com.cti.provedor.config;

import com.cti.provedor.model.Usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final int TAMANHO_MAX_TOKEN = 4096;

    private final SecretKey chave;
    private final long expiracaoSegundos;

    public record DadosToken(
            String jti,
            String email,
            Instant expiraEm
    ) {}

    public JwtService(AppProperties props) {

        String segredo = props.jwt().secret();

        if (segredo == null || segredo.isBlank()) {
            throw new IllegalStateException(
                "JWT_SECRET não foi configurado."
            );
        }

        byte[] bytes = segredo.getBytes(
            StandardCharsets.UTF_8
        );

        if (bytes.length < 32) {
            throw new IllegalStateException(
                "JWT_SECRET precisa ter pelo menos 32 bytes."
            );
        }

        this.chave = Keys.hmacShaKeyFor(bytes);

        this.expiracaoSegundos = Math.multiplyExact(
            props.jwt().expirationMinutes(),
            60L
        );

        if (expiracaoSegundos <= 0) {
            throw new IllegalStateException(
                "A expiração JWT deve ser positiva."
            );
        }
    }

    public String gerar(Usuario usuario) {

        if (usuario == null
                || usuario.getEmail() == null
                || usuario.getPerfil() == null
                || usuario.getVersaoSessao() == null) {

            throw new IllegalArgumentException(
                "Dados do usuário inválidos."
            );
        }

        Instant agora = Instant.now();

        return Jwts.builder()
            .id(UUID.randomUUID().toString())
            .subject(usuario.getEmail())
            .claim(
                "perfil",
                usuario.getPerfil().name()
            )
            .claim(
                "versaoSessao",
                usuario.getVersaoSessao()
            )
            .issuedAt(Date.from(agora))
            .expiration(
                Date.from(
                    agora.plusSeconds(expiracaoSegundos)
                )
            )
            .signWith(chave, Jwts.SIG.HS256)
            .compact();
    }

    private Optional<Claims> claimsValidas(
            String token) {

        if (token == null
                || token.isBlank()
                || token.length() > TAMANHO_MAX_TOKEN) {

            return Optional.empty();
        }

        try {
            var jwt = Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token);

            if (!"HS256".equals(
                    jwt.getHeader().getAlgorithm())) {
                return Optional.empty();
            }

            Claims claims = jwt.getPayload();

            if (claims.getId() == null
                    || !uuidValido(claims.getId())
                    || claims.getSubject() == null
                    || claims.getSubject().isBlank()
                    || claims.getExpiration() == null
                    || claims.getIssuedAt() == null
                    || !(claims.get("versaoSessao")
                            instanceof Number)) {

                return Optional.empty();
            }

            if (claims.getIssuedAt()
                    .after(new Date(
                        System.currentTimeMillis() + 60000L
                    ))) {
                return Optional.empty();
            }

            return Optional.of(claims);

        } catch (JwtException
                | IllegalArgumentException e) {

            return Optional.empty();
        }
    }

    private boolean uuidValido(String valor) {

        if (valor == null || valor.length() != 36) {
            return false;
        }

        try {
            return UUID.fromString(valor)
                .toString()
                .equals(valor);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public Optional<String> emailDoToken(
            String token) {

        return claimsValidas(token)
            .map(Claims::getSubject);
    }

    public Optional<DadosToken> dadosDoToken(
            String token) {

        return claimsValidas(token)
            .map(claims ->
                new DadosToken(
                    claims.getId(),
                    claims.getSubject(),
                    claims.getExpiration().toInstant()
                )
            );
    }

    public boolean versaoSessaoValida(
            String token,
            Long versaoAtual) {

        if (versaoAtual == null) {
            return false;
        }

        return claimsValidas(token)
            .map(claims -> {
                Number versao =
                    (Number) claims.get(
                        "versaoSessao"
                    );

                return versao.longValue()
                    == versaoAtual.longValue();
            })
            .orElse(false);
    }

    public long getExpiracaoSegundos() {
        return expiracaoSegundos;
    }
}