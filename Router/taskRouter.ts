import { Router, Request, Response } from "express";
import { pgClient } from "../pgClient";

export const taskRouter = Router()

taskRouter.get("/", inspectTask)
taskRouter.post("/", createTask)
taskRouter.put("/", updateTask)
taskRouter.delete("/", deleteTask)

async function inspectTask (req:Request,res:Response){

}

async function createTask (req:Request,res:Response){

}

async function updateTask (req:Request,res:Response){

}

async function deleteTask (req:Request,res:Response){

}