import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { users, cvDatas, sessions } from "../config.js";


export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email) {
      //check exits email
      const check = await isHaveUser(email);
      if (check === true) {
        res.status(400).json({ message: "fail" });
        return;
      }

      if (check === false) {
        const saltRounds = 10;
        const myPlaintextPassword = password;

        bcrypt.hash(
          myPlaintextPassword,
          saltRounds,
          async function (err, hash) {
            const newUser = await users.insertOne({
              ...req.body,
              password: hash,
              cvDatas: []
            });
            //response
            res.status(200).json({message:"Sign up success!"});
          }
        );
      }
    } else {
      res.status(400).json("fail");
    }
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "fail" });
      return;
    }
    //check log in
    const check = await isHaveUser(email, password);
    if (check === false) {
      res.status(400).json({ message: "Signin failed." });
      return;
    }

    if (check === true) {
      const userId = (await users.findOne({ email: email }))._id;
      // Add new session in dataBase
      const newSession = await sessions.insertOne({
        userId: userId,
      });
      // console.log(newSession.insertedId);
      const secretStr = String(newSession.insertedId);
      // Make token ? dat exprires
      const signinToken = jwt.sign(
        {
          userId: userId,
        },
        secretStr,
        { expiresIn: "10000s" }
      );

      res.status(200).json({
        email: email,
        token: signinToken,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};
//Delete
export const signout = async (req, res) => {
  try {
    const token = req.body.token || null;
    if (!token) {
      res.status(401).json({ message: "Failed!" });
      return;
    }
    // console.log(token);
    const decode = jwt.decode(token, {complete:true});
    const {userId} = decode.payload;
    //delete sesion in database
    const deleteUser = await sessions.findOneAndDelete({userId: new ObjectId(userId)});
    // Kiem xoat xoa ?
    console.log({userId});
    console.log(deleteUser.value);
    res.status(200).json({message:"Log out"});
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

//return boolean
async function isHaveUser(email, password) {
  let check = false;
  if (!email) return false;
  const user = await users.findOne({ email: email });
  if (user !== null) check = true;
  if (!password) return check;
  return bcrypt.compareSync(password, user.password);
}