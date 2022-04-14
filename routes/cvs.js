import express from "express";
import { addCv, deleteCv, updateCv, getCv } from "../controllers/cvs.js";
const router = express.Router();

router.get('/cv/', getCv)

router.post('/cv/', addCv);

router.put('/cv/:cvid', updateCv);

router.delete('/cv/:cvid', deleteCv);

export default router;