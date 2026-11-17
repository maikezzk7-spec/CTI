package com.cti.provedor.controller;

import com.cti.provedor.config.ApiException;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class ErroHandler {

    private static final Logger log =
        LoggerFactory.getLogger(ErroHandler.class);

    public record ErroResposta(
        String erro,
        Map<String, String> campos
    ) {}

    private ResponseEntity<ErroResposta> resposta(
            HttpStatus status,
            String mensagem,
            Map<String, String> campos) {

        return ResponseEntity
            .status(status)
            .header("Cache-Control", "no-store")
            .body(
                new ErroResposta(mensagem, campos)
            );
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErroResposta> api(
            ApiException e) {

        return resposta(
            e.getStatus(),
            e.getMessage(),
            null
        );
    }

    @ExceptionHandler(
        ResponseStatusException.class
    )
    public ResponseEntity<ErroResposta> status(
            ResponseStatusException e) {

        HttpStatus status = HttpStatus.resolve(
            e.getStatusCode().value()
        );

        if (status == null) {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
        }

        String mensagem = e.getReason();

        if (mensagem == null || mensagem.isBlank()) {
            mensagem = status.is5xxServerError()
                ? "Erro interno. Tente novamente em instantes."
                : "Não foi possível concluir a requisição.";
        }

        if (status.is5xxServerError()) {
            log.error(
                "Erro HTTP inesperado: {}",
                status.value(),
                e
            );

            mensagem =
                "Erro interno. Tente novamente em instantes.";
        }

        return resposta(status, mensagem, null);
    }

    @ExceptionHandler(
        MethodArgumentNotValidException.class
    )
    public ResponseEntity<ErroResposta> validacao(
            MethodArgumentNotValidException e) {

        Map<String, String> campos =
            new LinkedHashMap<>();

        e.getBindingResult()
            .getFieldErrors()
            .forEach(erro ->
                campos.putIfAbsent(
                    erro.getField(),
                    erro.getDefaultMessage()
                )
            );

        return resposta(
            HttpStatus.BAD_REQUEST,
            "Verifique os campos informados.",
            campos
        );
    }

    @ExceptionHandler(
        MissingServletRequestParameterException.class
    )
    public ResponseEntity<ErroResposta> parametroAusente(
            MissingServletRequestParameterException e) {

        return resposta(
            HttpStatus.BAD_REQUEST,
            "Falta o parâmetro '" +
                e.getParameterName() + "'.",
            null
        );
    }

    @ExceptionHandler({
        HttpMessageNotReadableException.class,
        MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<ErroResposta> requisicaoInvalida(
            Exception e) {

        return resposta(
            HttpStatus.BAD_REQUEST,
            "Requisição inválida.",
            null
        );
    }

    @ExceptionHandler(
        HttpRequestMethodNotSupportedException.class
    )
    public ResponseEntity<ErroResposta> metodo(
            HttpRequestMethodNotSupportedException e) {

        return resposta(
            HttpStatus.METHOD_NOT_ALLOWED,
            "Método não permitido.",
            null
        );
    }

    @ExceptionHandler(
        NoResourceFoundException.class
    )
    public ResponseEntity<ErroResposta> naoEncontrado(
            NoResourceFoundException e) {

        return resposta(
            HttpStatus.NOT_FOUND,
            "Recurso não encontrado.",
            null
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResposta> inesperado(
            Exception e) {

        log.error("Erro inesperado", e);

        return resposta(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "Erro interno. Tente novamente em instantes.",
            null
        );
    }
}