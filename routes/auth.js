import express from "express";
import { signup, signin, signout, verifyRegistration } from "../controllers/auth.js";
import { authenToken } from "../middlewares/authenToken.js";

const router = express.Router();

router.post('/signup', signup);

router.post('/signin', signin);

router.get('/signout', signout);

router.get('/verify_registration/:verificationToken', verifyRegistration);

// for google Login
// router.get('/auth/google', );

export default router;