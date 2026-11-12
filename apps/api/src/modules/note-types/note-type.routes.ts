import { Router } from 'express';
import { createNoteTypeSchema, updateNoteTypeSchema } from '@note-manager/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { idParamsSchema } from '../../lib/validation.js';
import * as controller from './note-type.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', controller.list);
router.post('/', validate({ body: createNoteTypeSchema }), controller.create);
router.get('/:id', validate({ params: idParamsSchema }), controller.getOne);
router.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateNoteTypeSchema }),
  controller.update,
);
router.delete('/:id', validate({ params: idParamsSchema }), controller.remove);

export default router;
