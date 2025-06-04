// import express from "express";
// import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";
// import Image from "../models/Image";
// import  User  from '../models/User';
// import  Company  from '../models/Company';

// const router = express.Router();


// router.get('/', authenticateToken, async (req: AuthRequest, res:any) => {
//   try {
//     const user = req.user;
//     let images;
//     const includeOptions = [
//       { model: User, attributes: ['name'] },
//       { model: Company, attributes: ['name'] }
//     ];

//     if (user.role === 'SA') {
//       images = await Image.findAll({ include: includeOptions });
//     } else if (user.role === 'admin') {
//       images = await Image.findAll({ where: { companyId: user.companyId }, include: includeOptions });
//     } else if (user.role === 'user') {
      
//       const companyId = Number(req.query.companyId);
//       if (!companyId) return res.status(400).json({ error: "Company ID is required." });

//       images = await Image.findAll({ where: { companyId },include: includeOptions });
//     } else {
//       return res.status(403).json({ error: "Unauthorized role" });
//     }

//     res.status(200).json(images);
//   } catch (err) {
//     console.error("Error fetching images:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// export default router;


import express from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { getImages } from "../controllers/imageController";

const router = express.Router();

router.get('/', authenticateToken, getImages);

export default router;
