import { sendMail } from "../utils/mailer.js";

export const pushMail = async (req, res) => {
  try {
      console.log(req.body);
    const { to, subject, body } = req.body;

    const reusult = await sendMail(to, subject, body);
    if (reusult) {
      res.status(200).json({ message: "Success send mail!" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed send mail!" });
  }
};
