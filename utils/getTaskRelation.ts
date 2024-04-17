import { pgClient } from "./pgClient";


export async function getTaskRelation (taskId:string) {
    const taskRelations = (await pgClient.query(`select pre_req_task_id, task_id from task_relation where task_id = $1 or pre_req_task_id = $1`,[taskId])).rows
        let taskRelation:{
            preTask:string[],
            postTask:string[]
        } = {
            preTask:[],
            postTask:[]
        }

        for (let relation of taskRelations){
            if (taskId == relation.pre_req_task_id){
                taskRelation.postTask.push(relation.task_id)
            }else if(taskId == relation.task_id){
                taskRelation.preTask.push(relation.pre_req_task_id)
            }
        }   
        return taskRelation
}
