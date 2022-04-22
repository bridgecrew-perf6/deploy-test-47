import { users, sessions } from "../config/connectDatabase.js";

export const getUsers = async (req, res) => {
  try {
    const allUsers = await users.find({}).toArray();
    res.status(200).json(allUsers);
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

export const getSessions = async (req, res) => {
  try {
    const allSessions = await sessions.find({}).toArray();
    res.status(200).json(allSessions);
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};
