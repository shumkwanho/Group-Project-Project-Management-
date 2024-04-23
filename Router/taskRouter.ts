import { Router, Request, Response, response } from "express";
import { pgClient } from "../utils/pgClient";
import { getTaskRelation } from "../utils/getTaskRelation";
import { getMinDuration } from "../utils/MinDuration";

export const taskRouter = Router()

taskRouter.get("/", inspectTask)
taskRouter.get("/all", inspectAllTask)
taskRouter.post("/", createTask)
taskRouter.post("/relation", createTaskRelation)
taskRouter.put("/", updateTask)
taskRouter.delete("/relation", deleteTaskRelation)
taskRouter.delete("/", deleteTask)

//request taskId
async function inspectTask(req: Request, res: Response) {
    try {
        let targetId = req.query.id
        const targetTask = (await pgClient.query(`select * from tasks where tasks.id = $1 `, [req.query.id])).rows[0]
        let taskRelation = await getTaskRelation(targetId!.toString())
        if (targetTask == undefined) {
            res.status(400).json({ message: "Cannot find target task" })
            return
        }
        targetTask.relation = taskRelation
        res.json({ data: targetTask })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

async function inspectAllTask(req: Request, res: Response) {
    try {
        let projectId = req.query.id
        const taskResult = (await pgClient.query(`select id, name,start_date,actual_finish_date from tasks where project_id = $1 order by id`, [projectId])).rows
        const userResult = (await pgClient.query(`select username, users.id,profile_image from projects join user_project_relation on projects.id = project_id join users on users.id = user_id where projects.id = $1`, [projectId])).rows
        const result = {tasks:taskResult, users:userResult}
        
        res.json({messgae:"get Successfully",data:result})

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


// request projectId, taskName,description,deadline,StartDate,duration,PreReqTask
async function createTask(req: Request, res: Response) {
    try {

        let { projectId, taskName, startDate, duration } = req.body
        const targetProject = (await pgClient.query(`select * from projects where id = $1`, [projectId])).rows[0]
        if (targetProject == undefined) {
            res.status(400).json({ message: "Cannot find target project" })
            return
        }
        const newTask = (await pgClient.query(`insert into tasks (project_id, name, start_date, duration) VALUES ($1,$2,$3,$4) returning *`, [projectId, taskName, startDate, duration])).rows[0]

        // check duration affected
        res.json({ message: "create new task successfully", data: newTask })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })

    }
}

async function createTaskRelation(req: Request, res: Response) {
    const { preTask, taskId } = req.body
    await pgClient.query(`insert into task_relation (task_id, pre_req_task_id) values ($1,$2)`, [taskId, preTask])
    res.json({ message: "update sucessfully" })
}


// id, name,description,duration,start_date,deadline
async function updateTask(req: Request, res: Response) {
    try {
        const { taskId, taskName, duration, startDate, finishDate } = req.body
        if (finishDate == "finished") {
            await pgClient.query(`UPDATE tasks SET actual_finish_date = NOW() where id = $1`, [taskId])
        } else {
            await pgClient.query(`UPDATE tasks SET actual_finish_date = null where id = $1`, [taskId])
        }

        const updatedTask = (await pgClient.query(`UPDATE tasks SET name = $1,duration = $2,start_date = $3 WHERE id = $4 returning *`, [taskName, duration, startDate, taskId])).rows[0]
        checkpreReqTask(taskId)
        res.json({ message: "updated successfully", data: updatedTask })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

async function deleteTaskRelation(req: Request, res: Response) {
    try {
        const { preTask, taskId } = req.body

        await pgClient.query(`DELETE FROM task_relation where task_id = $1 and pre_req_task_id = $2`, [taskId, preTask])
        // check duration affected
        res.json({ message: "Delete Successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }

}

//request: taskId
async function deleteTask(req: Request, res: Response) {
    try {
        await pgClient.query(`DELETE FROM task_relation where task_id = $1 or pre_req_task_id = $1`, [req.body.taskId])
        await pgClient.query(`DELETE FROM tasks where id = $1`, [req.body.taskId])
        // check duration affected
        res.json({ message: "Delete Successfully" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }

}



async function changeProjectDuration(projectId: string) {
    const rootTaskId = await getRootTask(projectId)
    const currentDuration = (await pgClient.query(`select min_duration from projects where id = $1`, [projectId])).rows[0]
    const newDuration = await getMinDuration(rootTaskId)
    let temp = [currentDuration, newDuration]
    let result = Math.max(...temp)
    await pgClient.query(`UPDATE projects SET duration = $1 WHERE id = $2`, [result, projectId])
    return
}

async function getRootTask(projectId: string) {
    const rootTaskId = (await pgClient.query(`select id from tasks where project_id = $1 order by id ASC LIMITED 1`, [projectId])).rows[0].id
    return rootTaskId
}

async function checkpreReqTask(taskId: string) {
    const data = (await pgClient.query(`select task_id from task_relation where pre_req_task_id = $1`, [taskId])).rows
    const postTasks = data.map((elem) => { return elem.task_id })

    for (let postTask of postTasks) {
        const preTasks = (await pgClient.query(`select pre_req_task_id from task_relation where task_id = $1`, [postTask])).rows
        for (let preTask of preTasks) {
            const checkPreTask = (await pgClient.query(`select actual_finish_date from tasks where id = $1`, [preTask.pre_req_task_id])).rows
            const checkCondition = checkPreTask.filter((elem) => { return !elem.actual_finish_date })
            await pgClient.query(`update tasks set pre_req_fulfilled = ${checkCondition.length == 0} where id = $1`, [postTask])

        }
    }
}

