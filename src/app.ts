import express from "express";
import dotenv from "dotenv";
import usersRouter from "./routes/users.route";

dotenv.config();

const app = express();

app.use(express.json());

// 라우터 등록
app.use("/users", usersRouter);

export default app;
