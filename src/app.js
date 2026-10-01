import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//before creating any router certain configuration are needed to be done in express
//app.use is the way we provide configuration

//need to support json data , so fronted could send json data .. saying backend is accepting json data
app.use(express.json({ limit: "16kb" }));

//i want the user would be able to send some data using url
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//want to serve some static content from public folder
app.use(express.static("public"));

app.use(cookieParser());

//cors cofiguration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || `http://localhost:5173`,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type"],
    }),
);

// import the routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import TaskRouter from "./routes/task.routes.js";
import NotesRouter from "./routes/note.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", TaskRouter);
app.use("/api/v1/notes", NotesRouter);

app.get("/", (req, res) => {
    res.send("Welcome to BaseCampy");
});

export default app;
