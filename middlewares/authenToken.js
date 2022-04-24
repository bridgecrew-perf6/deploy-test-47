import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { users, sessions } from "../config/connectDatabase.js";

export const authenToken = async (req, res, next) => {
  try {
    if (!req.cookies) {
      console.log("don't have token!");
      res.status(401).json({ message: "Failed!" });
      return;
    }

    if (req.cookies) {
      const { token } = req.cookies;
      if (!token) {
        res.status(403).json({ message: "Failed!" });
        return;
      }
      const secretStr = process.env.JWT_SECRET;
      // verify neu token da het han roi thi sao
      const decode = jwt.verify(token, secretStr);
      const { userId } = decode;
      const user = await users.findOne({ _id: new ObjectId(userId) });
      if (!user) {
        res.status(403).json({ message: "Failed!" });
        return;
      }
      //if user is defined -> next
      if (user) next();
    } //end if data
  } catch (err) {
    console.log("err: ", err);
  }
};

export const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.status(401).json({ message: "Failed" });
};
