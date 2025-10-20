package sk.team8.odborna_prax_api.filter;

import java.io.IOException;
import java.util.Collections;

import io.jsonwebtoken.JwtException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.service.JwtService;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                String email = jwtService.extractSubject(token);
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    User u = userRepository.findByEmail(email).orElse(null);
                    if (u != null && u.isActive()) {
                        var authority = new SimpleGrantedAuthority("ROLE_" + u.getRole().getName());
                        var authToken = new UsernamePasswordAuthenticationToken(
                                email, null, Collections.singletonList(authority));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid or expired token\"}");
                return;
            }

        }
        filterChain.doFilter(request, response);
    }
}
