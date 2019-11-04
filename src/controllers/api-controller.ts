import { Request, Response, Router } from "express"
import "express-async-errors"
import { body } from "express-validator"
import { authorizeByRole } from "../core/authorization"
import { randPassword } from "../core/common"
import { validationErrorChecker } from "../core/error-handler"
import UserModel, { Roles } from "../models/user"

require("dotenv").config()

export class Controller {

  getRouter (): Router {
    const router = Router()
    // all requests after this line will be authorized by default
    router.get("/",  (req, res) => {res.send("Forbidden Area!") })
    router.use(authorizeByRole(Roles.admin))

    router.get("/",  this.getUsers)

    return router
  }

  getUsers = async function (req: Request, res: Response) {
    res.send(await UserModel.find({}))
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
