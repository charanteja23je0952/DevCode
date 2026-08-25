import type { Request, Response } from 'express';
import Question from '../models/quesModel.js';
import catchAsync from '../../utils/catchAsync.js';
import { ok } from '../../utils/response.js';
import appError from '../../utils/appError.js';
import { getMergedSnapshot } from './snapshotBuilder.js';

export const getQuestions = catchAsync(async (req: Request, res: Response) => {
    const { layer } = req.query as { layer?: string };
    const filter = layer ? { layer } : {};
    const questions = await Question.find(filter).select('-category');
    ok(res, "Questions retrieved successfully", questions);
});


export const getQuestionById = catchAsync(async (req: Request, res: Response) => {
    const question = await Question.findById(req.params.id).select('-category');
    if (!question) {
        throw new appError('Question not found', 404);
    }
    ok(res, "Question retrieved successfully", question);
});

export const getQuestionSnapshot = catchAsync(async (req: Request, res: Response) => {
    const question = await Question.findById(req.params.id);
    if (!question) {
        throw new appError('Question not found', 404);
    }

    try {
        const { tree, overlayPaths } = getMergedSnapshot(question.baseRepoSlug, question.overlaySlug);
        ok(res, "Snapshot built successfully", { tree, overlayPaths });
    } catch (err) {
        throw new appError('Failed to build snapshot for this question', 500);
    }
});