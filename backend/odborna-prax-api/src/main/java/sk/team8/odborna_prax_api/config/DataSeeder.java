package sk.team8.odborna_prax_api.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import sk.team8.odborna_prax_api.Entity.Department;
import sk.team8.odborna_prax_api.Entity.Role;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.DepartmentRepository;
import sk.team8.odborna_prax_api.dao.RoleRepository;
import sk.team8.odborna_prax_api.dao.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Component
public class DataSeeder {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository, DepartmentRepository departmentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostConstruct
    public void seedAdmin() {
        Optional<Role> adminRoleOpt = roleRepository.findById(3);
        if (adminRoleOpt.isEmpty()) {
            System.out.println("⚠️  Admin role (ID 3) not found. Skipping admin seeding.");
            return;
        }

        boolean adminExists = userRepository.existsByRoleId(3);
        if (adminExists) {
            System.out.println("Admin account already exists. Skipping seeding.");
            return;
        }

        Role adminRole = adminRoleOpt.get();

        Optional<Department> departmentOpt = departmentRepository.findById(1);
        if (departmentOpt.isEmpty()) {
            System.out.println("⚠️  Department (ID 1) not found. Skipping admin seeding.");
            return;
        }

        Department department = departmentOpt.get();

        User admin = new User();
        admin.setFirstName("System");
        admin.setLastName("Administrator");
        admin.setEmail("admin@system.local");
        admin.setEmailAlternate(null);
        admin.setPassword(passwordEncoder.encode("Admin123"));
        admin.setPhoneNumber("+421123456789");
        admin.setActive(true);
        admin.setPasswordNeedsChange(false);
        admin.setPasswordNeedsChange(true);
        admin.setRole(adminRole);
        admin.setDepartment(department);

        userRepository.save(admin);

        System.out.println("Default admin account created: email= " + admin.getEmail() + "password= " + admin.getPassword());
    }
}
