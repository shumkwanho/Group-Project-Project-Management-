import express from "express";
import expressSession from "express-session";
import dotenv from "dotenv";
import grant from "grant";
import path from "path";
import fs from "fs";
import http from "http";
import fetch from "cross-fetch";
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

const PORT = 8080
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
    var justSentMessage = await getJustSentMessage(data.projectId);
    var userId = await data.userId;
    var projectId = await data.projectId;

    io.to(`room-${projectId}`).emit('receive-newMessage', { userId: userId, justSentMessage: justSentMessage });

    console.log("user id: ", userId);
    console.log("last message: ", justSentMessage);

  })

  socket.on('editMessage', async (data: any) => {
    var lastEditMessageInfo = await getLastEditMessage(data.messageId);
    var userId = await data.userId;
    var projectId = await lastEditMessageInfo.project_id;

    io.to(`room-${projectId}`).emit('receive-editMessage', { userId: userId, lastEditMessageInfo: lastEditMessageInfo });

    console.log("user id: ", userId);
    console.log("project id: ", projectId);
    console.log("last message info: ", lastEditMessageInfo);

  })

  socket.on('join', (projectId: any) => {
    socket.join(`room-${projectId}`);
    socket.to(`room-${projectId}`).emit('joined');
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
app.use("/project", projectRouter)
app.use("/task", taskRouter)
app.use("/auth", authRouter)
app.use("/chatroom", chatRoomRouter)

app.use("/testLogin", testLoginRouter)

app.use("/ProjectPage", express.static("public/ProjectPage"))
app.use("/chat", express.static("public/chatPage"))
app.use("/main", express.static("public/mainPage"))
// app.use('/chat', express.static(path.join(__dirname, 'chat')))

app.use(express.static("uploads"))
app.use(express.static("public"))
app.use("/utils", express.static("utils"))
app.use(isLoggedIn, express.static("private"))


server.listen(PORT, () => {
  console.log(`listening to http://localhost:${PORT}`)
})