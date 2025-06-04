import { Response } from "express";
import Image from "../models/Image";
import User from "../models/User";
import Company from "../models/Company";
import { AuthRequest } from "../middleware/authMiddleware";

export const getImages = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    let images;
    const includeOptions = [
      { model: User, attributes: ['name'] },
      { model: Company, attributes: ['name'] }
    ];

    if (user.role === 'SA') {
      images = await Image.findAll({ include: includeOptions });
    } else if (user.role === 'admin') {
      images = await Image.findAll({ where: { companyId: user.companyId }, include: includeOptions });
    } else if (user.role === 'user') {
      const companyId = Number(req.query.companyId);
      if (!companyId || isNaN(companyId)) {
        return res.status(400).json({ error: "Company ID is required and must be a number." });
      }
      images = await Image.findAll({ where: { companyId }, include: includeOptions });
    } else {
      return res.status(403).json({ error: "Unauthorized role" });
    }

    return res.status(200).json(images);
  } catch (err) {
    console.error("Error fetching images:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
