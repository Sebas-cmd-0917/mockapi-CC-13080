import { Router } from 'express';
import { create, getByCode } from '../controllers/item.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

router.use(requireAuth);

router.post('/', create);
router.get('/:code', getByCode);

export default router;
