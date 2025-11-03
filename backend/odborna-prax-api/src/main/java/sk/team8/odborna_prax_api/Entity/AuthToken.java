package sk.team8.odborna_prax_api.Entity;

import jakarta.persistence.*;
import sk.team8.odborna_prax_api.Entity.TokenType;

import java.time.LocalDateTime;

@Entity
public class AuthToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true)
    private String token;

    @Enumerated(EnumType.STRING)
    private TokenType type;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(columnDefinition = "TINYINT(1)")
    private boolean used = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isExpired() {
        return expiryDate.isBefore(LocalDateTime.now());
    }

    public Integer getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public TokenType getType() { return type; }
    public void setType(TokenType type) { this.type = type; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
