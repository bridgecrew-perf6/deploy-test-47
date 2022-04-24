import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { users, cvDatas, sessions, PRV } from "../config/connectDatabase.js";
import { sendMail } from "../utils/mailer.js";
import {
  EMAIL_INVALIDATE,
  EXITS_EMAIL,
  FAILED,
  LOG_OUT,
  PASSWORD_INVALIDATE,
  SIGN_FAILED,
  SIGN_UP_SUCCESS,
  VERIFY_YOUR_ACCOUNT,
} from "../constants/index.js";

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      //check validate email
      if (validateEmail(email) === null) {
        res.status(400).json({ message: EMAIL_INVALIDATE });
        return;
      }
      //check exits email
      const check = await isHaveUser(email);
      if (check === true) {
        res.status(400).json({ message: EXITS_EMAIL });
        return;
      }

      if (check === false) {
        //check validate email
        if (password.length < 8) {
          res.status(400).json({ message: PASSWORD_INVALIDATE });
          return;
        }
        const saltRounds = 10;
        const myPlaintextPassword = password;
        //hash password and insert 1 user to database
        bcrypt.hash(
          myPlaintextPassword,
          saltRounds,
          async function (err, hash) {
            //Insert one user to PRV
            const newUser = await PRV.insertOne({
              ...req.body,
              email: email,
              password: hash,
              cvDatas: [],
            });
            const secretStr = process.env.JWT_SECRET;
            const signinToken = jwt.sign(
              {
                pendingId: String(newUser.insertedId),
              },
              secretStr
            );
            console.log(newUser);
            // send mail to this email to verify
            const subject = `Xác thực tài khoản gmail!`;
            const body = `http://localhost:8000/api/verify_registration/${signinToken}`;
            await sendMail(email, subject, body);
            // xoa sign up infor in PRV
            setTimeout(async () => {
              const deletePRV = await PRV.deleteOne({
                _id: new ObjectId(newUser.insertedId)
              })
            }, 1000 * 60 * 10);
            res.status(200).json({ message: VERIFY_YOUR_ACCOUNT });
          }
        ); // end hash and save sign up infor -> PRV
      }
    } else {
      res.status(400).json({ message: FAILED });
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
      res.status(400).json({ message: FAILED });
      return;
    }
    //check log in
    const check = await isHaveUser(email, password);
    if (check === false) {
      res.status(400).json({ message: SIGN_FAILED });
      return;
    }

    if (check === true) {
      const userId = (await users.findOne({ email: email }))._id;
      // Add new session in dataBase
      const newSession = await sessions.insertOne({
        userId: userId,
      });
      // console.log(newSession.insertedId);
      const secretStr = process.env.JWT_SECRET;
      const signinToken = jwt.sign(
        {
          userId: userId,
        },
        secretStr,
        { expiresIn: "10000s" }
      );

      res
        .status(200)
        // http only, secure, same site
        .cookie("token", signinToken, {
          httpOnly: true,
          // hien tai de secure = false vi dang ko test bang https
          secure: false,
          sameSite: null,
        })
        .json({
          email: email,
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
    const token = req.cookies ? req.cookies.token : null;
    console.log(req.cookies);
    if (!token) {
      res.status(401).json({ message: FAILED });
      return;
    }
    // console.log(token);
    const secretStr = process.env.JWT_SECRET;
    const decode = jwt.verify(token, secretStr);
    const { userId } = decode;
    //delete sesion in database
    const deleteUser = await sessions.findOneAndDelete({
      userId: new ObjectId(userId),
    });
    // Kiem xoat xoa ?
    console.log({ userId });
    console.log(deleteUser.value);
    //clear token in cookie
    res.clearCookie("token");
    res.status(200).json({ message: LOG_OUT });
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

export const verifyRegistration = async (req, res) => {
  try {
    const secretStr = process.env.JWT_SECRET;
    const token = req.params ? req.params.verificationToken : null;
    if (token === null) {
      res.status(401).json({ message: FAILED });
      return;
    }
    // console.log(token);
    const decode = jwt.verify(token, secretStr);
    // userId in PRV find userId in PRV
    const { pendingId } = decode;
    const { _id, ...result } = await PRV.findOne({
      _id: new ObjectId(pendingId),
    });
    if (result) {
      // check exits email
      if (isHaveUser(result.email, result.password)) {
        res.status(401).json({ message: EXITS_EMAIL });
        return;
      }
      // add newuser to Users database
      const newUser = await users.insertOne(result);
      res.status(400).json({ message: SIGN_UP_SUCCESS });
    }
  } catch (err) {
    console.log("err:", err);
    res.status(500).json({ error: err });
  }
};

// check email or user is exist
//return boolean
export async function isHaveUser(email, password) {
  let check = false;
  if (!email) return false;
  const user = await users.findOne({ email: email });
  if (user !== null) check = true;
  if (!password) return check;
  return bcrypt.compareSync(password, user.password);
}
// validate Email
function validateEmail(email) {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}
