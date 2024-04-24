import { Router, Request, Response } from "express";
import { pgClient } from "../utils/pgClient";
import formidable from "formidable";
import { getTaskRelation } from "../utils/getTaskRelation";
import { getMinDuration } from "../utils/MinDuration";
export const projectRouter = Router()

projectRouter.get("/", inspectProject)
projectRouter.get("/user_relation", getUserTaskRelation)
projectRouter.post("/", createProject)
projectRouter.put("/", updateProject)
projectRouter.delete("/", deleteProject)
projectRouter.post("/init", initProject)

projectRouter.get("/get-users", inspectProjectUser)
projectRouter.post("/add-user", addProjectUser);
projectRouter.delete("/remove-user", removeProjectUser);

// request: project id
async function inspectProject(req: Request, res: Response) {
    try {
        const { id } = req.query
        const targetProject = (await pgClient.query(`select * from projects where id = $1`, [id])).rows[0]

        if (targetProject == undefined) {
            res.status(400).json({ message: "Cannot find target project" })
            return
        }
        const tasksOfTargetProject = (await pgClient.query(`select tasks.id, tasks.name,pre_req_fulfilled, tasks.start_date,duration,tasks.actual_finish_date from projects join tasks on project_id = projects.id where project_id = $1 ORDER BY tasks.id`, [id])).rows
        const usersOfTargetProject = (await pgClient.query(`select username, users.id from projects join user_project_relation on projects.id = project_id join users on users.id = user_id where projects.id = $1`, [id])).rows


        for (let task of tasksOfTargetProject) {
            const userTaskRelation = (await pgClient.query(`select username,users.id as userID,profile_image from tasks join user_task_relation on tasks.id = task_id join user_project_relation on user_project_relation.id = user_project_relation_id join users on user_id = users.id where tasks.id = $1;`, [task.id])).rows
            let taskRelation = await getTaskRelation(task.id!.toString())
            task.relation = taskRelation
            task.userRelation = userTaskRelation
        }

        targetProject.tasks = tasksOfTargetProject
        targetProject.users = usersOfTargetProject

        res.json({ data: targetProject })
        return
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }

}


async function getUserTaskRelation(req: Request, res: Response) {
    const tasks = await pgClient.query(`select `)
}


