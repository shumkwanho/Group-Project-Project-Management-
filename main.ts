import express from "express";
import expressSession from "express-session";
import dotenv from "dotenv";
import { projectRouter } from "./Router/projectRouter";
import { taskRouter } from "./Router/taskRouter";
import { authRouter } from "./Router/authRouter";
import { chatRoomRouter } from "./Router/chatRoomRouter";
import { testLoginRouter } from "./Router/testLoginRouter";
import path from "path";
import fs from "fs";
import http from "http";
import { Server as SOCKETIO } from "socket.io";
import { pgClient } from "./utils/pgClient";


const app = express()



const server = new http.Server(app);
console.log("what server is: ", server);

export const io = new SOCKETIO(server);
console.log("what io is: ", io);








io.on('connection', function (socket: any) {

  // const req = socket.request as express.Request;
  // console.log(req.session.userId);
  // socket.request.session.save();
  io.emit('newConnection', "There is a new connection");

  socket.on('newMessage', async (data: any) => {
    var justSentMessage = await getJustSentMessages(data.projectId);
    var userId = await data.userId;
    var projectId = await data.projectId;

    io.to(`room-${projectId}`).emit('receive-newMessage', { userId: userId, justSentMessage: justSentMessage });

    console.log("user id: ", userId);
    console.log("last message: ", justSentMessage);

  })

  socket.on('join', (projectId: any) => {
    socket.join(`room-${projectId}`);
    socket.to(`room-${projectId}`).emit('joined');
  })

})

async function getJustSentMessages(projectId: number) {
  return (await pgClient.query(`
    SELECT project_id, 
    messages.id as messages_id, 
    users.id as users_id, 
    profile_image, 
    username, 
    messages.content, 
    to_char(created_at, 'YYYY-MM-DD') AS created_date,
    to_char(created_at, 'HH24:MI') AS created_time,
    edited_at
    FROM users INNER JOIN messages
    ON users.id = user_id
    WHERE project_id = $1
    ORDER BY created_at DESC 
    LIMIT 1;`, [projectId])).rows[0]
}











const PORT = 8080
dotenv.config()

app.use(
  expressSession({
    secret: "project_manager",
    resave: true,
    saveUninitialized: true,
  })
);

declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
  }
}



// const sessionMiddleware = expressSession({
//   secret: "project_manager",
//   resave: true,
//   saveUninitialized: true,
//   cookie: { secure: false },
// });

// app.use(sessionMiddleware);

// io.use((socket, next) => {
//   let req = socket.request as express.Request;
//   let res = req.res as express.Response;
//   sessionMiddleware(req, res, next as express.NextFunction);
// });


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/project", projectRouter)
app.use("/task", taskRouter)
app.use("/auth", authRouter)
app.use("/chatroom", chatRoomRouter)

app.use("/testLogin", testLoginRouter)
app.use("/chat", express.static("chat"))
app.use("/utils", express.static("utils"))

app.use(express.static("public"))
// app.use(isLoggedIn, express.static("private"))


server.listen(PORT, () => {
  console.log(`listening to http://localhost:${PORT}`)
})

// app.listen(PORT, () => {
//   console.log(`listening to http://localhost:${PORT}`)
// })

