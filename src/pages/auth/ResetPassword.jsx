import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../config/api";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [token, setToken] = useState("");

    useEffect(() => {
        const resetToken = searchParams.get("token");
        if (!resetToken) {
            setErrors({ token: "Invalid or missing reset token" });
        } else {
            setToken(resetToken);
        }
    }, [searchParams]);

    const validate = () => {
        const newErrors = {};

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setErrors({ submit: "Invalid reset token" });
            return;
        }

        if (validate()) {
            setIsLoading(true);
            try {
                await api.resetPassword(token, formData.password);
                setIsLoading(false);
                setIsSuccess(true);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } catch (error) {
                setIsLoading(false);
                setErrors({ submit: error.message || "Failed to reset password. The link may have expired." });
            }
        }
    };

    if (errors.token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
                    <p className="text-gray-500 text-sm mb-8">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link
                        to="/forgot-password"
                        className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-100 blur-[100px] opacity-60"></div>
                <div className="absolute bottom-[0%] left-[0%] w-[40%] h-[40%] rounded-full bg-purple-100 blur-[100px] opacity-60"></div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md z-10 border border-gray-100/50 backdrop-blur-sm">
                {!isSuccess ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 mb-4">
                                <Lock size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                            <p className="text-gray-500 mt-2 text-sm">Enter your new password below</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm outline-none transition-all duration-200 ${
                                            errors.password
                                                ? "border-red-300 focus:ring-4 focus:ring-red-100"
                                                : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                        }`}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value });
                                            if (errors.password) setErrors({ ...errors, password: null });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{errors.password}</p>}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-gray-50/50 focus:bg-white text-sm outline-none transition-all duration-200 ${
                                            errors.confirmPassword
                                                ? "border-red-300 focus:ring-4 focus:ring-red-100"
                                                : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                        }`}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            setFormData({ ...formData, confirmPassword: e.target.value });
                                            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{errors.confirmPassword}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-xl text-white text-sm font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95 transition-all duration-200 ${
                                    isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                }`}
                            >
                                {isLoading ? (
                                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                            {errors.submit && (
                                <p className="text-xs text-red-500 font-medium text-center mt-2">{errors.submit}</p>
                            )}
                        </form>

                        <div className="mt-8 text-center">
                            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                Back to Login
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-6 animate-bounce-slow">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                        <p className="text-gray-500 text-sm mb-8">
                            Your password has been successfully reset. Redirecting to login...
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
