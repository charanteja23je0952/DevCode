import { z } from 'zod';

const signupSchema = z.object({
    email: z.email(),
    password: z.string().min(6)
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1)
});

type SignupBody = z.infer<typeof signupSchema>;
type LoginBody = z.infer<typeof loginSchema>;

export {
    signupSchema,
    loginSchema,
    type SignupBody,
    type LoginBody
};
