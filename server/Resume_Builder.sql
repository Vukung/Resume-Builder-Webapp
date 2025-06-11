CREATE DATABASE IF NOT EXISTS resume_builder;
USE resume_builder_database;

USER Table
CREATE TABLE USER (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_num VARCHAR(15),
    profile_pic TEXT
);

ROLE Table
CREATE TABLE ROLE (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

USER_ROLE (Many-to-One Mapping)
CREATE TABLE USER_ROLE (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES ROLE(role_id) ON DELETE CASCADE
);

--- - RESUME Table
CREATE TABLE RESUME (
    resume_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES USER(user_id) ON DELETE CASCADE
);

-- -- ABOUT_INFO Table
CREATE TABLE ABOUT_INFO (
    about_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    about_text TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);

-- -- EDUCATION Table
CREATE TABLE EDUCATION (
    education_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    institution_name VARCHAR(150),
    degree VARCHAR(100),
    start_date_edu DATE,
    end_date_edu DATE,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);

-- -- EXPERIENCE Table
CREATE TABLE EXPERIENCE (
    experience_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    job_title VARCHAR(100),
    company_name VARCHAR(100),
    start_date_ex DATE,
    end_date_ex DATE,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);

-- -- PROJECT Table
CREATE TABLE PROJECT (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    project_name VARCHAR(150),
    tech_stack TEXT,
    proj_desc TEXT,
    proj_link TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);

-- CERTIFICATIONS Table
CREATE TABLE CERTIFICATIONS (
    cert_id INT AUTO_INCREMENT PRIMARY KEY,
    resume_id INT NOT NULL,
    cert_name VARCHAR(150),
    issuer VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);
