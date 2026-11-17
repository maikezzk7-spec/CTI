package com.cti.provedor;

// ============================================================================
// Classe principal do backend CTI Insights.
// Inicializa o Spring Boot e habilita tarefas automáticas agendadas.
// ============================================================================

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
public class CtiProvedorApplication {

    public static void main(String[] args) {
        SpringApplication.run(CtiProvedorApplication.class, args);
    }
}