import express from "express"
import expressSession from "express-session"
import dotenv from "dotenv"
import { projectRouter } from "./Router/projectRouter"
import { taskRouter } from "./Router/taskRouter"


const app = express()
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
    userId?: string;
  }
}

app.use(express.json())
app.use(express.urlencoded())
app.use("/project", projectRouter)
app.use("/task", taskRouter)

app.use(express.static("public"))

app.listen(PORT, () => {
  console.log(`listening to http://localhost:${PORT}`)
})