import express from "express";
import { getSessions, getUsers } from "../controllers/users.js";
import { checkLogin } from "../middlewares/checkLogin.js";
/**
 * Phuc vu cho developer
 * De lay ra tat ca user, tat ca session co trong database
 */
const router = express.Router();

router.get('/getusers', getUsers);

// router.delete('/delete_user', )

router.get('/getsession', getSessions);

router.get('/logined', checkLogin);

export default router;