import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { authService, employeeService } from "../../services";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await api.forgotPassword(email);
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "Failed to send reset email. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] rounded-full bg-purple-100 blur-[100px] opacity-60"></div>
      </div>

      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md z-10 border border-gray-100/50 backdrop-blur-sm transition-all">
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
                <Mail size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Forgot Password?
              </h2>
              <p className="text-gray-500 mt-2 text-sm">
                Enter your email and we'll send you a link to reset your
                password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm outline-none transition-all duration-200
                      ${
                        error
                          ? "border-red-300 focus:ring-4 focus:ring-red-100"
                          : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                      }`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                  />
                </div>
                {error && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95 transition-all duration-200
                  ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" /> Back to Login
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-6 animate-bounce-slow">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              We have sent a password reset link to{" "}
              <span className="font-semibold text-gray-700">{email}</span>.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-gray-100 text-gray-900 text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" /> Back to Login
            </Link>
            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-6 text-sm text-blue-600 font-medium hover:underline"
            >
              Didn't receive the email? Click to resend
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
