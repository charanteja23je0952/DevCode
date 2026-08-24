import express, { Router } from 'express';
import { require_auth } from '../../middleware/authMiddleware.js';
import { getQuestions, getQuestionById, getQuestionSnapshot } from './quesController.js';
const router: Router = express.Router();

router.get(
    '/questions',
    require_auth,
    getQuestions
);

router.get(
    '/questions/:id',
    require_auth,
    getQuestionById
);

router.get(
    '/questions/:id/snapshot',
    require_auth,
    getQuestionSnapshot
);

export default router;