// HTTP layer => reçoit la requête - appelle le service - renvoie une réponse
import type { Request, Response, NextFunction } from "express";
import { createUserSchema, paramsSchema } from "../schemas/user.schema.js";
import { createUser, getAllUsers, getUserById, deleteUser } from "../services/user.service.js";
import type { GetUserParams } from "../types/user.type.js";
import { ZodError } from "zod";

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await createUser(validatedData);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.issues,
      });
    }
    next(error);
  }
};

export const getAllUsersController = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

export const getUserByIdController = async (req: Request<GetUserParams>, res: Response) => {
  try {
    const { id } = paramsSchema.parse(req.params);
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

export const deleteUserController = async (req: Request<GetUserParams>, res: Response) => {
  try {
    const { id } = paramsSchema.parse(req.params);
    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
