import mongoose, { type HydratedDocument } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
export interface IUser {
    email: string;
    password: string;
}
export type UserDocument = HydratedDocument<IUser>;
const userSchema = new mongoose.Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, "Please enter an email"],
            unique: true,
            lowercase: true,
            validate: [
                validator.isEmail,
                "Please enter a valid email"
            ]
        },
        password: {
            type: String,
            required: [
                true,
                "Please enter a password"
            ],
            minlength: [
                6,
                "Minimum password length is 6 characters"
            ]
        }
    },
    {
        timestamps: true
    }
);
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(
        this.password,
        salt
    );
});
const User = mongoose.model<IUser>(
    "user",
    userSchema
);
export default User;