import { Router, Request, Response } from "express";
import { projectType } from "../utils/types"
import { pgClient } from "../utils/pgClient";
import formidable from "formidable";

export const projectRouter = Router()

projectRouter.get("/", inspectProject)
projectRouter.post("/", createProject)
projectRouter.put("/", updateProject)
projectRouter.delete("/", deleteProject)

// request: project id
async function inspectProject(req: Request, res: Response) {
    try {
        const  id  = req.body.id
        const targetProject = (await pgClient.query(`select * from projects where id = $1`, [id])).rows[0]
        if (targetProject == undefined) {
            res.status(400).json({ message: "Cannot find target project" })
            return
        }
        const tasksOfTargetProject = (await pgClient.query(`select * from tasks where project_id = $1`, [id])).rows
        // // const usersOfTargetProject = (await pgClient.query(`select * from users where project_id = $1`, [id])).rows

        targetProject.tasks = tasksOfTargetProject
        // targetProject.users = usersOfTargetProject
        res.json({ data: targetProject })
        return
    } catch (error) {
        console.log(error);        
        res.status(500).json({ message: "Internal Server Error" })
    }

}


// request:project name,project photo -> create new project and project id  (if photo = null, dont pass into backendside
async function createProject(req: Request, res: Response) {
    try {
        const form = formidable({
            uploadDir: __dirname + "/../uploads/Project Photo",
            keepExtensions: true,
            minFileSize: 1024,
            maxFiles: 1,
            allowEmptyFiles: true,
            filter: part => part.mimetype?.startsWith('image/') || false
        })


        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.status(500).json({ message: err });
                return
            }
            let image: string
            let projectName = fields.projectName![0]
            if (!files.image) {
                image = ""
            } else {
                image = files.image[0].newFilename
            }



            let newProjectQuery = await pgClient.query(`insert into projects (name,image) values ($1,$2);`, [projectName, image])
            let newProjectId = (await pgClient.query(`select id from projects order by id desc limit 1;`)).rows[0].id


            res.json({
                message: "created new project",
                data: {
                    id: newProjectId,
                    projectName: projectName,
                    image: image == ""? null:image
                }
            })
        })

    } catch (error) {
        console.log(error);        
        res.status(500).json({ message: "Internal Server Error" })
    }

}

// request: project id, project name?, project photo?
async function updateProject(req: Request, res: Response) {
    try {
        const { id, projectName, image } = req.body
        const targetProject = (await pgClient.query(`select * from projects where id = $1`, [id])).rows[0]
        if (targetProject == undefined) {
            res.status(400).json({ message: "Cannot find target project" })
            return
        }
        const updateProjectQuery = await pgClient.query(
            `UPDATE projects SET name = $1, image = $2 WHERE id = $3 RETURNING *;`, [projectName, image, id])
        const updatedProjectInfo = (await pgClient.query(`SELECT * FROM projects where id = $1`, [id])).rows[0]

        res.json({ message: "project info updated", data: updatedProjectInfo });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }

}

// request: project id or project name, 
async function deleteProject(req: Request, res: Response) {
    try {
        let id = req.body.id
        const targetProject = (await pgClient.query(`select * from projects where id = $1`, [id])).rows[0]
        if (targetProject == undefined) {
            res.status(400).json({ message: "Cannot find target project" })
            return
        }
        await pgClient.query(`DELETE FROM tasks where project_id = $1`, [id])
        await pgClient.query(`DELETE FROM messages where project_id = $1`, [id])
        await pgClient.query(`DELETE FROM projects where id = $1`, [id])
        await pgClient.query(`DELETE FROM user_project_relation where id = $1`, [id])

        res.json({ message: "Delete Successully" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error })
    }
}


async function getPermissionLevel (projectId) {
    const result = await pgClient.query(`Select * from users left outer join user_project_relation where project_id = ${projectId}`)
} 