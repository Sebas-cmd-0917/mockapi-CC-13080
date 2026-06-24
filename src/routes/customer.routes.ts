import { Router } from 'express';
import { create, getByNit } from '../controllers/customer.controller';
import { requireAuth } from '../middlewares/auth';

const router = Router();

// Todas las rutas de clientes requieren el Token JWT
router.use(requireAuth);

router.post('/', create);
router.get('/:nit', getByNit);

export default router;