// request:project name,project photo -> create new project and project id  (if photo = null, dont pass into backendside
async function createProject(req: Request, res: Response) {
    try {

        const form = formidable({
            uploadDir: __dirname + "/../uploads/Project Photo",
            keepExtensions: true,
            minFileSize: 1,
            maxFiles: 1,
            allowEmptyFiles: true,
            filter: part => part.mimetype?.startsWith('image/') || false
        })


        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log(err);
                res.status(500).json({ message: "Internal Server Error" });
                return
            }

            let image: string
            const id = fields.id![0]
            let projectName = fields.projectName![0]

            //potential bug (wrong conditionn)
            if (!files.image) {
                image = ""
            } else {
                image = files.image[0].newFilename
            }

            let newProjectId = (await pgClient.query(`insert into projects (name,image) values ($1,$2) RETURNING id;`, [projectName, image])).rows[0].id
            await pgClient.query(`insert into user_project_relation (user_id,project_id) values ($1,$2);`, [id, newProjectId])

            res.json({
                message: "created new project",
                data: {
                    id: newProjectId,
                    projectName: projectName,
                    image: image == "" ? null : image
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

        const form = formidable({
            uploadDir: __dirname + "/../uploads/Project Photo",
            keepExtensions: true,
            minFileSize: 0,
            maxFiles: 1,
            allowEmptyFiles: true,
            filter: part => part.mimetype?.startsWith('image/') || false
        })

        form.parse(req, async (err, fields, files) => {
            const id = fields.id![0]
            const projectName = fields.projectName![0]
            const targetProject = (await pgClient.query(`select * from projects where id = $1`, [id])).rows[0]
            if (targetProject == undefined) {
                res.status(400).json({ message: "Cannot find target project" })
                return
            }

            if (files.image) {
                const image = files.image[0].newFilename

                await pgClient.query(
                    `UPDATE projects SET name = $1, image = $2 WHERE id = $3;`, [projectName, image, id])
            } else {
                await pgClient.query(
                    `UPDATE projects SET name = $1 WHERE id = $2;`, [projectName, id])
            }

            const updatedProjectInfo = (await pgClient.query(`SELECT * FROM projects where id = $1`, [id])).rows[0]
            res.json({ message: "project info updated", data: updatedProjectInfo });
        })
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
        await pgClient.query(`DELETE FROM user_project_relation where project_id = $1`, [id])

        res.json({ message: "Delete Successully" })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

async function initProject(req: Request, res: Response) {
    try {
        const newProject = (await pgClient.query(`insert into projects (name,start_date) values ($1,$2) returning *`, [req.body.name, req.body.start_date])).rows[0]

        let user = req.session.userId
        await pgClient.query(`insert into user_project_relation (user_id,project_id) values ($1,$2)`, [user, newProject.id])
        let tasks = req.body.tasks
        let rootId
        for (let i = 0; i <= Object.keys(tasks).length; i++) {
            if (i == 0) {
                rootId = (await pgClient.query(`insert into tasks (project_id, name, start_date, duration, actual_finish_date) values ($1,'root task',$2, 0,NOW()) returning *`, [newProject.id, req.body.start_date])).rows[0].id
                continue
            }
            const taskId = (await pgClient.query(`insert into tasks (project_id,name,start_date,duration) values ($1,$2,$3,$4) returning id`, [newProject.id, tasks[i].name, tasks[i].start_date, tasks[i].duration])).rows[0].id

            if ((tasks[i].pre_req).length > 0) {
                for (let relation of tasks[i].pre_req) {
                    await pgClient.query(`insert into task_relation (pre_req_task_id,task_id) values ($1,$2)`, [rootId + relation, taskId])
                }
            } else {
                await pgClient.query(`insert into task_relation (pre_req_task_id,task_id) values ($1,$2)`, [rootId, taskId])
                await pgClient.query(`update tasks set pre_req_fulfilled = true where id = $1`,[taskId])
            }
        }
        await pgClient.query(`insert into task_relation (task_id,pre_req_task_id) values ($1,$2)`, [rootId + 1, rootId])
        const addDurationIntoProj = (await pgClient.query(`update projects set min_duration = $1 where id = $2 returning *`, [await getMinDuration(rootId), newProject.id])).rows[0]

        res.json({ messgae: "init project sucessfully", data: addDurationIntoProj })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" })
    }

}

//can only perform in project page (get project id from query)
//response: array of user id in number
async function inspectProjectUser(req: Request, res: Response) {
    try {
        const project_id = req.query.id;

        //check existing users from project
        let checkQuery = (await pgClient.query(
            "SELECT user_id FROM user_project_relation WHERE project_id = $1",
            [project_id]
        )).rows;

        //gather users' info from users table
        let users = [];

        for (let obj of checkQuery) {
            let userQuery = (await pgClient.query(
                "SELECT id, username, profile_image FROM users WHERE id = $1",
                [obj.user_id]
            )).rows[0];

            users.push(userQuery)
        }

        res.json({
            message: "get users from project successful",
            data: users
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

//assign one new user to a project
//can only perform in project page (get project id from query)
//request: user id
async function addProjectUser(req: Request, res: Response) {
    try {
        const project_id = req.query.id;
        const user_id = req.body.userName;

        //check if relation already exist
        let checkQuery = (await pgClient.query(
            "SELECT * FROM user_project_relation WHERE user_id = $1 AND project_id = $2",
            [user_id, project_id]
        )).rows[0];

        if (checkQuery !== undefined) {
            //user project relation already exists
            res.status(400).json({
                message: "add new user to project failed",
                error: "user already assigned to project"
            });

        } else {
            //temporary all permission level are set to 0
            const permission_level = 0;

            let relationQueryResult = (await pgClient.query(
                "INSERT INTO user_project_relation (user_id, project_id, permission_level) VALUES ($1, $2, $3) RETURNING id",
                [user_id, project_id, permission_level]
            )).rows[0];

            res.json({
                message: "add new user to project successful",
                data: { user_project_relation_id: relationQueryResult.id }
            })
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    };

}

//remove existing user from a project
//can only perform in project page (get project id from query)
//request: user id
async function removeProjectUser(req: Request, res: Response) {
    try {
        
        const project_id = req.body.projectId;
        const userName = req.body.username? req.body.username : ""
        console.log("Project ID :",project_id);


        
        //check if relation exists
        let checkQuery = (await pgClient.query(
            "SELECT user_project_relation.id FROM user_project_relation join users on users.id = user_id WHERE (username = $1 or users.id = $1) AND project_id = $2",
            [userName, project_id]
        )).rows[0];

        if (checkQuery == undefined) {

            res.status(400).json({
                message: "remove user from project failed",
                error: "user is not assigned to project"
            });

        } else {

            let id = checkQuery.id;

            await pgClient.query("DELETE FROM user_project_relation WHERE id = $1", [id])

            res.json({ message: "remove user from project successful" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    };
}