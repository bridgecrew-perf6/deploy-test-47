import { MongoClient } from "mongodb";

const URI = process.env.MDB_URI;

const client = new MongoClient(URI);

await client.connect();

export const database = client.db("civizen_v3");

export const users = database.collection("users");
export const cvDatas = database.collection("cvDatas");
export const sessions = database.collection("sessions");

