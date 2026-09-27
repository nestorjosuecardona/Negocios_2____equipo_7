import { getMetrics } from '../repositories/metricsRepository.js';
export async function index(req,res){ res.json(await getMetrics()); }
