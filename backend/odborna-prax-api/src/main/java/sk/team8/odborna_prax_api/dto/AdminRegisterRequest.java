package sk.team8.odborna_prax_api.dto;

public class AdminRegisterRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String referralCode;
    private String phoneNumber;

    public AdminRegisterRequest() {
    }

    public AdminRegisterRequest(String firstName, String lastName, String email, String password, String referralCode, String phoneNumber) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.referralCode = referralCode;
        this.phoneNumber = phoneNumber;
    }

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

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

    public String getReferralCode() {
        return referralCode;
    }
    public void setReferralCode(String referralCode) {
        this.referralCode = referralCode;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    @Override
    public String toString() {
        return "AdminRegisterRequest{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", referralCode='" + referralCode + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                '}';
    }
}
