package com.cti.provedor.config;

import com.cti.provedor.repository.UsuarioRepository;
import com.cti.provedor.service.RevogacaoTokenService;

import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filtros(
            HttpSecurity http,
            JwtService jwtService,
            UsuarioDetailsService detailsService,
            UsuarioRepository usuarioRepository,
            SignedCsrfTokenRepository csrfRepository,
            RevogacaoTokenService revogacao)
            throws Exception {

        CsrfTokenRequestAttributeHandler csrfHandler =
                new CsrfTokenRequestAttributeHandler();

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfRepository)
                .csrfTokenRequestHandler(csrfHandler)
            )

            .cors(Customizer.withDefaults())

            .sessionManagement(session -> session
                .sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable())
            .rememberMe(remember -> remember.disable())

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    HttpMethod.OPTIONS, "/**"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/auth/register",
                    "/api/auth/login"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/auth/csrf",
                    "/api/health"
                ).permitAll()

                .requestMatchers(
                    "/api/admin/**"
                ).hasRole("ADMIN")

                .anyRequest().authenticated()
            )

            .exceptionHandling(errors -> errors
                .authenticationEntryPoint(
                    (request, response, exception) ->
                        escreverErro(
                            response,
                            401,
                            "Faça login para continuar."
                        )
                )

                .accessDeniedHandler(
                    (request, response, exception) ->
                        escreverErro(
                            response,
                            403,
                            "Você não tem permissão para isso."
                        )
                )
            )

            .addFilterBefore(
                new JwtAuthenticationFilter(
                    jwtService,
                    detailsService,
                    usuarioRepository,
                    revogacao
                ),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            AppProperties props) {

        CorsConfiguration config = new CorsConfiguration();

        List<String> origens = props.cors()
            .origins()
            .stream()
            .map(String::trim)
            .filter(origem -> !origem.isBlank())
            .distinct()
            .toList();

        if (origens.isEmpty()) {
            throw new IllegalStateException(
                "Configure pelo menos uma origem CORS."
            );
        }

        for (String origem : origens) {
            if ("*".equals(origem)
                    || origem.contains("*")) {
                throw new IllegalStateException(
                    "CORS não permite origens com curingas."
                );
            }
        }

        config.setAllowedOrigins(origens);
        config.setAllowCredentials(true);

        config.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PATCH",
                "PUT",
                "DELETE",
                "OPTIONS"
            )
        );

        config.setAllowedHeaders(
            List.of(
                "Content-Type",
                "Accept",
                "X-XSRF-TOKEN"
            )
        );

        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/api/**",
            config
        );

        return source;
    }

    private static void escreverErro(
            HttpServletResponse response,
            int status,
            String mensagem)
            throws IOException {

        response.setStatus(status);

        response.setContentType(
            "application/json;charset=UTF-8"
        );

        response.setHeader(
            "Cache-Control",
            "no-store"
        );

        response.getWriter().write(
            "{\"erro\":\"" + mensagem + "\"}"
        );
    }
}