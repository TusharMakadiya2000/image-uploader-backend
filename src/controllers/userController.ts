import bcrypt from "bcrypt";
import User from "../models/User";
import Company from "../models/Company";
import { generateToken } from "../utils/auth";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Image from "../models/Image";
import { Request, Response } from "express";

const credentials = {
  accessKeyId: process.env.TEBI_S3_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.TEBI_S3_SECRET_ACCESS_KEY || "",
};

const s3Client = new S3Client({
  endpoint: process.env.TEBI_S3_ENDPOINT_URL,
  credentials,
  region: process.env.TEBI_S3_REGION,
});

// Add User
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, company, role, password } = req.body;

  if (!name || !email || !company || !role || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(409).json({ error: "Email already registered." });

    let companyRecord = await Company.findOne({ where: { name: company } });
    if (!companyRecord) {
      companyRecord = await Company.create({ name: company });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      role,
      password: hashedPassword,
      companyId: companyRecord.id,
    });

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update User
export const updateUser = async (req: Request, res: Response) => {
  const id = req.query.id;
  const { name, email, company, role } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  if (!name || !email || !company || !role) {
    return res.status(400).json({
      error: "Name, email, company, and role are required.",
    });
  }

  try {
    const user = await User.findByPk(Number(id));
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    let companyRecord = await Company.findOne({ where: { name: company } });
    if (!companyRecord) {
      companyRecord = await Company.create({ name: company });
    }

    await user.update({
      name,
      email,
      role,
      companyId: companyRecord.id,
    });

    return res.status(200).json({ message: "User updated successfully." });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ error: "Server error." });
  }
};

// Get user
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const user = await User.findByPk(Number(id), {
      include: {
        model: Company,
        attributes: ["name"],
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Login User
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(
      user.id,
      user.email,
      user.name,
      user.role,
      user.companyId
    );

    const { password: _, ...userData } = user.toJSON();

    res.status(200).json({ message: "Login successful", token, user: userData });
  } catch (err) {
    console.error("Login route error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all users
export const getAllUsers = async (req: any, res: Response) => {
  try {
    if (req.user.role !== "SA") {
      return res.status(403).json({ error: "Access denied" });
    }

    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "companyId"],
      include: [{ model: Company, attributes: ["name"] }],
    });

    res.status(200).json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Upload image on S3.
export const uploadImage = async (req: any, res: Response) => {
  try {
    const file = req.file;
    const type = req.body.type || "Image";

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileExt = file.originalname.split(".").pop();
    const key = `${type}/${uuidv4()}.${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: process.env.TEBI_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    const uploadedCompanyId =
      req.user.role === "SA" ? req.body.companyId : req.user.companyId;

    await Image.create({
      url: key,
      userId: req.user.id,
      companyId: uploadedCompanyId,
    });

    res.status(200).json({
      message: "Upload successful",
      key,
      url: url,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete user
export const deleteUser = async (req: any, res: Response) => {
  const userId = Number(req.params.id);

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    if (req.user.role !== "SA") {
      return res.status(403).json({ error: "Access denied." });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await user.destroy();

    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Server error." });
  }
};
