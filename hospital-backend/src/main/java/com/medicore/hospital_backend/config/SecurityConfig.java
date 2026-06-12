package com.medicore.hospital_backend.config;

import com.medicore.hospital_backend.filter.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            UserDetailsService userDetailsService
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {})

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        .requestMatchers("/api/auth/**").permitAll()

                        .requestMatchers("/api/admin/**")
                        .hasAuthority("ADMIN")

                        .requestMatchers("/api/doctors/**", "/api/doctors")
                        .hasAnyAuthority("ADMIN", "DOCTOR")

                        .requestMatchers("/api/patients/**", "/api/patients")
                        .hasAnyAuthority("ADMIN", "DOCTOR", "RECEPTIONIST")

                        .requestMatchers("/api/appointments/**", "/api/appointments")
                        .hasAnyAuthority(
                                "ADMIN",
                                "DOCTOR",
                                "RECEPTIONIST",
                                "PATIENT"
                        )

                        .requestMatchers("/api/medical-records/**", "/api/medical-records")
                        .hasAnyAuthority("ADMIN", "DOCTOR", "PATIENT")

                        .requestMatchers("/api/chat/**", "/api/chat")
                        .hasAnyAuthority("ADMIN", "DOCTOR", "PATIENT")

                        .requestMatchers("/api/test-results/**", "/api/test-results")
                        .hasAnyAuthority("ADMIN", "DOCTOR", "PATIENT")

                        .requestMatchers("/uploads/test-results/**").permitAll()

                        .requestMatchers("/api/bills/**")
                        .hasAnyAuthority("ADMIN", "RECEPTIONIST")

                        .requestMatchers("/api/medicines/**", "/api/medicines")
                        .hasAnyAuthority("ADMIN", "RECEPTIONIST")

                        .requestMatchers("/api/dashboard/**")
                        .hasAnyAuthority("ADMIN", "DOCTOR", "RECEPTIONIST")

                        .requestMatchers("/api/doctor-shifts/**")
                        .hasAnyAuthority("ADMIN")

                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        .anyRequest().authenticated()
                )

                .authenticationProvider(authenticationProvider())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .formLogin(form -> form.disable())

                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}