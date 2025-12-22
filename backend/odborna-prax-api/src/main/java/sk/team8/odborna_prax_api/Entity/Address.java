package sk.team8.odborna_prax_api.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "address")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idaddress")
    private int id;

    @Column(name = "street", length = 50, nullable = false)
    private String street;

    @Column(name = "city", length = 45, nullable = false)
    private String city;

    @Column(name = "zip", length = 5, nullable = false)
    private String zip;


    @OneToMany(mappedBy = "address")
    @JsonBackReference("user-address")
    private List<User> users;

    @OneToMany(mappedBy = "address")
    @JsonBackReference("company-address")
    private List<Company> companies;

    public Address() {}

    public Address(String street, String city, String zip) {
        this.street = street;
        this.city = city;
        this.zip = zip;
    }

    public int getId() { return id; }

    public void setId(int id) { this.id = id; }

    public String getStreet() { return street; }

    public void setStreet(String street) { this.street = street; }

    public String getCity() { return city; }

    public void setCity(String city) { this.city = city; }

    public String getZip() { return zip; }

    public void setZip(String zip) { this.zip = zip; }

    public List<User> getUsers() { return users; }

    public void setUsers(List<User> users) { this.users = users; }

    public List<Company> getCompanies() { return companies; }

    public void setCompanies(List<Company> companies) { this.companies = companies; }

    @Override
    public String toString() {
        return street + ", " + city + " " + zip;
    }
}
