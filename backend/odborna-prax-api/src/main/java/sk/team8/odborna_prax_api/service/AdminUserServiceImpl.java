package sk.team8.odborna_prax_api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.dto.AdminUserDto;
import sk.team8.odborna_prax_api.service.AdminUserService;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;

    @Override
    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new AdminUserDto(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.isSuspended()
                ))
                .toList();
    }

    @Override
    public void suspendUser(int id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setSuspended(true);
            user.setSuspendedAt(Timestamp.from(Instant.now()));
            userRepository.save(user);
        });
    }

    @Override
    public void reactivateUser(int id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setSuspended(false);
            user.setSuspendedAt(null);
            userRepository.save(user);
        });
    }
}