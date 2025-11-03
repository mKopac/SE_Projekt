package sk.team8.odborna_prax_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import sk.team8.odborna_prax_api.Entity.Address;
import sk.team8.odborna_prax_api.Entity.FieldOfStudy;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.AddressRepository;
import sk.team8.odborna_prax_api.dao.FieldOfStudyRepository;
import sk.team8.odborna_prax_api.dao.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final FieldOfStudyRepository fieldOfStudyRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, AddressRepository addressRepository,
                           FieldOfStudyRepository fieldOfStudyRepository) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.fieldOfStudyRepository = fieldOfStudyRepository;
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public void updateUser(String email, Map<String, Object> updates) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Používateľ s týmto emailom neexistuje."));

        // Aktualizácia základných údajov
        if (updates.containsKey("firstName")) {
            user.setFirstName((String) updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            user.setLastName((String) updates.get("lastName"));
        }
        if (updates.containsKey("emailAlternate")) {
            user.setEmailAlternate((String) updates.get("emailAlternate"));
        }
        if (updates.containsKey("phoneNumber")) {
            user.setPhoneNumber((String) updates.get("phoneNumber"));
        }

        if (updates.containsKey("street") || updates.containsKey("city") || updates.containsKey("zip")) {
            Address address = user.getAddress();
            if (address == null) {
                address = new Address();
            }

            if (updates.containsKey("street")) {
                String street = (String) updates.get("street");
                if (street == null || street.isBlank()) {
                    throw new IllegalArgumentException("Ulica nemôže byť prázdna.");
                }
                address.setStreet(street);
            }

            if (updates.containsKey("city")) {
                String city = (String) updates.get("city");
                if (city == null || city.isBlank()) {
                    throw new IllegalArgumentException("Mesto nemôže byť prázdne.");
                }
                address.setCity(city);
            }

            if (updates.containsKey("zip")) {
                String zip = (String) updates.get("zip");
                if (zip == null || zip.isBlank()) {
                    throw new IllegalArgumentException("PSČ nemôže byť prázdne.");
                }
                address.setZip(zip);
            }

            user.setAddress(address);
        }

        if (updates.containsKey("studyProgram")) {
            String fieldName = (String) updates.get("studyProgram");
            if (fieldName != null && !fieldName.isBlank()) {
                FieldOfStudy field = fieldOfStudyRepository.findByName(fieldName)
                        .orElseThrow(() -> new IllegalArgumentException("Neplatný odbor: " + fieldName));
                user.setFieldOfStudy(field);
            } else {
                user.setFieldOfStudy(null);
            }
        }

        userRepository.save(user);
    }

    @Override
    public User saveUser(User user) {
        Address address = user.getAddress();

        if (address != null) {
            if (address.getId() == 0) {
                address = addressRepository.save(address);
            } else {
                Optional<Address> existing = addressRepository.findById(address.getId());
                if (existing.isPresent()) {
                    Address a = existing.get();
                    a.setStreet(address.getStreet());
                    a.setCity(address.getCity());
                    a.setZip(address.getZip());
                    address = addressRepository.save(a);
                } else {
                    address = addressRepository.save(address);
                }
            }
            user.setAddress(address);
        }

        return userRepository.save(user);
    }

    @Override
    public Optional<User> findById(int id) {
        return userRepository.findById(id);
    }

    @Override
    public List<FieldOfStudy> getAllStudyPrograms() {
        return fieldOfStudyRepository.findAll();
    }
}
