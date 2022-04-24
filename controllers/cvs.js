import { ObjectId } from "mongodb";
import { cvDatas, users } from "../config/connectDatabase.js";
import { data_demo, mini_demo } from "../demo.js";

// get all cv -> to developer
// ten id, anh

//chua sua duoc lay 1 so truong trong du lieu
export const getAllCv = async (req, res) => {
  try {
    const allCv = await cvDatas.find({}, {_id: 1}).toArray()
    .then(data => {
      console.log(data);
    });
    res.status(200).json({allCv});
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

export const getOneCv = async (req, res) => {
  try {
    const cvId = req.params.cvid;
    const cv = await cvDatas.findOne({ _id: new ObjectId(cvId) });
    res.status(200).json({ cv });
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
}

export const addCv = async (req, res) => {
  try {
    const newCv = req.body.data || mini_demo;
    // const userId = newCv.metadata.ownerId;
    //Dang ton tai loi them 2 lan duplicate key
    const cv = await cvDatas.insertOne(newCv);
    // const cvId = String(cv.insertedId);
    // const user = await users.findOne({ _id: new ObjectId(userId) });
    // const updateUser = {
    //   ...user,
    //   cvDatas: [...user.cvDatas, cvId],
    // };
    // console.log({ updateUser });
    // const updated = await users.updateOne(
    //   { _id: new ObjectId(userId) },
    //   { $set: updateUser }
    // );
    // if (updated.modifiedCount)
    //   res.status(200).json({ message: "Add CV success" });
    // else res.status(400).json({ message: "Failed!" });
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

export const updateCv = async (req, res) => {
  try {
    const cvId = req.params.cvid;
    const updateCv = req.body.data || data_demo;
    const cv = await cvDatas.findOne({ _id: new ObjectId(cvId) });

    if (cv) {
      //Kiem xoat xem co dung ownerId khong
      if (String(cv.metadata.ownerId) === req.body.userId) {
        const updated = await cvDatas.updateOne(
          { _id: new ObjectId(cvId) },
          { $set: updateCv }
        );
        console.log(updated);
        if (updated.modifiedCount !== 0)
          res.status(200).json({ message: "Update CV success" });
        else res.status(400).json({ message: "Failed can't modified!" });
      } //end if owerId
      else {
        res.status(400).json({ mess: "You just can update your CV!" });
      }
    } // end if cv
    else {
      res.status(400).json({ message: "Failed can't find CV!" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

export const deleteCv = async (req, res) => {
  try {
    const cvId = req.params.cvid;
    //Take idUser
    const userId = req.body.data
      ? req.body.userId
      : data_demo.metadata.ownerId;
    const user = await users.findOne({ _id: new ObjectId(userId) });
    const updateCv = user.cvDatas.filter((item) => item !== cvId);
    const updateUser = {
      ...user,
      cvDatas: updateCv,
    };
    if (!user || (user && String(user._id) !== userId)) {
      res.status(400).json({ message: "Don't exist user or You just can delete your CV!" });
      return;
    }
    //Update cvDatas of user after Delete CV
    const userUpdate = await users.updateOne(
      { _id: new ObjectId(user._id) },
      { $set: updateUser }
    );
    //Delete CV
    const deleteCv = await cvDatas.deleteOne({ _id: new ObjectId(cvId) });
    console.log(deleteCv);
    if (deleteCv.deletedCount !== 0)
      res.status(200).json({ message: "Delete CV success" });
    else res.status(400).json({ message: "Failed!" });
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};
