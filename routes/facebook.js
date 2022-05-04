import jwt from "jsonwebtoken";
import express from "express";
import { users, sessions } from "../config/connectDatabase.js";
import { FAILED, SUCCESS } from "../constants/index.js";
import { isHaveUser } from "../controllers/auth.js";

const router = express.Router();

router.get("/facebook", (req, res) => {
  // render file index.pug in folder views 
  res.render("facebook");
});

router.get("/facebook/login/:email", async (req, res) => {
  try {
    const { email } = req.params;
    let user = { email: email }; // tai su dung lai code
    let userId;
    const check = await isHaveUser(email);
    if (!check) {
      const newUser = await users.insertOne({
        email: user.email,
        password: null,
        cvDatas: [],
      });
      userId = String (newUser.insertedId);
      // res.status(200).json({message: SUCCESS});
    }
    // if isHaveUser == true Neu da ton tai user roi
    else {
      // console.log("Have",user);
      userId = (await users.findOne({ email: email }))._id;
    }
    // Add new session in dataBase
    const newSession = await sessions.insertOne({
      userId: userId,
    });

    // clear sesssion when cookie is expiresed
    setTimeout(async () => {
      const deleteSession = await sessions.deleteOne({
        _id: new ObjectId(newSession.insertedId),
      });
    }, 1000 * 60 * 60); // milliseconds
    const secretStr = process.env.JWT_SECRET;
    const signinToken = jwt.sign(
      {
        userId: userId,
      },
      secretStr,
      { expiresIn: 60 * 60 } // seconds
    );

    console.log(signinToken);
    res
      .status(200)
      .cookie("token", signinToken, {
        httpOnly: true,
        // hien tai de secure = false vi dang ko test bang https
        secure: false,
        sameSite: null,
      })
      .json({
        email: email,
        message: SUCCESS,
      });
  } catch (err) {
    console.log(err);
    res.send({ message: FAILED });
  }
});

export default router;
