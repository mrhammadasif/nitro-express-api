import UserModel, { Roles, IUser } from "../models/UserModel"

export default async function () {
  // your SEED data here
  const userCount = await UserModel.countDocuments()
  if (userCount <= 0) {
    // in case no user is there...
    // create user with type of admin
    new UserModel({
      name: "Admin",
      username: "admin",
      password: "Passw0rd123",
      isActive: true,
      type: Roles.admin
    } as IUser).save()
  }
}
