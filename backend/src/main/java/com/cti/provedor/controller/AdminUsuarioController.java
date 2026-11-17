package com.cti.provedor.controller;

import com.cti.provedor.dto.UsuarioDto;
import com.cti.provedor.model.StatusUsuario;
import com.cti.provedor.service.UsuarioService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUsuarioController {

    private final UsuarioService service;

    public AdminUsuarioController(
            UsuarioService service) {
        this.service = service;
    }

    public record AlterarStatusRequest(
        @NotNull(message = "Informe o status")
        StatusUsuario status
    ) {}

    public record RedefinirSenhaRequest(
        @NotBlank(message = "Informe a nova senha")
        String novaSenha
    ) {}

    @GetMapping
    public List<UsuarioDto> listar(
            @RequestParam(required = false)
            StatusUsuario status) {

        return service.listar(status);
    }

    @PatchMapping("/{id}/status")
    public UsuarioDto alterarStatus(
            @PathVariable Long id,
            @Valid @RequestBody AlterarStatusRequest req,
            Authentication authentication) {

        return service.alterarStatus(
            id,
            req.status(),
            service.atual(authentication)
        );
    }

    @PatchMapping("/{id}/senha")
    public Map<String, String> redefinirSenha(
            @PathVariable Long id,
            @Valid @RequestBody RedefinirSenhaRequest req,
            Authentication authentication) {

        service.redefinirSenha(
            id,
            req.novaSenha(),
            service.atual(authentication)
        );

        return Map.of(
            "mensagem",
            "Senha redefinida com sucesso. O usuário deverá entrar novamente."
        );
    }

    @PatchMapping("/{id}/promover")
    public UsuarioDto promoverParaAdmin(
            @PathVariable Long id,
            Authentication authentication) {

        return service.promoverParaAdmin(
            id,
            service.atual(authentication)
        );
    }
}