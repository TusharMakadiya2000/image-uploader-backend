import express from "express";
import multer from "multer";
import {
  registerUser,
  updateUser,
  getUser,
  loginUser,
  getAllUsers,
  uploadImage,
  deleteUser,
} from "../controllers/userController";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.post("/register", registerUser);

router.put("/update", updateUser);

router.get("/getuser", getUser);

router.post("/login", loginUser);

router.get("/", authenticateToken, getAllUsers);

router.post("/upload", authenticateToken, upload.single("image"), uploadImage);

router.delete("/:id", authenticateToken, deleteUser);

export default router;
