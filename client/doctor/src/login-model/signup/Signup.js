import React, { useRef, useState } from "react";
import axios from "axios";
import * as validate from "../../utils/validations/Validations";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const [licenseName, setLicenseName] = useState(""); // for showing file name
  const [base64Image, setBase64Image] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    let error = "";
    switch (name) {
      case "fullName":
        if (!validate.name(value))
          error = "Name cannot have special characters or digits";
        break;
      case "email":
        if (!validate.email(value)) error = "Email must fulfill requirements";
        break;
      case "password":
        if (!validate.password(value))
          error = "Password must fulfill requirements";
        break;
      case "confirmPassword":
        if (value !== formData.password) error = "Passwords do not match";
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleImage = () => {
    inputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64Image(reader.result); // base64 string with mime prefix
      };
      reader.readAsDataURL(file);
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5 MB limit
      alert("File size exceeds 5MB limit.");
      return;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final password confirm validation before submit
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      return;
    }

    // Check for existing validation errors
    const hasError = Object.values(errors).some((err) => err);
    if (hasError) return;

    // Check required license base64 image exists
    if (!base64Image) {
      setErrors((prev) => ({
        ...prev,
        license: "Please upload your medical license",
      }));
      return;
    } else {
      setErrors((prev) => ({ ...prev, license: "" }));
    }

    // Send form data + license base64 string to backend
    axios
      .post(`${API_URL}/api/doctor/doctor_signUp`, {
        ...formData,
        license: base64Image,
      })
      .then((response) => {
        console.log("API response:", response.data);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="min-h-screen flex bg-[#2D0101]">
      <div className="hidden md:flex relative w-[50%] bg-[#5c4444] text-white">
        <img
          src="/assest/doctor-signup.png"
          alt="doctors-image"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute z-10 bottom-[61px] px-[40px]">
          <h1 className="text-[32px] font-bold mb-4 leading-[48px]">
            HeartShield
          </h1>
          <p className="text-[14px] leading-[27px] tracking-[1px] w-[331px]">
            Join our network of healthcare professionals in revolutionizing
            cardiac care
          </p>
        </div>
      </div>

      <div className="w-[50%] p-[80px] text-[#FFFF] flex flex-col justify-center">
        <h2 className="text-[32px] font-bold mb-[12px]">Doctor Registration</h2>
        <p className="text-[#999999] mb-[42px] text-[16px]">
          Create your account to start monitoring your heart health
        </p>

        <form onSubmit={handleSubmit} className="text-[14px] space-y-[24px]">
          <div>
            <label className="block mb-[6px]">Full Name</label>
            <input
              name="fullName"
              type="text"
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 bg-[#722626] text-white rounded border border-transparent focus:outline-none focus:border-[#580101]"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block mb-[6px]">Email Address</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 bg-[#722626] text-white rounded border border-transparent focus:outline-none focus:border-[#580101]"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-[6px]">Medical License Upload</label>

            {/* Styled button to trigger file input */}
            <div
              onClick={handleImage}
              className="w-full px-4 py-2 bg-[#722626] text-white rounded border border-transparent text-center cursor-pointer hover:bg-[#8d3b3b]"
            >
              {licenseName || "Upload Medical License"}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              id="license"
              accept="image/png, image/jpeg"
              required
              ref={inputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {errors.license && (
              <p className="text-red-500 text-sm mt-1">{errors.license}</p>
            )}
          </div>

          <div>
            <label className="block mb-[6px]">Password</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              placeholder="Create password"
              className="w-full px-4 py-2 bg-[#722626] text-white rounded border border-transparent focus:outline-none focus:border-[#580101]"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block mb-[6px]">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full px-4 py-2 bg-[#722626] text-white rounded border border-transparent focus:outline-none focus:border-[#580101]"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="py-[40px]">
            <button
              type="submit"
              className="w-full py-2 bg-[#580101] hover:bg-red-800 rounded"
            >
              Create Account
            </button>
          </div>
        </form>

        <p className="text-sm mt-4 text-center text-gray-300">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#FF4444] hover:underline cursor-pointer"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
