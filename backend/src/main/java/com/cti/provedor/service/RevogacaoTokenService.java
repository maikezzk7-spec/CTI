package com.cti.provedor.service;

import com.cti.provedor.config.JwtService;
import com.cti.provedor.model.TokenRevogado;
import com.cti.provedor.repository.TokenRevogadoRepository;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RevogacaoTokenService {

    private static final Logger log =
        LoggerFactory.getLogger(
            RevogacaoTokenService.class
        );

    private final TokenRevogadoRepository repository;
    private final JwtService jwtService;

    public RevogacaoTokenService(
            TokenRevogadoRepository repository,
            JwtService jwtService) {

        this.repository = repository;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public boolean estaRevogado(String token) {

        return jwtService.dadosDoToken(token)
            .map(dados ->
                repository.existsById(dados.jti())
            )
            .orElse(true);
    }

    @Transactional
    public void revogar(String token) {

        JwtService.DadosToken dados =
            jwtService.dadosDoToken(token)
                .orElseThrow(() ->
                    new IllegalArgumentException(
                        "Token inválido."
                    )
                );

        if (!dados.expiraEm().isAfter(Instant.now())) {
            return;
        }

        if (repository.existsById(dados.jti())) {
            return;
        }

        repository.saveAndFlush(
            new TokenRevogado(
                dados.jti(),
                dados.expiraEm()
            )
        );
    }

    @Scheduled(
        cron = "0 0 3 * * *",
        zone = "UTC"
    )
    @Transactional
    public void limparTokensExpirados() {

        int removidos =
            repository.removerTokensExpirados(
                Instant.now()
            );

        if (removidos > 0) {
            log.info(
                "Limpeza de tokens revogados: {} registros removidos.",
                removidos
            );
        }
    }
}