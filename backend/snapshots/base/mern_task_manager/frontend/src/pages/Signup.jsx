import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

const createUser = async (userData) => {
  const { data } = await axios.post(`${baseURL}/api/v1/user/signup`, userData);
  return data;
};

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password should be at least 8 characters"),
});

function Signup() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signupSchema),
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      dispatch(setCredentials(data));
      queryClient.setQueryData(["user"], data);
      toast.success("Account created successfully");
      navigate("/");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Unable to create your account"
      );
    },
  });

  const signup = (data) => mutation.mutate(data);

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4">
      <div className="mx-auto w-full max-w-md rounded-xl p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-blue-600">Create account</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sign up with your email and password
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <form onSubmit={handleSubmit(signup)}>
            <div className="space-y-4 p-6">
              <div>
                <Input
                  placeholder="Email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                textColor="text-white"
                type="submit"
                className="w-full"
                disabled={isSubmitting || mutation.isPending}
              >
                {isSubmitting || mutation.isPending
                  ? "Creating account..."
                  : "Create account"}
              </Button>
            </div>

            <p className="border-t border-gray-100 px-6 py-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
