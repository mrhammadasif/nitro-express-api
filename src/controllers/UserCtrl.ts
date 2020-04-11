import { validationErrorChecker } from "./../core/error-handler"
import { body } from "express-validator"
import { Router } from "express"
import UserModel, { RolesAll } from "../models/UserModel"
import { hashPassword, encrypt } from "../core/common"
import { signJwt, authorizeByRole } from "../core/authorization"
import myLang from "../lang"

const controller = Router()

// this req is must have auth success
controller.get("/", authorizeByRole(...RolesAll), (req, res) => {
  res.send("Le le bhai, tu user le le...")
})

controller.post("/login", [
  body("username", "a valid username is required").exists(),
  body("password", "a valid password is required").exists().isLength({ min: 8 })
], validationErrorChecker, async (req, res) => {
  // console.log(req.body)
  try {
    const userObj = await UserModel.findOne({
      username: req.body.username,
      isActive: true,
      password: hashPassword(req.body.password)
    }).select("-password")
    if (!userObj) {throw false}
    res.json({
      ...userObj.toJSON(),
      password: undefined,
      token: signJwt({
        _a: userObj._id,
        _b: encrypt(hashPassword(req.body.password))
      })
    })
  } catch (e) {
    console.error(e)
    res.status(400).json(myLang.wrongUserCredentials)
  }
})

export default controller
