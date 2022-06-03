import { Router } from "express";
import lessons from "./lessons";

const router = Router();

router.use("/lessons", lessons)

export default router;