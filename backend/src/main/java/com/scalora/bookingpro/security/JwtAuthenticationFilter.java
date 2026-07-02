package com.scalora.bookingpro.security;

import com.scalora.bookingpro.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository users;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService, UserRepository users) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
        String sessionToken = firstPresent(
            request.getHeader("X-Session-Token"),
            request.getHeader("X-Session"),
            !isPublicRequest(request) ? request.getParameter("session") : null,
            !isPublicRequest(request) ? request.getParameter("sessionToken") : null
        );
        if (authenticateSession(sessionToken, request)) {
            chain.doFilter(request, response);
            return;
        }
        if (authenticateJwt(sessionToken, request)) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        String token = null;
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        } else {
            token = request.getHeader("X-Auth-Token");
        }
        if ((token == null || token.isBlank()) && !isPublicRequest(request)) {
            token = request.getParameter("access_token");
        }
        if ((token == null || token.isBlank()) && !isPublicRequest(request)) {
            token = request.getParameter("token");
        }
        if (token == null || token.isBlank()) {
            chain.doFilter(request, response);
            return;
        }

        authenticateJwt(token, request);
        chain.doFilter(request, response);
    }

    private boolean authenticateSession(String sessionToken, HttpServletRequest request) {
        if (sessionToken == null || sessionToken.isBlank() || SecurityContextHolder.getContext().getAuthentication() != null) {
            return false;
        }
        return users.findBySessionToken(sessionToken.trim()).map(user -> {
            var details = userDetailsService.loadUserByUsername(user.getEmail());
            var auth = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
            return true;
        }).orElse(false);
    }

    private boolean authenticateJwt(String token, HttpServletRequest request) {
        if (token == null || token.isBlank() || SecurityContextHolder.getContext().getAuthentication() != null) {
            return false;
        }
        try {
            String email = jwtService.subject(token.trim());
            if (email != null && jwtService.isValid(token.trim())) {
                String role = jwtService.role(token.trim());
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
                return true;
            }
        } catch (RuntimeException ignored) {
            SecurityContextHolder.clearContext();
        }
        return false;
    }

    private String firstPresent(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }

    private boolean isPublicRequest(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/public/")
            || path.startsWith("/api/businesses/")
            || path.equals("/api/auth/login")
            || path.equals("/api/services")
            || path.equals("/api/testimonials")
            || path.equals("/api/business-info")
            || path.equals("/api/bookings")
            || path.equals("/api/contact");
    }
}
