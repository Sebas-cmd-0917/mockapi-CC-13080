import { Router } from 'express';
import { create } from '../controllers/invoice.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/', create);

export default router;
