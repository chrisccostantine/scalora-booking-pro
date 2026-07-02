package com.scalora.bookingpro.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
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
        if (token == null || token.isBlank()) {
            chain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.subject(token);
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null && jwtService.isValid(token)) {
                var details = userDetailsService.loadUserByUsername(email);
                var auth = new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (RuntimeException ignored) {
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(request, response);
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
