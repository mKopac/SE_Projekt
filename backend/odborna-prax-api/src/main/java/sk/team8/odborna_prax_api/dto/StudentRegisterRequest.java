package sk.team8.odborna_prax_api.dto;

public class StudentRegisterRequest {

    private String firstName;
    private String lastName;
    private String studentEmail;
    private String emailAlternate;

    private String password;
    private String phoneNumber;
    private Integer departmentId;
    private Integer fieldOfStudyId;

    private String address;
    private String city;
    private String zip;


    public StudentRegisterRequest() {}

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getEmailAlternate() {
        return emailAlternate;
    }

    public void setEmailAlternate(String emailAlternate) {
        this.emailAlternate = emailAlternate;
    }

    public String getLastName() {
        return lastName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public String getPassword() {
        return password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Integer getDepartmentId() {
        return departmentId;
    }

    public Integer getFieldOfStudyId() {
        return fieldOfStudyId;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public void setDepartmentId(Integer departmentId) {
        this.departmentId = departmentId;
    }

    public void setFieldOfStudyId(Integer fieldOfStudyId) {
        this.fieldOfStudyId = fieldOfStudyId;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }
}