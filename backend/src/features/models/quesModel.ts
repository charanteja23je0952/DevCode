import mongoose, { type HydratedDocument } from "mongoose";

export interface IQuestion {
    title: string;
    reproSteps: string;
    layer: string;
    difficulty: string;
    hints: string[];
    baseRepoSlug: string;
    overlaySlug: string;
    category: string;
}
export type QuestionDocument = HydratedDocument<IQuestion>;

const questionSchema = new mongoose.Schema<IQuestion>(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        reproSteps: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true,
            enum: ['state', 'api-contract', 'auth', 'query']
        },
        layer: {
            type: String,
            required: true,
            enum: ["frontend", "backend", "fullstack"]
        },
        difficulty: {
            type: String,
            required: true,
            enum: ["easy", "medium", "hard"]
        },
        hints: {
            type: [String],
            default: []
        },
        baseRepoSlug: {
            type: String,
            required: true
        },
        overlaySlug: {
            type: String,
            required: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
);

const Question = mongoose.model<IQuestion>(
    "question",
    questionSchema

);
export default Question;