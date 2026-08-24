import mongoose, { type HydratedDocument } from "mongoose";

export interface IRepo {
    slug: string;
    description: string;
}
export type RepoDocument = HydratedDocument<IRepo>;

const repoSchema = new mongoose.Schema<IRepo>(
    {
        slug: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Repo = mongoose.model<IRepo>(
    "repo",
    repoSchema
);

export default Repo;