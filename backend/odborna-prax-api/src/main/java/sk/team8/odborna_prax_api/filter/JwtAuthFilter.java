package sk.team8.odborna_prax_api.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.service.JwtService;
import sk.team8.odborna_prax_api.service.AuthService;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AuthService authService;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository, AuthService authService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/external/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String auth = request.getHeader("Authorization");

        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                if (jwtService.isValid(token) && !authService.isBlacklisted(token)) {
                    String email = jwtService.extractSubject(token);

                    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        Optional<User> opt = userRepository.findByEmail(email);
                        if (opt.isPresent()) {
                            User u = opt.get();
                            if (u.isActive()) {
                                String roleName = (u.getRole() != null && u.getRole().getName() != null)
                                        ? u.getRole().getName().toUpperCase()
                                        : "USER";
                                var authority = new SimpleGrantedAuthority("ROLE_" + roleName);
                                var authToken = new UsernamePasswordAuthenticationToken(
                                        email, null, Collections.singletonList(authority));
                                SecurityContextHolder.getContext().setAuthentication(authToken);
                            }
                        }
                    }
                } else {
                    SecurityContextHolder.clearContext();
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Invalid, expired, or blacklisted token\"}");
                    return;
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Invalid, expired, or blacklisted token\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
