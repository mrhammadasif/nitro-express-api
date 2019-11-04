import { Request, Response, Router } from "express"
import "express-async-errors"
import { body } from "express-validator"
import { authorizeByRole, signJwt } from "../core/authorization"
import { randPassword, hashPassword, encrypt } from "../core/common"
import { validationErrorChecker } from "../core/error-handler"
import UserModel, { Roles } from "../models/user"
import myLanguage from "../language"

require("dotenv").config()

export class Controller {

  getRouter (): Router {
    const router = Router()
    // all requests after this line will be authorized by default
    router.get("/",  (req: Request, res: Response) => {res.send("Forbidden Area!") })

    router.post("/login", async (req: Request, res: Response) => {
      try {
        const userObj = await UserModel.findOne({
          username: req.body.username,
          password: hashPassword(req.body.password)
        }).select("-password")
        if (!userObj) {throw false}
        res.json({
          token: signJwt({
            _a: userObj._id,
            _b: encrypt(hashPassword(req.body.password))
          })
        })
      } catch (e) {
        res.status(400).json(myLanguage.wrongUserCredentials)
      }
    })

    router.get("/users",  async function (req: Request, res: Response) {
      res.send(await UserModel.find({}).select("-password -username"))
    })
    router.get("/test", (req, res) => {
      res.json("testing")
    })

    return router
  }

  addStudent = [
    [
      body("name").exists(),
      body("fatherName").exists(),
      body("mobile").exists(),
      body("address").exists(),
      body("cnic").exists()
    ],
    validationErrorChecker,
    async function (req: Request, res: Response) {
      try {
        const password = randPassword(8)
        // register user as email is valid
        const student = await new UserModel({

          mobile: req.body.mobile,
          address: req.body.address,
          cnic: req.body.cnic,
          password,
          name: req.body.name,
          fatherName: req.body.fatherName
        }).save()

        // send a message to admin here
        // we have to send a mobile message here
        res.status(201).send("OK")
      } catch (e) {
        throw `Unable to create. Reason: ${JSON.stringify(e)}`
      }

    }
  ]

  //#endregion
}
