import type { Request, Response } from "express";
import { Types } from "mongoose";
import Submission from "../models/subModel.js";
import Question from "../models/quesModel.js";
import { getSubmissionSnapshot, getTestExecutionSnapshot } from "../questions/snapshotBuilder.js";
import catchAsync from '../../utils/catchAsync.js';
import { ok } from '../../utils/response.js';
import appError from '../../utils/appError.js';

export const get_submissions = catchAsync(async (req: Request, res: Response) => {
    const submissions = await Submission.find({
        userId: req.userId,
        questionId: req.params.id,
    }).sort({ attemptedAt: -1 });

    ok(res, "Submissions retrieved successfully", submissions);
});

export const get_submission_by_id = catchAsync(async (req: Request, res: Response) => {
    const submission = await Submission.findOne({
        _id: req.params.id,
        userId: req.userId,
    });

    if (!submission) {
        throw new appError('Submission not found', 404);
    }

    ok(res, "Submission retrieved successfully", submission);
});

export const add_submission = catchAsync(async (req: Request, res: Response) => {
    const { questionId, passed, submittedFiles, output } = req.body;

    if (!questionId || typeof passed !== 'boolean') {
        throw new appError('questionId and passed (boolean) are required', 400);
    }

    const question = await Question.findById(questionId);
    if (!question) {
        throw new appError('Question not found', 404);
    }

    const created = await Submission.create({
        userId: req.userId,
        questionId: new Types.ObjectId(questionId),
        passed,
        submittedFiles: submittedFiles ?? [],
        output: output ?? '',
        attemptedAt: new Date(),
        baseSnapshot: question.baseRepoSlug || '',
    });

    ok(res, "Submission created successfully", created, 201);
});

export const get_submission_snapshot = catchAsync(async (req: Request, res: Response) => {
    const submission = await Submission.findOne({
        _id: req.params.id,
        userId: req.userId,
    });

    if (!submission) {
        throw new appError('Submission not found', 404);
    }

    const question = await Question.findById(submission.questionId);
    if (!question) {
        throw new appError('Question not found', 404);
    }

    const snapshotBase = submission.baseSnapshot || question.baseRepoSlug;

    if (!snapshotBase) {
        throw new appError('No base snapshot available for this submission', 400);
    }

    const { tree, overlayPaths } = getSubmissionSnapshot(
        snapshotBase,
        submission.submittedFiles,
        question.overlaySlug,
        false
    );

    ok(res, "Submission snapshot retrieved successfully", { tree, overlayPaths });
});