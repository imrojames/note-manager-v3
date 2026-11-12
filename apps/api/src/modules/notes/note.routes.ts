import { Router } from 'express';
import { createNoteSchema, updateNoteSchema, listNotesQuerySchema } from '@note-manager/shared';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { idParamsSchema } from '../../lib/validation.js';
import * as controller from './note.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', validate({ query: listNotesQuerySchema }), controller.list);
router.post('/', validate({ body: createNoteSchema }), controller.create);
router.get('/:id', validate({ params: idParamsSchema }), controller.getOne);
router.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateNoteSchema }),
  controller.update,
);
router.delete('/:id', validate({ params: idParamsSchema }), controller.remove);

export default router;
