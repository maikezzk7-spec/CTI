package com.cti.provedor.service;

import com.cti.provedor.config.ApiException;
import com.cti.provedor.dto.UsuarioDto;
import com.cti.provedor.model.PerfilUsuario;
import com.cti.provedor.model.StatusUsuario;
import com.cti.provedor.model.Usuario;
import com.cti.provedor.repository.UsuarioRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repo;

    @Mock
    private PasswordEncoder encoder;

    @InjectMocks
    private UsuarioService service;

    private Usuario administrador;
    private Usuario usuario;

    @BeforeEach
    void preparar() {

        administrador = new Usuario();
        administrador.setId(1L);
        administrador.setNome("Administrador");
        administrador.setEmail("admin@cti.com");
        administrador.setPerfil(PerfilUsuario.ADMIN);
        administrador.setStatus(StatusUsuario.APROVADO);
        administrador.setVersaoSessao(0L);

        usuario = new Usuario();
        usuario.setId(2L);
        usuario.setNome("Usuario Teste");
        usuario.setEmail("usuario@cti.com");
        usuario.setPerfil(PerfilUsuario.USER);
        usuario.setStatus(StatusUsuario.APROVADO);
        usuario.setVersaoSessao(0L);
    }

    // ==========================================
    // TESTE 1 - PROMOCAO AUTORIZADA
    // ==========================================

    @Test
    void devePromoverUsuarioAprovadoParaAdmin() {

        when(repo.findById(2L))
                .thenReturn(Optional.of(usuario));

        when(repo.save(usuario))
                .thenReturn(usuario);

        UsuarioDto resultado =
                service.promoverParaAdmin(2L, administrador);

        assertNotNull(resultado);
        assertEquals(PerfilUsuario.ADMIN, usuario.getPerfil());
        assertEquals(1L, usuario.getVersaoSessao());

        verify(repo).save(usuario);
    }

    // ==========================================
    // TESTE 2 - USER NAO PODE PROMOVER
    // ==========================================

    @Test
    void naoDevePermitirPromocaoPorUsuarioComum() {

        administrador.setPerfil(PerfilUsuario.USER);

        assertThrows(
                ApiException.class,
                () -> service.promoverParaAdmin(2L, administrador)
        );

        verifyNoInteractions(repo);
    }

    // ==========================================
    // TESTE 3 - ADMIN BLOQUEADO
    // ==========================================

    @Test
    void naoDevePermitirPromocaoPorAdminBloqueado() {

        administrador.setStatus(StatusUsuario.BLOQUEADO);

        assertThrows(
                ApiException.class,
                () -> service.promoverParaAdmin(2L, administrador)
        );

        verifyNoInteractions(repo);
    }

    // ==========================================
    // TESTE 4 - PROPRIA CONTA
    // ==========================================

    @Test
    void naoDevePermitirPromoverPropriaConta() {

        when(repo.findById(1L))
                .thenReturn(Optional.of(administrador));

        assertThrows(
                ApiException.class,
                () -> service.promoverParaAdmin(1L, administrador)
        );

        verify(repo, never()).save(any(Usuario.class));
    }

    // ==========================================
    // TESTE 5 - USUARIO INEXISTENTE
    // ==========================================

    @Test
    void naoDevePromoverUsuarioInexistente() {

        when(repo.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ApiException.class,
                () -> service.promoverParaAdmin(99L, administrador)
        );

        verify(repo, never()).save(any(Usuario.class));
    }

    // ==========================================
    // TESTE 6 - USUARIO JA ADMIN
    // ==========================================

    @Test
    void naoDevePromoverUsuarioJaAdministrador() {

        usuario.setPerfil(PerfilUsuario.ADMIN);

        when(repo.findById(2L))
                .thenReturn(Optional.of(usuario));

        assertThrows(
                ApiException.class,
                () -> service.promoverParaAdmin(2L, administrador)
        );

        verify(repo, never()).save(any(Usuario.class));
    }

    // ==========================================
    // TESTE 7 - USUARIO PENDENTE
    // ==========================================

    @Test
    void naoDevePromoverUsuarioPendente() {

        usuario.setStatus(StatusUsuario.PENDENTE);

        when(repo.findById(2L))
                .thenReturn(Optional.of(usuario));

        assertThrows(
                ApiException.class,
                () -> service.promoverParaAdmin(2L, administrador)
        );

        verify(repo, never()).save(any(Usuario.class));
    }

    // ==========================================
    // TESTE 8 - USUARIO BLOQUEADO
    // ==========================================

    @Test
    void naoDevePromoverUsuarioBloqueado() {

        usuario.setStatus(StatusUsuario.BLOQUEADO);

        when(repo.findById(2L))
                .thenReturn(Optional.of(usuario));

        assertThrows(
                ApiException.class,
                () -> service.promoverParaAdmin(2L, administrador)
        );

        verify(repo, never()).save(any(Usuario.class));
    }

    // ==========================================
    // TESTE 9 - BLOQUEIO INVALIDA SESSOES
    // ==========================================

    @Test
    void deveInvalidarSessoesAoBloquearUsuario() {

        when(repo.findById(2L))
                .thenReturn(Optional.of(usuario));

        when(repo.save(usuario))
                .thenReturn(usuario);

        service.alterarStatus(
                2L,
                StatusUsuario.BLOQUEADO,
                administrador
        );

        assertEquals(StatusUsuario.BLOQUEADO, usuario.getStatus());
        assertEquals(1L, usuario.getVersaoSessao());

        verify(repo).save(usuario);
    }

    // ==========================================
    // TESTE 10 - APROVACAO INVALIDA SESSOES
    // ==========================================

    @Test
    void deveInvalidarSessoesAoAprovarUsuario() {

        usuario.setStatus(StatusUsuario.PENDENTE);

        when(repo.findById(2L))
                .thenReturn(Optional.of(usuario));

        when(repo.save(usuario))
                .thenReturn(usuario);

        service.alterarStatus(
                2L,
                StatusUsuario.APROVADO,
                administrador
        );

        assertEquals(StatusUsuario.APROVADO, usuario.getStatus());
        assertEquals(1L, usuario.getVersaoSessao());

        verify(repo).save(usuario);
    }

    // ==========================================
    // TESTE 11 - STATUS SEM ALTERACAO
    // ==========================================

    @Test
    void naoDeveIncrementarVersaoSeStatusNaoMudar() {

        when(repo.findById(2L))
                .thenReturn(Optional.of(usuario));

        when(repo.save(usuario))
                .thenReturn(usuario);

        service.alterarStatus(
                2L,
                StatusUsuario.APROVADO,
                administrador
        );

        assertEquals(0L, usuario.getVersaoSessao());

        verify(repo).save(usuario);
    }

    // ==========================================
    // TESTE 12 - PROIBIR ALTERAR PROPRIO STATUS
    // ==========================================

    @Test
    void naoDevePermitirAlterarProprioStatus() {

        when(repo.findById(1L))
                .thenReturn(Optional.of(administrador));

        assertThrows(
                ApiException.class,
                () -> service.alterarStatus(
                        1L,
                        StatusUsuario.BLOQUEADO,
                        administrador
                )
        );

        verify(repo, never()).save(any(Usuario.class));
    }
}