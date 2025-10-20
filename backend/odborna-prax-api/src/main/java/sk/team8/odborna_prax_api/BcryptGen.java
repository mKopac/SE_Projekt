package sk.team8.odborna_prax_api;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptGen {
    public static void main(String[] args) {
        System.out.println(new BCryptPasswordEncoder().encode("12345678"));

    }
}
