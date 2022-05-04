import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { sessions } from "../config/connectDatabase.js";
import { FAILED, SUCCESS } from "../constants/index.js";

/**
 * check was loggined
 * return boolean
 */
export const checkLogin = async (req, res) => {
  try {
    if (!req.cookies) {
      res.status(401).json({ message: FAILED });
      return false;
    }
    const { token } = req.cookies;
    if (!token) {
      console.log("don't have token!");
      res.status(401).json({ message: FAILED });
      return false;
    }

    const secretStr = process.env.JWT_SECRET;
    // verify neu token da het han roi thi sao
    const decode = jwt.verify(token, secretStr);
    const { userId } = decode;
    const user = await sessions.findOne({userId: new ObjectId(userId)});
    if (!user) {
      res.status(401).json({ message: FAILED });
      return false;
    }
    console.log(user);
    res.status(200).json({ message: SUCCESS });
    return true;
  } catch (err) {
    console.log("err:", err);
  }
};