import { Router } from 'express';
import { create, getByCode, list } from '../controllers/product.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.get('/', list);
router.post('/', create);
router.get('/:code', getByCode);

export default router;
