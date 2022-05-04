import express from "express";
import { addCv, deleteCv, updateCv, getManyCv, getOneCv } from "../controllers/cvs.js";
import { authenToken } from "../middlewares/authenToken.js";
const router = express.Router();

router.get('/cv', getManyCv); // for developer

router.get('/cv/:cvid',authenToken ,getOneCv); // get

router.post('/cv', authenToken, addCv);

router.put('/cv/:cvid',authenToken ,updateCv);

router.delete('/cv/:cvid',authenToken ,deleteCv);

export default router;