import express from "express";
import { pushMail } from "../controllers/email.js";

const router = express.Router();

router.post('/sendmail', pushMail);

export default router;
