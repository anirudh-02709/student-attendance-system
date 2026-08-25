package com.student.attendance.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.student.attendance.model.Role;
import com.student.attendance.security.JwtAuthenticationFilter;
import jakarta.servlet.DispatcherType;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
            AuthenticationProvider authenticationProvider,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> response.sendError(401))
                        .accessDeniedHandler((request, response, exception) -> response.sendError(401)))
                .authenticationProvider(authenticationProvider)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(request -> "/auth/login".equals(request.getServletPath())).permitAll()
                        .requestMatchers(request -> "/student/login".equals(request.getServletPath())).permitAll()

                        .requestMatchers(request -> request.getServletPath().startsWith("/student/"))
                        .hasRole(Role.STUDENT.name())

                        .requestMatchers(request -> "/students/marks".equals(request.getServletPath()))
                        .hasAnyRole(Role.STUDENT.name(), Role.FACULTY.name())

                        .requestMatchers(request -> request.getServletPath().startsWith("/students"))
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.POST, "/attendance")
                        .hasAnyRole(Role.STUDENT.name(), Role.FACULTY.name())

                        .requestMatchers(HttpMethod.GET, "/attendance", "/attendance/**")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.PUT, "/attendance/**")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.DELETE, "/attendance/**")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.POST, "/announcements")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.GET, "/announcements")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.PUT, "/announcements/**")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.DELETE, "/announcements/**")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.GET, "/announcements/student")
                        .hasRole(Role.STUDENT.name())

                        .requestMatchers(HttpMethod.POST, "/holidays", "/holidays/**")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.PUT, "/holidays/**")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.DELETE, "/holidays/**")
                        .hasRole(Role.FACULTY.name())

                        .requestMatchers(HttpMethod.GET, "/holidays", "/holidays/**")
                        .hasAnyRole(Role.STUDENT.name(), Role.FACULTY.name())

                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()

                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
