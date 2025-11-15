package sk.team8.odborna_prax_api.service;

import sk.team8.odborna_prax_api.dto.AdminUserDto;
import java.util.List;

public interface AdminUserService {

    List<AdminUserDto> getAllUsers();

    void suspendUser(int id);

    void reactivateUser(int id);
}
