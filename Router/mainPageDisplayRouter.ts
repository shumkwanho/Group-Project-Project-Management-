import { Request, Response, Router } from "express";
import { pgClient } from "../utils/pgClient";

export const mainPageDisplayRouter = Router();

mainPageDisplayRouter.get('/main', getMainPageInfo)





function serverError(err: any, res: Response) {
    console.log(err)
    res.status(500).json({ message: 'Server internal error.' })
}





async function getUserInfo(userId: string) {
    return (await pgClient.query(
        `SELECT id, username, email, profile_image, last_login, registration_date FROM users WHERE id = $1`,
        [userId])).rows[0];
}

async function getCurrentProjects(userId: number) {
    return (await pgClient.query(`
    SELECT user_id, project_id, projects.name, projects.image, permission_level  
        FROM user_project_relation 
        INNER JOIN projects 
        ON project_id = projects.id
        WHERE user_id = $1`, [userId])).rows
}

async function getOverrunTask(projectId: number) {
    return (await pgClient.query(`
    SELECT project_id, tasks.id as task_id , tasks.name, 
        tasks.descreption, start_date, deadline, actual_finish_date
        FROM tasks INNER JOIN projects
        ON project_id = projects.id
        WHERE project_id = $1 
        AND (CURRENT_TIMESTAMP > deadline) 
        AND actual_finish_date ISNULL
        ORDER BY deadline ASC`, [projectId])).rows
}

async function getCurrentTask(projectId: number) {
    return (await pgClient.query(`
    SELECT project_id, tasks.id as task_id , tasks.name, 
        tasks.descreption, start_date, deadline, actual_finish_date
        FROM tasks INNER JOIN projects
        ON project_id = projects.id
        WHERE project_id = $1 
        AND (CURRENT_TIMESTAMP > start_date) 
        AND (CURRENT_TIMESTAMP < deadline) 
        AND actual_finish_date ISNULL
        ORDER BY deadline ASC`, [projectId])).rows
}

async function getAllFinishedProjects(userId: number) {
    return (await pgClient.query(`
    SELECT projects.id, name, image, finish_date
        FROM projects 
        INNER JOIN user_project_relation
        ON project_id = projects.id
        WHERE user_id = $1 AND CURRENT_TIMESTAMP > finish_date 
        ORDER BY finish_date DESC`, [userId])).rows
}

async function getMainPageInfo(req: Request, res: Response) {
    let { userId } = req.body;

    try {

        console.log(userId);
        let overrunTaskInfo = [];
        let currentTaskInfo = [];
        // let finishedProjectsInformation = [];

        let userInfo = await getUserInfo(userId);

        let allCurrentProjects = await getCurrentProjects(userId);
        for (let eachProject of allCurrentProjects) {

            let specificProjectId = eachProject.project_id
            console.log(specificProjectId);

            let allOverrunTasks = await getOverrunTask(specificProjectId);
            for (let eachOverrunTask of allOverrunTasks) {

                overrunTaskInfo.push(eachOverrunTask);
            }

            let allCurrentTasks = await getCurrentTask(specificProjectId);
            for (let eachCurrentTask of allCurrentTasks) {

                currentTaskInfo.push(eachCurrentTask);
            }
        }

        let allFinishedProjects = await getAllFinishedProjects(userId)


        res.json({
            userInfo: userInfo,
            projectInfo: allCurrentProjects,
            overrunTaskInfo: overrunTaskInfo,
            currentTaskInfo: currentTaskInfo,
            finishedProjects: allFinishedProjects
        })

    } catch (err) {
        serverError(err, res)
    }
}