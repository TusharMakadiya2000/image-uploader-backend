import { Request, Response } from 'express';
import Company from '../models/Company';

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.findAll({
      attributes: ['id', 'name'],
    });

    return res.status(200).json(companies);
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
