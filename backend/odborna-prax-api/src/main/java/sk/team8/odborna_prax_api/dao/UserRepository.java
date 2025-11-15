package sk.team8.odborna_prax_api.dao;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import sk.team8.odborna_prax_api.Entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    boolean existsByRoleId(int roleId);

    List<User> findBySuspendedTrue();

    @Modifying
    @Transactional
    @Query(value = """
    DELETE FROM users
    WHERE active = 0
    AND created_at < NOW() - INTERVAL 1 DAY
    """, nativeQuery = true)
    int deleteInactiveOlderThan24h();

}
