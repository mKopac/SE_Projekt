package sk.team8.odborna_prax_api.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import sk.team8.odborna_prax_api.dao.UserRepository;

import java.time.LocalDateTime;

@Service
public class InactiveAccountCleanupService {

    private final UserRepository userRepository;

    public InactiveAccountCleanupService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Scheduled(cron = "0 0 * * * *")
    public void deleteInactiveAccounts() {
        int deleted = userRepository.deleteInactiveOlderThan24h();
        System.out.println(LocalDateTime.now() + " - Deleted inactive accounts: " + deleted);
    }
}