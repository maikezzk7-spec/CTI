package com.cti.provedor.service;

import com.cti.provedor.config.JwtService;
import com.cti.provedor.model.TokenRevogado;
import com.cti.provedor.repository.TokenRevogadoRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RevogacaoTokenServiceTest {

    @Mock
    private TokenRevogadoRepository repository;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private RevogacaoTokenService service;

    // ==========================================
    // TESTE 1 - JWT INVALIDO
    // ==========================================

    @Test
    void deveConsiderarRevogadoQuandoTokenForInvalido() {

        String token = "jwt-invalido-para-teste";

        when(jwtService.dadosDoToken(token))
                .thenReturn(Optional.empty());

        boolean resultado = service.estaRevogado(token);

        assertTrue(resultado);

        verify(jwtService).dadosDoToken(token);
        verifyNoInteractions(repository);
    }

    // ==========================================
    // TESTE 2 - JWT VALIDO E NAO REVOGADO
    // ==========================================

    @Test
    void devePermitirTokenValidoNaoRevogado() {

        String token = "jwt-valido-simulado";
        String jti = "123e4567-e89b-42d3-a456-426614174000";

        JwtService.DadosToken dados =
                new JwtService.DadosToken(
                        jti,
                        "admin@cti.com",
                        Instant.now().plusSeconds(3600)
                );

        when(jwtService.dadosDoToken(token))
                .thenReturn(Optional.of(dados));

        when(repository.existsById(jti))
                .thenReturn(false);

        boolean resultado = service.estaRevogado(token);

        assertFalse(resultado);

        verify(jwtService).dadosDoToken(token);
        verify(repository).existsById(jti);
    }

    // ==========================================
    // TESTE 3 - JWT VALIDO JA REVOGADO
    // ==========================================

    @Test
    void deveBloquearTokenValidoJaRevogado() {

        String token = "jwt-revogado-simulado";
        String jti = "123e4567-e89b-42d3-a456-426614174001";

        JwtService.DadosToken dados =
                new JwtService.DadosToken(
                        jti,
                        "admin@cti.com",
                        Instant.now().plusSeconds(3600)
                );

        when(jwtService.dadosDoToken(token))
                .thenReturn(Optional.of(dados));

        when(repository.existsById(jti))
                .thenReturn(true);

        boolean resultado = service.estaRevogado(token);

        assertTrue(resultado);

        verify(jwtService).dadosDoToken(token);
        verify(repository).existsById(jti);
    }

    // ==========================================
    // TESTE 4 - REVOGAR JWT VALIDO
    // ==========================================

    @Test
    void deveSalvarRevogacaoDeTokenValido() {

        String token = "jwt-valido-para-revogacao";
        String jti = "123e4567-e89b-42d3-a456-426614174002";

        Instant expiracao = Instant.now().plusSeconds(3600);

        JwtService.DadosToken dados =
                new JwtService.DadosToken(
                        jti,
                        "admin@cti.com",
                        expiracao
                );

        when(jwtService.dadosDoToken(token))
                .thenReturn(Optional.of(dados));

        service.revogar(token);

        // Captura a entidade enviada ao repositório.
        ArgumentCaptor<TokenRevogado> captor =
                ArgumentCaptor.forClass(TokenRevogado.class);

        verify(repository).saveAndFlush(captor.capture());

        TokenRevogado entidade = captor.getValue();

        // Confirma que os dados foram preservados.
        assertEquals(jti, entidade.getJti());
        assertEquals(expiracao, entidade.getExpiraEm());

        verify(jwtService).dadosDoToken(token);
    }

    // ==========================================
    // TESTE 5 - REJEITAR REVOGACAO INVALIDA
    // ==========================================

    @Test
    void deveRejeitarRevogacaoDeTokenInvalido() {

        String token = "jwt-invalido";

        when(jwtService.dadosDoToken(token))
                .thenReturn(Optional.empty());

        IllegalArgumentException erro =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> service.revogar(token)
                );

        assertEquals("Token inválido.", erro.getMessage());

        verify(jwtService).dadosDoToken(token);

        // Nenhum registro deve ser salvo.
        verifyNoInteractions(repository);
    }

    // ==========================================
    // TESTE 6 - NAO SALVAR TOKEN EXPIRADO
    // ==========================================

    @Test
    void naoDeveSalvarRevogacaoDeTokenExpirado() {

        String token = "jwt-expirado-simulado";
        String jti = "123e4567-e89b-42d3-a456-426614174003";

        Instant expiracao = Instant.now().minusSeconds(3600);

        JwtService.DadosToken dados =
                new JwtService.DadosToken(
                        jti,
                        "admin@cti.com",
                        expiracao
                );

        when(jwtService.dadosDoToken(token))
                .thenReturn(Optional.of(dados));

        service.revogar(token);

        verify(jwtService).dadosDoToken(token);

        // Um token expirado nao deve gerar registro.
        verifyNoInteractions(repository);
    }

    // ==========================================
    // TESTE 7 - LIMPEZA DE TOKENS EXPIRADOS
    // ==========================================

    @Test
    void deveExecutarLimpezaDeTokensExpirados() {

        // Simula que o banco removeu 2 tokens expirados.
        when(repository.removerTokensExpirados(
                org.mockito.ArgumentMatchers.any(Instant.class)
        )).thenReturn(2);

        // Executa a limpeza.
        service.limparTokensExpirados();

        // Confirma que o repositório foi chamado.
        verify(repository).removerTokensExpirados(
                org.mockito.ArgumentMatchers.any(Instant.class)
        );

        // A limpeza não precisa consultar o JwtService.
        verifyNoInteractions(jwtService);
    }
}