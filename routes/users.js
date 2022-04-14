import express from "express";
import { getSessions, getUsers } from "../controllers/users.js";
import { authenToken } from "../middlewares/authenToken.js";

const router = express.Router();

router.get('/getusers', getUsers);

router.get('/getsession', getSessions);

export default router;