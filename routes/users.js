import express from "express";
import { getSessions, getUsers } from "../controllers/users.js";
/**
 * Phuc vu cho developer
 * De lay ra tat ca user, tat ca session co trong database
 */
const router = express.Router();

router.get('/getusers', getUsers);

router.get('/getsession', getSessions);

export default router;