import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import noteRoutes from './modules/notes/note.routes.js';
import noteTypeRoutes from './modules/note-types/note-type.routes.js';
import tagRoutes from './modules/tags/tag.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/notes', noteRoutes);
router.use('/note-types', noteTypeRoutes);
router.use('/tags', tagRoutes);

export default router;
