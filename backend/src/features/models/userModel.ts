import mongoose, { type HydratedDocument } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
export interface IUser {
    email: string;
    password?: string;
    isGuest: boolean;
}
export type UserDocument = HydratedDocument<IUser>;
const userSchema = new mongoose.Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, "Please enter an email"],
            unique: true,
            lowercase: true,
            validate: {
                validator: function(this: any, v: string) {
                    if (this.isGuest && v.endsWith('@devcode.local')) {
                        return true;
                    }
                    return validator.isEmail(v);
                },
                message: "Please enter a valid email"
            }
        },
        password: {
            type: String,
            required: function(this: any) {
                return !this.isGuest;
            },
            minlength: [
                6,
                "Minimum password length is 6 characters"
            ]
        },
        isGuest: {
            type: Boolean,
            default: false
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
    if (!this.password) {
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