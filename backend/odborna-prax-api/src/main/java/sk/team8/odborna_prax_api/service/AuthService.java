package sk.team8.odborna_prax_api.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.Entity.User;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final Set<String> blacklistedTokens = ConcurrentHashMap.newKeySet();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public String login(String email, String rawPassword) {
        String normalizedEmail = email == null ? null : email.trim();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nesprávny email alebo heslo"));

        if (!user.isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Účet nie je aktívny");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nesprávny email alebo heslo");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().getName());
        claims.put("uid", user.getId());

        return jwtService.generateToken(user.getEmail(), claims);
    }

    public void logout(String token) {
        if (jwtService.isValid(token)) {
            blacklistedTokens.add(token);
        }
    }

    public boolean isBlacklisted(String token) {
        return blacklistedTokens.contains(token);
    }
}
