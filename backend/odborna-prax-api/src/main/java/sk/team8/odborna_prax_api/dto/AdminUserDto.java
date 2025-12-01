package sk.team8.odborna_prax_api.dto;

public record AdminUserDto(
        int id,
        String firstName,
        String lastName,
        String email,
        boolean suspended
) {}
