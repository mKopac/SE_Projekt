package sk.team8.odborna_prax_api.service;

import lombok.RequiredArgsConstructor;
import sk.team8.odborna_prax_api.Entity.TokenType;
import org.springframework.stereotype.Service;
import sk.team8.odborna_prax_api.Entity.AuthToken;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.AuthTokenRepository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthTokenServiceImpl implements AuthTokenService {

    private final AuthTokenRepository authTokenRepository;

    @Override
    public AuthToken createToken(User user, TokenType type, int expiryHours) {
        AuthToken token = new AuthToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setType(type);
        token.setExpiryDate(LocalDateTime.now().plusHours(expiryHours));
        token.setUsed(false);
        return authTokenRepository.save(token);
    }

    @Override
    public Optional<AuthToken> validateToken(String tokenValue, TokenType type) {
        Optional<AuthToken> tokenOpt = authTokenRepository.findByTokenAndType(tokenValue, type);
        if (tokenOpt.isEmpty()) return Optional.empty();

        AuthToken token = tokenOpt.get();
        if (token.isExpired() || token.isUsed()) return Optional.empty();

        return Optional.of(token);
    }


    @Override
    public void markTokenAsUsed(AuthToken token) {
        token.setUsed(true);
        authTokenRepository.save(token);
    }
}