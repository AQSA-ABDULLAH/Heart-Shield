import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUpWithEmail } from "../redux/containers/auth/actions";
import { Link } from "react-router-dom";

function LoginModal() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValid, setEmailValid] = useState(true);
  const [isPasswordValid, setPasswordValid] = useState(true);
  const { loading, error, payload } = useSelector((state) => state?.auth);
  const dispatch = useDispatch();

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
    };

    if (email) {
      setEmailValid(true);
      if (password) {
        setPasswordValid(true);
        dispatch(signUpWithEmail(userData));
      } else {
        setPasswordValid(false);
      }
    } else {
      setEmailValid(false);
      setPasswordValid(false);
    }
  };

  const handleChange = (event, type) => {
    if (type === "email") {
      setEmail(event.target.value);
    } else {
      setPassword(event.target.value);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-[#2D0101] text-white font-inter">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 relative justify-center">
        <img
          src="/assest/login.png"
          alt="Car"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute z-10 bottom-[61px] px-[150px]">
          <h1 className="text-[32px] font-bold mb-4 leading-[48px]">
            HeartShield
          </h1>
          <p className="text-[14px] leading-[27px] tracking-[1px]">
            Revolutionizing heart health monitoring with artificial intelligence
          </p>
        </div>
      </div>

      {/* Right Side (Login Form) */}
      <div className="w-full md:w-1/2 bg-white text-black flex items-center justify-center px-[140px] py-12">
        <div className="w-full max-w-md space-y-[30px]">
          <h2 className="text-[32px] font-bold leading-[48px]">Doctor Login</h2>
          <p className="text-[16px] text-[#999] leading-[24px]">
            Please enter your credentials to access admin panel
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-1">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => handleChange(e, "email")}
                className={`w-full px-4 py-2 bg-[#B55151] text-white rounded-md focus:outline-none ${
                  !isEmailValid && "border-2 border-red-500"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  required
                  onChange={(e) => handleChange(e, "password")}
                  className={`w-full px-4 py-2 bg-[#B55151] text-white rounded-md focus:outline-none ${
                    !isPasswordValid && "border-2 border-red-500"
                  }`}
                />
                {/* <img
                  onPointerDown={togglePasswordVisibility}
                  src={
                    showPassword
                      ? "/assets/images/login/solar_eye-closed-bold.png"
                      : "/assets/images/login/solar_eye-bold.png"
                  }
                  alt="toggle visibility"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer w-5"
                /> */}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Remember me
              </label>
              <Link
                to="/forget-password-otp"
                className="text-[#FF4444] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#580101] hover:bg-red-800 text-white font-semibold py-2 rounded-md"
            >
              SIGN IN
            </button>
          </form>

          <p className="text-sm text-gray-400 text-center">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-[#FF4444] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
