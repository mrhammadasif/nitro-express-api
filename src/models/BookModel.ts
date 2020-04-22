import * as mongoose from "mongoose"
import * as autopopulate from "mongoose-autopopulate"
import * as idValidator from "mongoose-id-validator"
import mongooseSanitize from "../core/sanitize-schema"
import UserModel, { IUser } from "./UserModel"

const Schema = mongoose.Schema

export interface IBook extends mongoose.Document {
  isbn: string
  title: string
  author: IUser | string
  price: number
}

const mySchema = new Schema(
  {
    isbn: {
      required: "ISBN is required for the book",
      index: true,
      unique: true,
      type: String,
      default: ""
    },
    title: {
      required: "Book title is required",
      type: String
    },
    author: {
      required: "Author is required",
      ref: UserModel.modelName,
      type: Schema.Types.ObjectId,
      autopopulate: true
    },
    price: {
      type: Number,
      default: 0.00
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

export default mongoose.model<IBook>("Book", mySchema)
