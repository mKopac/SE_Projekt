package sk.team8.odborna_prax_api.dto;

import java.sql.Date;

public class CreateInternshipRequest {
    public int companyId;
    public Integer mentorId;
    public String academicYear;
    public int semester;
    public Date dateStart;
    public Date dateEnd;
    public String description;
    public String internshipType;
}
