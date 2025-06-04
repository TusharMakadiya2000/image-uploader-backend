// import express from 'express';
// import { authenticateToken } from '../middleware/authMiddleware';
// import  Company  from '../models/Company';

// const router = express.Router();

// router.get('/', authenticateToken, async (req, res) => {
//   try {
//     const companies = await Company.findAll({
//       attributes: ['id', 'name'],
//     });

//     res.json(companies);
//   } catch (error) {
//     console.error('Failed to fetch companies:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;


import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getCompanies } from '../controllers/companyController';

const router = express.Router();

router.get('/', authenticateToken, getCompanies);

export default router;
