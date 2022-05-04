import { ObjectId } from "mongodb";
import { cvDatas, users } from "../config/connectDatabase.js";
import { data_demo, mini_demo } from "../demo.js";
import {
  ADD_CV_SUCCESS,
  DELETE_CV_SUCCESS,
  FAILED,
  JUST_CHANGE_YOUR_CV,
  NOT_OWNER,
  PRIVATE,
  PUBLIC,
  SUCCESS,
  UPDATE_CV_SUCCESS,
} from "../constants/index.js";

// get all cv -> to developer
// ten id, anh

//chua sua duoc lay 1 so truong trong du lieu
// If /cv?page=3 -> ... else /cv -> getall
export const getManyCv = async (req, res) => {
  try {
    const { page } = req.query;
    if (page) {
      const PAGE_SIZE = 5; // page size
      let numberPage = parseInt(page);
      numberPage = numberPage > 1 ? numberPage : 1;
      let skip = (numberPage - 1) * PAGE_SIZE;
      const manyCv = await cvDatas
        .find({})
        .skip(skip)
        .limit(PAGE_SIZE)
        .toArray();
      // console.log(manyCv);
      res.status(200).json(manyCv);
    } else {
      // if /cv -> get all
      const allCv = await cvDatas.find({}).toArray();
      const result = allCv.map((item) => {
        return {
          _id: item._id,
          resumeName: item.resumeName,
          imgUrl: item.imgUrl,
        };
      }); // get all voi 1 so truong
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

export const getOneCv = async (req, res) => {
  try {
    const userId = req.userId; // so sanh voi tac gia trong cvDatas
    const cvId = req.params.cvid;
    const user = await users.findOne({ _id: new ObjectId(userId) });
    const cv = await cvDatas.findOne({ _id: new ObjectId(cvId) });
    if (!cv) {
      res.status(403).json({ message: FAILED });
      return;
    }

    const isHaveCV = user.cvDatas.filter((item) => item === cvId);
    /* User dont't have this CV*/
    if (isHaveCV.length === 0) {
      if (cv.access === PUBLIC) 
        res.status(401).json({
          message: NOT_OWNER,
          caData: cv
        });
      // if access == private and not owner
      if (cv.access === PRIVATE) 
        res.status(403).json({ message: FAILED });
      return;
    }

    // if owner of this cv
    res.status(200).json({
      message: SUCCESS,
      cvData: cv
    });
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};
/**
 * chua the kiem xoat cac truong luu vao trong database
 */
export const addCv = async (req, res) => {
  try {
    const { _id, ...newCv } = req.body || data_demo;
    const userId = req.userId;
    const user = await users.findOne({ _id: new ObjectId(userId) });

    // Kiem tra xem ton tai the tuong tu <script> ko
    const jsStr = JSON.stringify(newCv);
    if (isHaveJsTag(jsStr) === true) {
      res.status(403).json({ message: FAILED });
      return;
    }
    const cv = await cvDatas.insertOne(newCv);
    const cvId = String(cv.insertedId);
    const updateUser = {
      ...user,
      cvDatas: [...user.cvDatas, cvId],
    };
    console.log({ updateUser });
    const updated = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateUser }
    );
    if (updated.modifiedCount)
      res.status(200).json({ message: ADD_CV_SUCCESS });
    else res.status(400).json({ message: FAILED });
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

export const updateCv = async (req, res) => {
  try {
    const cvId = req.params.cvid;
    const userId = req.userId;
    const user = await users.findOne({ _id: new ObjectId(userId) });
    const updateCv = req.body || data_demo;

    const isHaveCV = user.cvDatas.filter((item) => item === cvId);
    /* User dont't have this CV*/
    if (isHaveCV.length === 0) {
      res.status(403).json({ message: JUST_CHANGE_YOUR_CV });
      return;
    }

    const jsStr = JSON.stringify(updateCv);
    if (isHaveJsTag(jsStr) === true) {
      res.status(403).json({ message: FAILED });
      return;
    }
    /* Kiem tra user co so huu cvId nay hay khong */

    const cv = await cvDatas.findOne({ _id: new ObjectId(cvId) });
    if (cv) {
      const updated = await cvDatas.updateOne(
        { _id: new ObjectId(cvId) },
        { $set: updateCv }
      );
      console.log(updated);
      if (updated.modifiedCount !== 0)
        res.status(200).json({ message: UPDATE_CV_SUCCESS });
      else res.status(400).json({ message: FAILED });
    } // end if cv
    else {
      res.status(400).json({ message: FAILED });
    }
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};

export const deleteCv = async (req, res) => {
  try {
    const cvId = req.params.cvid;
    const userId = req.userId;
    const user = await users.findOne({ _id: new ObjectId(userId) });
    const isHaveCV = user.cvDatas.filter((item) => item === cvId);
    /* User dont't have this CV*/
    if (isHaveCV.length === 0) {
      res.status(403).json({ message: JUST_CHANGE_YOUR_CV });
      return;
    } // end isHaveCV
    const updateCv = user.cvDatas.filter((item) => item !== cvId);
    const updateUser = {
      ...user,
      cvDatas: updateCv,
    };

    //Update cvDatas of user after Delete CV
    const userUpdate = await users.updateOne(
      { _id: new ObjectId(user._id) },
      { $set: updateUser }
    );
    //Delete CV
    const deleteCv = await cvDatas.deleteOne({ _id: new ObjectId(cvId) });
    console.log(deleteCv);
    if (deleteCv.deletedCount !== 0)
      res.status(200).json({ message: DELETE_CV_SUCCESS });
    else res.status(403).json({ message: FAILED });
  } catch (err) {
    res.status(500).json({ error: err });
    console.log("err:", err);
  }
};
/**
 * cath isHaveJsTag
 * return boolean
 */
export function isHaveJsTag(str) {
  const jsTag = [`<script>`, `</script>`];
  const lowStr = String(str).toLowerCase();
  for (let i = 0; i < jsTag.length; i++) {
    console.log(jsTag[i]);
    if (lowStr.includes(jsTag[i])) return true;
  }
  return false;
}

// To escape user input in an HTML context in JavaScript
function htmlEncode(str) {
  return String(str).replace(/[^\w. ]/gi, function (c) {
    return "&#" + c.charCodeAt(0) + ";";
  });
}
// If your input is inside a JavaScript string
function jsEscape(str) {
  return String(str).replace(/[^\w. ]/gi, function (c) {
    return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}
