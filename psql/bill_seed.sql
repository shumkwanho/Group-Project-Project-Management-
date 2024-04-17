\c project_manager;

INSERT INTO users (
    username,
    email,
    password,
    profile_image,
    last_login,
    registration_date
)
VALUES (
    'user',
    'user@gmail.com',
    '$2a$10$r8xSUf9C4lG0ubOpWbMJH.LjoNVv6KgLxyqFWK8UxTmUmA6fD5hNa',
    --hashed password for '1234'
    'mydog.jpg',
    CURRENT_TIMESTAMP,
    CURRENT_DATE
);