package sk.team8.odborna_prax_api.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.dto.ChangePasswordRequest;
import sk.team8.odborna_prax_api.Entity.User;

@Service
public class PasswordChangeService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordChangeService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Nesprávne aktuálne heslo.");
        }

        if (!request.getNewPassword().equals(request.getRepeatNewPassword())) {
            throw new IllegalArgumentException("Nové heslá sa nezhodujú.");
        }

        if (request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("Heslo musí mať aspoň 8 znakov.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
