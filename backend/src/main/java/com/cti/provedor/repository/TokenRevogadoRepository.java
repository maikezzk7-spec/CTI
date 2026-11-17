package com.cti.provedor.repository;

import com.cti.provedor.model.TokenRevogado;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TokenRevogadoRepository
        extends JpaRepository<TokenRevogado, String> {

    @Modifying
    @Query("""
            DELETE FROM TokenRevogado t
            WHERE t.expiraEm < :agora
            """)
    int removerTokensExpirados(@Param("agora") Instant agora);
}