import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
// google login
import "./config/googleLogin.js";
import { MongoClient } from "mongodb";
import "dotenv/config";

import auth from "./routes/auth.js";
import users from "./routes/users.js";
import cvs from "./routes/cvs.js";
import email from "./routes/email.js";
import google from "./routes/google.js";

const app = express();
const PORT = process.env.PORT || 8000;
//URI contain database
const URI = process.env.MDB_URI;

const client = new MongoClient(URI);

app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// Random string for cookie singned
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

async function runServer() {
  try {
    await client.connect();

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });

    app.use("/api", auth);
    app.use("/api", cvs);
    app.use("/api", google);
    app.use("/users", users);
    app.use("/email", email);
  } finally {
    await client.close();
  }
}

//Catch error
runServer().catch(console.dir);
