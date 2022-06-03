import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import logger from "morgan";
import indexRouter from "./routes";
import { errorHandling } from "./modules/helpers";

dotenv.config();

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use("/api", indexRouter);

// Error Handling
app.use(errorHandling);

export default app;
