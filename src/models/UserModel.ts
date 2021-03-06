import * as mongoose from "mongoose"
import * as autopopulate from "mongoose-autopopulate"
import * as idValidator from "mongoose-id-validator"
import { convertEnumToStringArray, hashPassword } from "../core/common"
import mongooseSanitize from "../core/sanitize-schema"

const Schema = mongoose.Schema

export interface IUser extends mongoose.Document {
  username: string
  name: string
  password: string
  isActive: boolean
  passwordSet: boolean
  profilePicture: string
  type: Roles
  resetToken: string
}

export enum Roles {
  admin = "admin",
  customer = "customer",
  manager = "manager"
}

export const RolesAll = [
  Roles.admin,
  Roles.manager,
  Roles.customer
]

const mySchema = new Schema(
  {
    username: {
      required: "Username is required",
      index: true,
      unique: "User has already registered with the given username",
      type: String,
      trim: true,
      lowercase: true
    },
    name: String,
    address: String,
    password: {
      required: "Password is required",
      type: String,
      set: hashPassword
    },
    passwordSet: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    profilePicture: {
      type: String,
      default: ""
    },
    // use this for saving any additional information for the user
    // profile: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      default: Roles.customer,
      enum: convertEnumToStringArray(Roles)
    },
    resetToken: {
      select: false,
      type: String
    }

  },
  {
    timestamps: true
  }
)

mySchema.plugin(require("mongoose-unique-validator"))
mySchema.plugin(mongooseSanitize)
mySchema.plugin(idValidator)
mySchema.plugin(autopopulate)
mySchema.set("toObject", {
  getters: true
})
mySchema.set("toJSON", {
  getters: true
})

export default mongoose.model<IUser>("User", mySchema)
