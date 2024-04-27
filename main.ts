import express from "express";
import expressSession from "express-session";
import dotenv from "dotenv";
import grant from "grant";
import path from "path";
import fs from "fs";
import http from "http";
import { projectRouter } from "./Router/projectRouter";
import { taskRouter } from "./Router/taskRouter";
import { authRouter } from "./Router/authRouter";
import { chatRoomRouter } from "./Router/chatRoomRouter";
import { testLoginRouter } from "./Router/testLoginRouter";
import { Server as SOCKETIO } from "socket.io";
import { pgClient } from "./utils/pgClient";
import { isLoggedIn } from "./utils/guard";
import { getJustSentMessage } from "./Router/chatRoomRouter";
import { getLastEditMessage } from "./Router/chatRoomRouter";
import { error } from "console";
import { mainPageDisplayRouter } from "./Router/mainPageDisplayRouter";
import { getProjectFromId } from "./Router/chatRoomRouter";

const PORT = 8080
const app = express()

const server = new http.Server(app);
// console.log("what server is: ", server);

export const io = new SOCKETIO(server);
// console.log("what io is: ", io);

io.on('connection', function (socket: any) {

  // const req = socket.request as express.Request;
  // console.log(req.session.userId);
  // socket.request.session.save();
  io.emit('newConnection', "There is a new connection");

  socket.on('newMessage', async (data: any) => {
    var justSentMessage = await getJustSentMessage(data.projectId);
    var userId = await data.userId;
    var projectId = await data.projectId;
    var projectInfo = await getProjectFromId(projectId);

    io.to(`chatroom-${projectId}`).emit('receive-newMessage', { userId: userId, justSentMessage: justSentMessage });
    socket.broadcast.to(`projectRoom-${projectId}`).emit('you-have-a-new-message',{projectId: projectId, projectName: projectInfo.name});

    console.log("user id: ", userId);
    console.log("last message: ", justSentMessage);
  })

  socket.on('editMessage', async (data: any) => {
    var lastEditMessageInfo = await getLastEditMessage(data.messageId);
    var userId = await data.userId;
    var projectId = await lastEditMessageInfo.project_id;

    io.to(`chatroom-${projectId}`).emit('receive-editMessage', { userId: userId, lastEditMessageInfo: lastEditMessageInfo });

    console.log("user id: ", userId);
    console.log("project id: ", projectId);
    console.log("last message info: ", lastEditMessageInfo);
  })

  socket.on('joinProjectRoom', (projectId: any) => {
    socket.join(`projectRoom-${projectId}`);
    io.to(`projectRoom-${projectId}`).emit('project room joined');
  })

  socket.on('joinChatroom', (projectId: any) => {
    socket.join(`chatroom-${projectId}`);
    io.to(`chatroom-${projectId}`).emit('chatroom joined');
  })

  socket.on('addMember', async (input: any) => {
    // var res = await fetch(`/projectRou/?id=${input.projectId}`)
    var projectId = input.projectId
    // var response = await res.json()
    io.to(`projectRoom-${projectId}`).emit('receive-addMember', { data: "A new user added in project" });
  })

  socket.on('redrawProjectPage', async (input: any) => {
    var projectId = input.projectId
    io.to(`projecRroom-${projectId}`).emit('receive-redrawProjectPage', { data: "project page redrawed" });
  })








})

dotenv.config();

if (!process.env.SECRET || !process.env.GOOGLE_CLIENT_SECRET) {
  throw error("SECRET missing in .env");
}

app.use(
  expressSession({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

const grantExpress = grant.express({
  defaults: {
    origin: "http://localhost:8080",
    transport: "session",
    state: true,
  },
  google: {
    key: process.env.GOOGLE_CLIENT_ID || "",
    secret: process.env.GOOGLE_CLIENT_SECRET || "",
    scope: ["profile", "email"],
    callback: "/auth/google-login",
  },
});

app.use(grantExpress as express.RequestHandler);

declare module "express-session" {
  interface SessionData {
    userId?: number;
    username?: string;
    grant?: any;
  }
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/projectRou", isLoggedIn, projectRouter)
app.use("/task", isLoggedIn, taskRouter)
app.use("/auth", authRouter)
app.use("/chatroom", chatRoomRouter)
app.use("/mainpage", isLoggedIn, mainPageDisplayRouter)
app.use("/testLogin", testLoginRouter)

app.use("/project", isLoggedIn, express.static("private/projectPage"))
app.use("/chat", express.static("private/chatPage"))
app.use("/main", isLoggedIn, express.static("private/mainPage"))

app.use(express.static("uploads"))
app.use(express.static("public"))
app.use("/utils", express.static("utils"))
app.use("/init-project", express.static("private"))
// isLoggedIn, 

server.listen(PORT, () => {
  console.log(`listening to http://localhost:${PORT}`)
})