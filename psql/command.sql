CREATE TABLE project_list (
    id SERIAL primary key,
    project_name VARCHAR(255) not null,
    photo VARCHAR(255),
    minimum_duration integer
);

insert into project_list (name) values ('project1')


select id from project_list order by id desc limit 1

-- date:yyyy-mm-dd

CREATE TABLE task_list_1 (
    id SERIAL primary key,
    info VARCHAR(255) not null,
    deadline date not null ,
    start_date date not null,
    finish_date date not null,
    pre_req_status boolean not null,
    comment VARCHAR(255),
    project_id integer default '1'
);

UPDATE project_list
SET name = req.body.projectName, photo = req.body.photo
WHERE id = req.body.id;