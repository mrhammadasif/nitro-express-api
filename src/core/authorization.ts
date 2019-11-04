import * as express from "express"
import * as jwt from "jsonwebtoken"
import { each, hasIn, indexOf } from "lodash"
import UserModel, { Roles } from "../models/user"

require("dotenv").config()

const privateFile = process.env.SECRET

const algo = "HS512"

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string
        name?: string
        mobile?: string
        email?: string
        token?: string
        type?: string
        profile?: any
      }
    }
  }
}

export function signJwt (objToSign: object, expiresIn: string | null = null) {
  const jwtOptions: any = {
    algorithm: algo
  }

  if (expiresIn) {jwtOptions.expiresIn = expiresIn}
  return jwt.sign(objToSign, privateFile, jwtOptions)
}

/**
 * middleware to validate the jsonWebToken
 * only supporting token string to be present in jwt token
 */
export function authorizeByRole (...rolesEnum: Roles[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    let token: string = req.header("Authorization") || req.body.token || req.query.token || ""
    token = typeof token !== "undefined" && token.length > 0 ? token.trim() : token
    const roles: string[] = []
    if (token) {
      // valid type of authorization is provided
      jwt.verify(token, privateFile, { algorithms: [algo] }, (err, _doc: any) => {
        if (err) {
          return res.status(401).json(err)
        }
        // allRoles = convertEnumToStringArray(Roles)
        each(rolesEnum, (e) => {
          roles.push(Roles[e])
        })

        // log.info(roles)
        if (_doc) {
          UserModel.findOne({
            _id: _doc._a
            // password: decrypt(_doc._a)
            // type: { $in: roles }
          })
            .then((userObj: any) => {
              if (userObj) {
                if (hasIn(userObj, "type")) {
                  if (indexOf(roles, userObj.type) < 0) {
                    return res.status(403).json("User not allowed to make this request")
                  }
                } else {
                  return res.status(401).json("Invalid Auth Code found")
                }

                if (hasIn(userObj, "profile")) {
                  req.user = userObj.profile || {}
                  req.user._id = userObj._id
                  req.user.type = userObj.type
                }
                next()
              } else {
                return res.status(401).json("No User Found with the given detail")
              }
            })
            .catch((err) => {
              console.error(err)
              return res.status(401).json(err || err.message)
            })
        } else {
          return res.status(401).json("Invalid Authorization Code")
        }
      })
    } else {
      return res.status(400).json("Authorization Code is required for this request")
    }
  }
}
