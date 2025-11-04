package sk.team8.odborna_prax_api.service;

import sk.team8.odborna_prax_api.Entity.Department;
import sk.team8.odborna_prax_api.Entity.FieldOfStudy;
import sk.team8.odborna_prax_api.Entity.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserService {
    User findByEmail(String email);

    void updateUser(String email, Map<String, Object> updates);

    User saveUser(User user);

    Optional<User> findById(int id);

    List<FieldOfStudy> getAllStudyPrograms();

    List<Department> getAllDepartments();
}
