import express from "express";
import jwt from "jsonwebtoken";
import { users, sessions } from "../config/connectDatabase.js";
import { verify } from "../config/googleLogin.js";
import { FAILED, SUCCESS } from "../constants/index.js";
import { isHaveUser } from "../controllers/auth.js";

const router = express.Router();

router.get("/google", (req, res) => {
  // se dua toi duong dan nay de thao tac
  const dataLoginUri = "/api/google/login";
  res.send(`
          <html>
          <body>
              <script src="https://accounts.google.com/gsi/client" async defer></script>
              <div id="g_id_onload"
                  data-client_id="${process.env.GOOGLE_CLIENT_ID}"
                  data-login_uri="${process.env.SERVER_BASE_URL}${dataLoginUri}"
                  data-auto_prompt="false">
              </div>
              <div class="g_id_signin"
                  data-type="standard"
                  data-size="large"
                  data-theme="outline"
                  data-text="sign_in_with"
                  data-shape="rectangular"
                  data-logo_alignment="left">
              </div>
          </body>
          </html>`);
});

// auth login for google
router.post("/google/login", async (req, res) => {
  try {
    // console.log(req.body);
    // token google response
    const token = req.body.credential;
    const user = await verify(token);
    let userId;
    const check = await isHaveUser(user.email);
    if (user) {
      // console.log("user: ", user);
      if (!check) {
        const newUser = await users.insertOne({
          email: user.email,
          password: null,
          cvDatas: [],
        });
        userId = String(newUser.insertedId);
        console.log("UserId when check = false : ", userId)
        // console.log(user);
      }
      // if isHaveUser == true Neu da ton tai user roi
      else {
        userId = (await users.findOne({ email: user.email }))._id;
        console.log("UserId when check = true : ", userId)
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

      res
        .status(200)
        .cookie("token", signinToken, {
          httpOnly: true,
          // hien tai de secure = false vi dang ko test bang https
          secure: false,
          sameSite: null,
        })
        .json({
          email: user.email,
          message: SUCCESS,
        });
    } // if exits user
  } catch (error) {
    console.log(error);
    res.send({ message: FAILED });
  }
});

export default router;

// import "./config/googleLogin.js";
