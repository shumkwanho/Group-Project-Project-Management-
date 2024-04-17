import { Router, Request, Response } from "express";
import { pgClient } from "../utils/pgClient";
import { getTaskRelation } from "../utils/getTaskRelation";
import { getMinDuration } from "../utils/MinDuration";

export const taskRouter = Router()

taskRouter.get("/", inspectTask)
taskRouter.post("/", createNewTask)
taskRouter.put("/", updateTask)
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

// request projectId, taskName,description,deadline,StartDate,duration,PreReqTask
async function createNewTask(req: Request, res: Response) {
    try {
        let { projectId, taskName, description, deadline, startDate, duration, preReqTask } = req.body
        const targetProject = (await pgClient.query(`select * from projects where id = $1`, [projectId])).rows[0]
        if (targetProject == undefined) {
            res.status(400).json({ message: "Cannot find target project" })
            return
        }
        const newTask = (await pgClient.query(`insert into tasks (project_id, name, description, deadline, start_date, duration) VALUES ($1,$2,$3,$4,$5,$6) returning *`,[projectId,taskName,description,deadline,startDate,duration])).rows[0]

        
        if (preReqTask) {
            preReqTask = JSON.parse(preReqTask).map((number: any) => Number(number))
            for (let relation of preReqTask){
                await pgClient.query(`insert into task_relation (task_id,pre_req_task_id) values ($1,$2)`,[newTask.id,relation])
            }
        }
        // check duration affected
        res.json({message:"create new task successfully",data:newTask})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })

    }
}
// id, name,description,duration,start_date,deadline
async function updateTask(req: Request, res: Response) {

    try {
        const {taskId, taskName,description,duration,startDate,deadline} = req.body
    if(taskName){
        await pgClient.query(`UPDATE tasks SET name = $1 WHERE id = $2`,[taskName,taskId])
    }
    if(description){
        await pgClient.query(`UPDATE tasks SET description = $1 WHERE id = $2`,[description,taskId])
    }
    if(duration){
        await pgClient.query(`UPDATE tasks SET duration = $1 WHERE id = $2`,[duration,taskId])
        // check duration affected
    }
    if(startDate){
        await pgClient.query(`UPDATE tasks SET start_date = $1 WHERE id = $2`,[startDate,taskId])
        // check duration affected
    }

    const updatedTask = (await pgClient.query(`select * from tasks where id = $1`,[taskId])).rows[0]
    res.json({message:"updated successfully", data:updatedTask})
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
        res.json({message:"Delete Successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal Server Error" })
    }

}



async function changeProjectDuration(projectId:string){
    const rootTaskId = await getRootTask(projectId)
    const currentDuration = (await pgClient.query(`select min_duration from projects where id = $1`,[projectId])).rows[0]
    const newDuration = await getMinDuration(rootTaskId)
    let temp = [currentDuration,newDuration]
    let result = Math.max(...temp)
    await pgClient.query(`UPDATE projects SET duration = $1 WHERE id = $2`,[result,projectId])
    return
}

async function getRootTask (projectId:string){
    const rootTask = (await pgClient.query(`select id from tasks where project_id = $1 order by start_date ASC LIMITED 1`,[projectId])).rows[0]
    return rootTask
}