import { Router } from "express";
import { createUserController, deleteUserController, getAllUsersController, getUserByIdController } from "../../controllers/user.controller.js";

const router = Router();

router.post("/", createUserController);
router.get("/", getAllUsersController);
router.get("/:id", getUserByIdController);
router.delete("/:id", deleteUserController);


export default router;
