import { Router, Request, Response } from "express";
import { projectType } from "../types"
import { pgClient } from "../pgClient";

export const projectRouter = Router()

projectRouter.get("/", inspectProject)
projectRouter.post("/", createProject)
projectRouter.put("/", updateProject)
projectRouter.delete("/", deleteProject)


function inspectProject(req: Request, res: Response) {
}


// request:project name,project photo -> create new project and project id
async function createProject(req: Request, res: Response) {
    try {
        let {projectName, photo} = req.body
        let newProjectQuery = await pgClient.query(`insert into project_list (name,photo) values ($1,$2);`, [projectName,photo])
        let newProjectId = (await pgClient.query(`select id from project_list order by id desc limit 1;`)).rows[0].id
        let createTaskListQuery = await pgClient.query(
        `CREATE TABLE task_list_${newProjectId} (
        id SERIAL primary key,
        info VARCHAR(255) not null,
        deadline date not null ,
        start_date date not null,
        finish_date date not null,
        pre_req_status boolean not null,
        comment VARCHAR(255),
        project_id integer default ${newProjectId}
    );`
        )
        req.body.id = newProjectId
        res.json({ message: "created new project and task table", data: req.body })       
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }

}

// request: project id, project name?, project photo?
async function updateProject(req: Request, res: Response) {
    try {
         const {id, projectName, photo} = req.body
    const updateProjectQuery = await pgClient.query(
        `UPDATE project_list SET name = $1, photo = $2 WHERE id = $3;`,[projectName,photo,id])
    const updatedProjectInfo = (await pgClient.query(`SELECT * FROM project_list where id = $1`,[id])).rows[0]

    res.json({message:"project info updated", data:updatedProjectInfo});
    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }
   
}

// request: project 
function deleteProject(req: Request, res: Response) {
    try {
        
    } catch (error) {
        
    }
}
