import express from "express";
import { addCv, deleteCv, updateCv, getAllCv, getOneCv } from "../controllers/cvs.js";
import { authenToken } from "../middlewares/authenToken.js";
const router = express.Router();

router.get('/allcv', getAllCv); // for developer

router.get('/cv/:cvid', authenToken, getOneCv);

router.post('/cv', addCv);

router.put('/cv/:cvid', authenToken, updateCv);

router.delete('/cv/:cvid', authenToken, deleteCv);

export default router;