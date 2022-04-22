import express from "express";
import { users } from "../config/connectDatabase.js";
import { verify } from "../config/googleLogin.js";

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
    console.log(req.body);
    // token google response
    const token = req.body.credential;
    const user = await verify(token);

    if (user) {
      const newUser = await users.insertOne({
        email: user.email,
        password: null,
        cvDatas: [],
      });
      console.log(user);
    }
  } catch (error) {
    console.log(error);
    
    res.send({ message: "Failed" });
  }
});

export default router;
