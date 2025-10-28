package sk.team8.odborna_prax_api.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sk.team8.odborna_prax_api.Entity.Role;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.RoleRepository;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.dto.AdminRegisterRequest;

@Service
public class AdminRegistrationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminRegistrationService(UserRepository userRepository,
                                    RoleRepository roleRepository,
                                    PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void register(AdminRegisterRequest req) {

        if (req.getEmail() == null || !req.getEmail().contains("@")) {
            throw new IllegalArgumentException("Neplatný email");
        }
        if (req.getPassword() == null || req.getPassword().length() < 8) {
            throw new IllegalArgumentException("Heslo musí mať aspoň 8 znakov");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalStateException("Email už existuje");
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Rola ADMIN neexistuje"));


        User u = new User();
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setPhoneNumber(req.getPhoneNumber());
        u.setActive(true);
        u.setPasswordNeedsChange(false);
        u.setRole(adminRole);

        userRepository.save(u);
    }

}
