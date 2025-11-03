package sk.team8.odborna_prax_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OdbornaPraxApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(OdbornaPraxApiApplication.class, args);
	}

}
