import mongoose, { Types, type HydratedDocument } from "mongoose";

export interface ISubmission {
    userId: Types.ObjectId;
    questionId: Types.ObjectId;
    passed: boolean;
    submittedFiles: { path: string; contents: string }[];
    output: string;
    attemptedAt: Date;
    baseSnapshot?: string;
}
export type SubmissionDocument = HydratedDocument<ISubmission>;

const submissionSchema = new mongoose.Schema<ISubmission>(
    {
        userId: {
            type: Types.ObjectId,
            required: true
        },
        questionId: {
            type: Types.ObjectId,
            required: true
        },
        passed: {
            type: Boolean,
            required: true
        },
        submittedFiles: {
            type: [{ path: String, contents: String }],
            required: true
        },
        output: {
            type: String,
            required: true
        },
        attemptedAt: {
            type: Date,
            required: true
        },
        baseSnapshot: {
            type: String,
            required: false,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

const Submission = mongoose.model<ISubmission>(
    "submission",
    submissionSchema
);

export default Submission;