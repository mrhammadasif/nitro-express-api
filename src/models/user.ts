import * as mongoose from "mongoose"
import * as autopopulate from "mongoose-autopopulate"
import * as idValidator from "mongoose-id-validator"
import { convertEnumToStringArray, hashPassword } from "../core/common"
import mongooseSanitize from "../core/sanitize-schema"

const Schema = mongoose.Schema

export interface IUser extends mongoose.Document {
  email: string
  name: string
  fatherName: string
  password: string
  cnic: string
  profilePicture: string
  address: string
  department: string
  profile: any
  mobile: string
  type: Roles
  // resetToken: string
}

export enum Roles {
  admin = "admin",
  manager = "manager"
}

export const RolesAll = [
  Roles.admin,
  Roles.manager
]

const mySchema = new Schema(
  {
    email: {
      required: "Email is required",
      index: true,
      unique: "User has already registered with the given email",
      type: String,
      trim: true,
      lowercase: true
    },
    name: String,
    fatherName: String,
    address: String,
    password: {
      required: "Password is required",
      type: String,
      set: hashPassword
    },
    mobile: {
      trim: true,
      type: String,
      required: "Your mobile no is your unique identity, it is required",
      unique: "User has already registered with the given mobile",
      index: true
    },
    cnic: {
      type: String,
      unique: "Student has already registered with the given CNIC",
      dropDups: true,
      sparse: true,
      index: true
    },
    profilePicture: {
      type: String,
      default: ""
    },
    // use this for saving any additional information for the user
    profile: mongoose.Schema.Types.Mixed,
    department: {
      type: String,
      default: ""
    },
    type: {
      type: String,
      default: Roles.manager,
      enum: convertEnumToStringArray(Roles)
    }
    // resetToken: {
    //   select: false,
    //   type: String
    // }

  },
  {
    timestamps: true
  }
)

mySchema.plugin(require("mongoose-unique-validator"))
mySchema.plugin(mongooseSanitize)
mySchema.plugin(idValidator)
mySchema.plugin(autopopulate)
mySchema.set("toObject", { getters: true })
mySchema.set("toJSON", { getters: true })

export default mongoose.model<IUser>("User", mySchema)
