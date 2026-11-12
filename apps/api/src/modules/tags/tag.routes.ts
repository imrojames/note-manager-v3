import { Router } from 'express';
import { createTagSchema } from '@note-manager/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { idParamsSchema } from '../../lib/validation.js';
import * as controller from './tag.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', controller.list);
router.post('/', validate({ body: createTagSchema }), controller.create);
router.delete('/:id', validate({ params: idParamsSchema }), controller.remove);

export default router;
