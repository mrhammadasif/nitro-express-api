import { validationErrorChecker } from "./../core/error-handler"
import { body } from "express-validator"
import { Router } from "express"
import { authorizeByRole } from "../core/authorization"
import UserModel, { Roles } from "../models/UserModel"
const controller = Router()

/**
 * POST /admin/user/:UserID
 * enable or disable the user
 */
controller.post("/user/:what",
  authorizeByRole(Roles.admin),
  [body("userId", "valid userId is required").exists().isMongoId()],
  validationErrorChecker,
  async (req, res) => {
    const user = await UserModel.findOne({ _id: req.body.userId })
    if (!user) {
      return res.status(400).send("No user found with given credentials")
    }
    user.isActive = req.params.what === "enable" ? true : false
    await user.save()
    res.send("ok")
  })

export default controller
