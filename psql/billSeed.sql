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

INSERT INTO users (
    username,
    email,
    password,
    profile_image,
    last_login,
    registration_date
)
VALUES (
    'billsfyuen225',
    'billsfyuen@hotmail.com',
    '$2a$10$r8xSUf9C4lG0ubOpWbMJH.LjoNVv6KgLxyqFWK8UxTmUmA6fD5hNa',
    --hashed password for '1234'
    'mydog.jpg',
    CURRENT_TIMESTAMP,
    CURRENT_DATE
);

insert into projects (name, min_duration) values ('Redhold', 19);
insert into projects (name, min_duration) values ('Alpha', 46);
insert into projects (name, min_duration) values ('Bigtax', 23);
insert into projects (name, min_duration) values ('Overhold', 35);

insert into user_project_relation (user_id, project_id) values (1, 1);
insert into user_project_relation (user_id, project_id) values (2, 1);