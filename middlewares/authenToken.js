import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { users, sessions} from "../config.js";

export const authenToken = async (req, res, next) => {
  const token = req.body.token || null;
  if (!token) {
    console.log("don't have token!");
    res.status(401).json({message:"Failed!"});
  };

  if (token) {
    const decoded = jwt.decode(token, {complete: true});
    const {userId} = decoded.payload;
    const user = await users.findOne({_id: new ObjectId(userId)});
    if (!user) {
      res.status(403).json({message:"Failed!"});
    }
    //if user is defined -> next
    if (user) next();
  };//end if data
};
