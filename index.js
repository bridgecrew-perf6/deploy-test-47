import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { MongoClient } from "mongodb";
import 'dotenv/config';

import auth from "./routes/auth.js";
import users from "./routes/users.js";
import cvs from "./routes/cvs.js";
import { authenToken } from "./middlewares/authenToken.js";

const app = express();
const PORT = process.env.PORT || 8000;
//URI contain database
const URI = process.env.MDB_URI;

const client = new MongoClient(URI);

app.use(bodyParser.json({limit:'30mb'}));
app.use(bodyParser.urlencoded({limit:'30mb', extended:true}));


async function runServer() {
    try {
        await client.connect();

        app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}`);
        });

        app.use('/api', auth);
        app.use('/api', cvs);
        app.use('/users', users);
        // Test
        app.get('/access', authenToken, (req, res) => {
            res.json("Success");
        });

    } finally {
        await client.close();
    }
}

//Catch error
runServer().catch(console.dir);
