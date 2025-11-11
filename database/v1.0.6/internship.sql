ALTER TABLE internship
ADD COLUMN mentor_id INT NULL AFTER company_id,
ADD CONSTRAINT fk_internship_mentor
    FOREIGN KEY (mentor_id) REFERENCES users(user_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
