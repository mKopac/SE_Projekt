package sk.team8.odborna_prax_api.service;

import sk.team8.odborna_prax_api.Entity.TokenType;
import sk.team8.odborna_prax_api.Entity.AuthToken;
import sk.team8.odborna_prax_api.Entity.User;

import java.util.Optional;

public interface AuthTokenService {
    AuthToken createToken(User user, TokenType type, int expiryHours);
    Optional<AuthToken> validateToken(String token, TokenType type);
    void markTokenAsUsed(AuthToken token);
}