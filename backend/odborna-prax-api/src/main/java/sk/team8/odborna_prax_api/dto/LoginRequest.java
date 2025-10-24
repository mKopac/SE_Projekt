package sk.team8.odborna_prax_api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @Email(message = "Email musí byť v platnom formáte")
    @NotBlank(message = "Email nesmie byť prázdny")
    private String email;

    @NotBlank(message = "Heslo nesmie byť prázdne")
    private String password;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
