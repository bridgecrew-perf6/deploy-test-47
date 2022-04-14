import express from "express";
import { signup, signin, signout } from "../controllers/auth.js";
import { authenToken } from "../middlewares/authenToken.js";

const router = express.Router();

router.post('/signup', signup);

router.post('/signin', signin);

router.post('/signout', signout);

router.get('/signin/auth', authenToken, (req, res) => {
    res.status(200).json({message: "Success"});
});

// router.get('/signout', signout);

export default router;