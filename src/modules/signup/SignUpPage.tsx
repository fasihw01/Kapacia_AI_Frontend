import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginLeftAnime from "@/modules/login/components/LoginLeftAnime";
import { Input } from "@/components/Input";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "react-toastify";

function SignUpPage() {
  const [organisationName, setOrganisationName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const userData = await register(organisationName, name, email, password);
      toast.success("Account created successfully!");
      if (userData?.role === "admin" || userData?.role === "moderator" || userData?.role === "organisation") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen overflow-hidden">
      <div className="flex flex-col justify-center items-center px-8 py-8 w-full md:w-1/2 text-white">
        <div className="space-y-4 w-full max-w-md">
          <div className="text-center">
            <img
              src="/images/auth/logo.svg"
              alt="Zyranor Logo"
              width={171}
              height={48}
              className="mx-auto mb-6"
            />
            <h1 className="bg-clip-text font-semibold text-primary text-xl">
              Create Organiser Account
            </h1>
            <p className="mt-1 text-gray-500 text-sm">
              Sign up to get started as an Organiser
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="organisationName"
              type="text"
              placeholder="Organisation Name"
              className="backdrop-blur-sm px-4 py-4 border border-white/10 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-primary-foreground transition-all duration-200 placeholder-gray-500"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
              required
            />
            <Input
              id="name"
              type="text"
              placeholder="Full Name"
              className="backdrop-blur-sm px-4 py-4 border border-white/10 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-primary-foreground transition-all duration-200 placeholder-gray-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              className="backdrop-blur-sm px-4 py-4 border border-white/10 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-primary-foreground transition-all duration-200 placeholder-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              type="password"
              placeholder="Password"
              className="backdrop-blur-sm px-4 py-4 border border-white/10 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-primary-foreground transition-all duration-200 placeholder-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              showPasswordToggle
            />

            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              className="backdrop-blur-sm px-4 py-4 border border-white/10 focus:border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-primary-foreground transition-all duration-200 placeholder-gray-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              showPasswordToggle
            />

            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary disabled:opacity-50 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 w-full font-semibold text-white disabled:transform-none hover:scale-[1.02] transition-all duration-200 disabled:cursor-not-allowed transform"
            >
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <div className="mr-2 border-2 border-white/30 border-t-white rounded-full w-5 h-5 animate-spin"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-blue-300 transition-colors hover:underline"
                >
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      <div className="hidden relative md:flex justify-center items-center md:w-1/2">
        <LoginLeftAnime />
      </div>
    </div>
  );
}

export default SignUpPage;
