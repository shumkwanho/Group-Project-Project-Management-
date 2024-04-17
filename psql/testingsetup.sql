DROP TABLE IF EXISTS project_manager;
DROP DATABASE project_manager;
CREATE DATABASE project_manager;

\c project_manager
CREATE TABLE "task_relation"(
    "id" SERIAL,
    "task_id" BIGINT,
    "pre_req_task_id" BIGINT
);

ALTER TABLE
    "task_relation" ADD PRIMARY KEY("id");

CREATE TABLE "tasks"(
    "id" SERIAL,
    "project_id" BIGINT,
    "name" VARCHAR(255),
    "description" VARCHAR(255),
    "pre_req_fulfilled" BOOLEAN,
    "start_date" DATE,
    "duration" BIGINT,
    "actual_finish_date" DATE
);

ALTER TABLE
    "tasks" ADD PRIMARY KEY("id");

CREATE TABLE "user_task_relation"(
    "id" SERIAL,
    "user_project_relation_id" BIGINT,
    "task_id" BIGINT
);

ALTER TABLE
    "user_task_relation" ADD PRIMARY KEY("id");

CREATE TABLE "messages"(
    "id" SERIAL,
    "user_id" BIGINT,
    "project_id" BIGINT,
    "content" VARCHAR(255),
    "created_at" TIMESTAMP(0) WITH TIME ZONE,
    "edited_at" TIMESTAMP(0) WITH TIME ZONE
);

ALTER TABLE
    "messages" ADD PRIMARY KEY("id");

CREATE TABLE "projects"(
    "id" SERIAL,
    "name" VARCHAR(255),
    "image" VARCHAR(255),
    "min_duration" BIGINT
);

ALTER TABLE
    "projects" ADD PRIMARY KEY("id");

CREATE TABLE "users"(
    "id" SERIAL,
    "username" VARCHAR(255),
    "email" VARCHAR(255),
    "password" VARCHAR(255),
    "profile_image" VARCHAR(255),
    "last_login" TIMESTAMP(0) WITH TIME ZONE,
    "registration_date" DATE
);

ALTER TABLE
    "users" ADD PRIMARY KEY("id");

ALTER TABLE
    "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");

ALTER TABLE
    "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");

CREATE TABLE "user_project_relation"(
    "id" SERIAL,
    "user_id" BIGINT,
    "project_id" BIGINT,
    "permission_level" BIGINT
);

ALTER TABLE
    "user_project_relation" ADD PRIMARY KEY("id");
ALTER TABLE
    "task_relation" ADD CONSTRAINT "task_relation_task_id_foreign" FOREIGN KEY("task_id") REFERENCES "tasks"("id");
ALTER TABLE
    "user_project_relation" ADD CONSTRAINT "user_project_relation_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "user_project_relation" ADD CONSTRAINT "user_project_relation_project_id_foreign" FOREIGN KEY("project_id") REFERENCES "projects"("id");
ALTER TABLE
    "user_task_relation" ADD CONSTRAINT "user_task_relation_user_project_relation_id_foreign" FOREIGN KEY("user_project_relation_id") REFERENCES "user_project_relation"("id");
ALTER TABLE
    "messages" ADD CONSTRAINT "messages_project_id_foreign" FOREIGN KEY("project_id") REFERENCES "projects"("id");
ALTER TABLE
    "messages" ADD CONSTRAINT "messages_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "users"("id");
ALTER TABLE
    "task_relation" ADD CONSTRAINT "task_relation_pre_req_task_id_foreign" FOREIGN KEY("pre_req_task_id") REFERENCES "tasks"("id");
ALTER TABLE
    "tasks" ADD CONSTRAINT "tasks_project_id_foreign" FOREIGN KEY("project_id") REFERENCES "projects"("id");
ALTER TABLE
    "user_task_relation" ADD CONSTRAINT "user_task_relation_task_id_foreign" FOREIGN KEY("task_id") REFERENCES "tasks"("id");

\c project_manager
