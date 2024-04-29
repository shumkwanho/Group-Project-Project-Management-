\c project_manager

--test user
INSERT INTO users (
    username,
    email,
    password,
    first_name,
    last_name,
    organization,
    location,
    registration_date
)
VALUES (
    'user',
    'user@gmail.com',
    '$2a$10$eNN3ZN7quzTH8EVswwi7N.YoavDWdwpWKKvNSvXuKd0jKeSe7FtiK',
    --hashed password for '!1Qwertyuiop'
    'John',
    'Doe',
    'My Company',
    'Hong Kong',
    CURRENT_DATE
);

INSERT INTO users (
    username,
    email,
    password,
    profile_image,
    first_name,
    last_name,
    organization,
    location,
    registration_date
)
VALUES (
    'billsfyuen225',
    'billsfyuen@hotmail.com',
    '$2a$10$eNN3ZN7quzTH8EVswwi7N.YoavDWdwpWKKvNSvXuKd0jKeSe7FtiK',
    --hashed password for '!1Qwertyuiop'
    'mydog.jpg',
    'Bill',
    'Yuen',
    'Tecky',
    'Los Angeles',
    CURRENT_DATE
);

--test project
insert into projects (name, start_date,min_duration, image) values ('Alpha', '2024-04-01',25, 'example.jpg');
insert into projects (name, start_date,min_duration) values ('Delta', '2024-04-01',25);
insert into projects (name, start_date,min_duration) values ('Beta', '2024-04-01',25);
insert into projects (name, start_date,min_duration) values ('Gemma', '2024-04-01',25);
insert into projects (name, start_date,min_duration) values ('Pi', '2024-04-01',25);
insert into projects (name, start_date,min_duration) values ('Zeta', '2024-04-01',25);
insert into projects (name, start_date,min_duration) values ('Energy', '2024-04-01',25);
insert into user_project_relation (user_id, project_id) values (1, 1);
insert into user_project_relation (user_id, project_id) values (1, 2);
insert into user_project_relation (user_id, project_id) values (1, 3);
insert into user_project_relation (user_id, project_id) values (2, 1);
insert into user_project_relation (user_id, project_id) values (2, 2);
insert into user_project_relation (user_id, project_id) values (2, 3);
insert into user_project_relation (user_id, project_id) values (1, 4);
insert into user_project_relation (user_id, project_id) values (1, 5);
insert into user_project_relation (user_id, project_id) values (1, 6);
insert into user_project_relation (user_id, project_id) values (1, 7);


--project 10 taskname ,startdate , duration, dependencies
insert into tasks (project_id, name, duration, start_date) values (1, 'root task', 0,'2024-04-01');
insert into tasks (project_id, name, duration, start_date,pre_req_fulfilled) values (1, 'Sonair', 4,'2024-04-01',true);
insert into tasks (project_id, name, duration, start_date) values (1, 'Tres-Zap', 3,'2024-04-05');
insert into tasks (project_id, name, duration, start_date) values (1, 'Tin', 6,'2024-04-05');
insert into tasks (project_id, name, duration, start_date) values (1, 'Alpha', 4,'2024-04-11');
insert into tasks (project_id, name, duration, start_date) values (1, 'Bytecard', 1,'2024-04-08');
insert into tasks (project_id, name, duration, start_date) values (1, 'Regrant', 8,'2024-04-08');
insert into tasks (project_id, name, duration, start_date) values (1, 'Hatity', 3,'2024-04-08');
insert into tasks (project_id, name, duration, start_date) values (1, 'Mat Lam Tam', 6,'2024-04-11');
insert into tasks (project_id, name, duration, start_date) values (1, 'Transcof', 9,'2024-04-09');
insert into tasks (project_id, name, duration, start_date) values (1, 'Stringtough', 2,'2024-04-15');
insert into tasks (project_id, name, duration, start_date) values (1, 'Tampflex', 8,'2024-04-18');

-- project 10 task relation
insert into task_relation (task_id, pre_req_task_id) values (2, 1);
insert into task_relation (task_id, pre_req_task_id) values (3, 2);
insert into task_relation (task_id, pre_req_task_id) values (4, 2);
insert into task_relation (task_id, pre_req_task_id) values (5, 4);
insert into task_relation (task_id, pre_req_task_id) values (6, 3);
insert into task_relation (task_id, pre_req_task_id) values (7, 3);
insert into task_relation (task_id, pre_req_task_id) values (8, 3);
insert into task_relation (task_id, pre_req_task_id) values (9, 8);
insert into task_relation (task_id, pre_req_task_id) values (10, 6);
insert into task_relation (task_id, pre_req_task_id) values (11, 5);
insert into task_relation (task_id, pre_req_task_id) values (12, 10);
insert into task_relation (task_id, pre_req_task_id) values (12, 7);

--project 10 taskname ,startdate , duration, dependencies
insert into tasks (project_id, name, duration, start_date) values (2, 'root task', 0,'2024-04-01');
insert into tasks (project_id, name, duration, start_date) values (2, 'Sonair', 4,'2024-04-01');
insert into tasks (project_id, name, duration, start_date) values (2, 'Tres-Zap', 3,'2024-04-05');
insert into tasks (project_id, name, duration, start_date) values (2, 'Tin', 6,'2024-04-05');
insert into tasks (project_id, name, duration, start_date) values (2, 'Alpha', 4,'2024-04-11');
insert into tasks (project_id, name, duration, start_date) values (2, 'Bytecard', 1,'2024-04-08');
insert into tasks (project_id, name, duration, start_date) values (2, 'Regrant', 8,'2024-04-08');
insert into tasks (project_id, name, duration, start_date) values (2, 'Hatity', 3,'2024-04-08');
insert into tasks (project_id, name, duration, start_date) values (2, 'Mat Lam Tam', 6,'2024-04-11');
insert into tasks (project_id, name, duration, start_date) values (2, 'Transcof', 9,'2024-04-09');
insert into tasks (project_id, name, duration, start_date) values (2, 'Stringtough', 2,'2024-04-15');
insert into tasks (project_id, name, duration, start_date) values (2, 'Tampflex', 8,'2024-04-18');

--project 10 taskname ,startdate , duration, dependencies
insert into tasks (project_id, name, duration, start_date) values (3, 'root task', 0,'2024-04-01');
insert into tasks (project_id, name, duration, start_date) values (3, 'Sonair', 4,'2024-04-01');
insert into tasks (project_id, name, duration, start_date) values (3, 'Tres-Zap', 3,'2024-04-05');
insert into tasks (project_id, name, duration, start_date) values (3, 'Tin', 6,'2024-04-05');
insert into tasks (project_id, name, duration, start_date) values (3, 'Alpha', 4,'2024-04-11');
insert into tasks (project_id, name, duration, start_date) values (3, 'Bytecard', 1,'2024-04-08');
insert into tasks (project_id, name, duration, start_date) values (3, 'Regrant', 8,'2024-04-08');
insert into tasks (project_id, name, duration, start_date) values (3, 'Hatity', 3,'2024-04-08');
insert into tasks (project_id, name, duration, start_date) values (3, 'Mat Lam Tam', 6,'2024-04-11');
insert into tasks (project_id, name, duration, start_date) values (3, 'Transcof', 9,'2024-04-09');
insert into tasks (project_id, name, duration, start_date) values (3, 'Stringtough', 2,'2024-04-15');
insert into tasks (project_id, name, duration, start_date) values (3, 'Tampflex', 8,'2024-04-18');