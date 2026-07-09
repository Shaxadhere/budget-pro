import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { verifyOtp, forgotPassword } from "../../api/auth";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { KeyRound, ArrowRight } from "lucide-react";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await verifyOtp(email, otp);
      toast.success("OTP Verified");
      navigate("/reset-password", { state: { email, otp } });
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await forgotPassword(email);
      toast.success("OTP sent again");
    } catch (error) {
      toast.error("Failed to resend OTP");
    }
  };

  if (!email) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg border border-slate-100">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <KeyRound className="h-7 w-7 text-indigo-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Verify OTP
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            We sent a code to{" "}
            <span className="font-medium text-slate-900">{email}</span>. Enter
            it below to verify your identity.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              One-Time Password
            </label>
            <Input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Check your email for OTP"
              className="h-11 text-center tracking-widest font-mono text-lg"
              maxLength={6}
            />
          </div>

          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>

        <div className="text-center text-sm">
          <p className="text-slate-500">
            Didn't receive the code?{" "}
            <button
              onClick={handleResendOtp}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Resend
            </button>
          </p>
        </div>
        <div className="text-center mt-4">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
