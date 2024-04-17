import { Router, Request, Response } from "express";
import { pgClient } from "../utils/pgClient";

export const taskRouter = Router()

taskRouter.get("/", inspectTask)
taskRouter.post("/", createInitTask)
taskRouter.put("/", updateTask)
taskRouter.delete("/", deleteTask)

//request projects.id, task.id or task name, response task info
async function inspectTask (req:Request,res:Response){
    try {
        const targetTask = (await pgClient.query(`select * from tasks where tasks.name = $1 and project_id = $2`,[req.body.taskName,req.body.project_id])).rows[0]      
        if (targetTask == undefined) {
            res.status(400).json({ message: "Cannot find target task" })
            return
        }        
        res.json({data:targetTask})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server Error"})
    }

}

// request projectsId & array of task detail
async function createInitTask (req:Request,res:Response){
    try {
      
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server Error"})

    }
}

async function updateTask (req:Request,res:Response){

}

async function deleteTask (req:Request,res:Response){

}

