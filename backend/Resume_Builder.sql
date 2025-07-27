CREATE TABLE "USER" (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_num VARCHAR(15)
);

CREATE TABLE ROLE (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE USER_ROLE (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES "USER"(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES ROLE(role_id) ON DELETE CASCADE
);

CREATE TABLE RESUME (
    resume_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES "USER"(user_id) ON DELETE CASCADE
);

CREATE TABLE ABOUT_INFO (
    about_id SERIAL PRIMARY KEY,
    resume_id INT NOT NULL,
    about_text TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);

CREATE TABLE EDUCATION (
    education_id SERIAL PRIMARY KEY,
    resume_id INT NOT NULL,
    institution_name VARCHAR(150),
    degree VARCHAR(100),
    start_date_edu DATE,
    end_date_edu DATE,
    grade_type VARCHAR(20) DEFAULT 'percentage',
    grade_value DECIMAL(5,2),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);

CREATE TABLE EXPERIENCE (
    experience_id SERIAL PRIMARY KEY,
    resume_id INT NOT NULL,
    job_title VARCHAR(100),
    company_name VARCHAR(100),
    start_date_ex DATE,
    end_date_ex DATE,
    ex_desc TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);

CREATE TABLE PROJECT (
    project_id SERIAL PRIMARY KEY,
    resume_id INT NOT NULL,
    project_name VARCHAR(150),
    tech_stack TEXT,
    proj_desc TEXT,
    proj_link TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);

CREATE TABLE CERTIFICATIONS (
    cert_id SERIAL PRIMARY KEY,
    resume_id INT NOT NULL,
    cert_name VARCHAR(150),
    issuer VARCHAR(100),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (resume_id) REFERENCES RESUME(resume_id) ON DELETE CASCADE
);
