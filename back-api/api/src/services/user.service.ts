// parle à la base de données - contient la logique métier - ne connaît rien de HTTP
import { UserModel } from "../models/user.model.js";
import type { User } from "../types/user.type.js";
import type { CreateUserInput } from "../schemas/user.schema.js";

export const createUser = async (userData: CreateUserInput) => {
  const user = new UserModel(userData);
  return await user.save();
};

export const getAllUsers = async (): Promise<User[]> => {
  return await UserModel.find();
};

export const getUserById = async (id: string): Promise<User | null> => {
  return await UserModel.findById(id);
};

/* export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  return await UserModel.findByIdAndUpdate(id, userData, { new: true });
}; */

export const deleteUser = async (id: string): Promise<User | null> => {
  return await UserModel.findByIdAndDelete(id);
};

