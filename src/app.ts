import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import usersRouter from "./routes/users.route";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:3000",//이 부분 프론트 서버랑 주소 맞추는 건데 예성님께서 포트번호 수정하셔서 사용하시고 테스트 해주세요
    credentials: true
}));
app.use(express.json());

app.use("/users", usersRouter);

export default app;
