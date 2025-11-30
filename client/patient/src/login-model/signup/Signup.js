import React, { useState } from "react";
import axios from "axios";
import * as validate from "../../utils/validations/Validations";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    age: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validation handling
    let error = "";
    switch (name) {
      case "fullName":
        if (!validate.name(value)) error = "Name cannot have special characters or digits";
        break;
      case "age":
        if (!validate.age(value)) error = "Age must be a number";
        break;
      case "email":
        if (!validate.email(value)) error = "Email must fulfill requirements";
        break;
      case "phoneNumber":
        if (!validate.phoneNumber(value)) error = "Phone number must be 11 digits";
        break;
      case "password":
        if (!validate.password(value)) error = "Password must fulfill requirements";
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final check for password match
    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }

    const hasError = Object.values(errors).some((err) => err);
    if (!hasError) {
      axios.post(`${API_URL}/api/user/patient_signUp`, formData)
        .then((response) => {
          console.log("API response:", response.data);
          navigate('/login');
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  return (
    <div className="min-h-screen flex bg-[#2D0101]">
{/* Left Side (Image + Text) */}
<div className="hidden md:flex relative w-[60%] bg-[#5c4444] text-white">
        <img
          src="/assest/patient signup.png"
          alt="doctors-image"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute z-10 bottom-[61px] px-[40px]">
          <h1 className="text-[32px] font-bold mb-4 leading-[48px]">HeartShield</h1>
          <p className='text-[14px] leading-[27px] tracking-[1px] w-[220px]'>
          Take control of your heart health with advanced AI monitoring
          </p>
        </div>
      </div>

      <div className="w-[40%] p-[80px] text-[#FFFF] flex flex-col justify-center">
        <h2 className="text-[32px] font-bold mb-[12px]">Patient Registration</h2>
        <p className="text-[#999999] mb-[42px] text-[16px]">
          Create your account to start monitoring your heart health
        </p>

        <form className="text-[14px] space-y-[24px]">
          <div>
            <label className="block mb-[6px]">Full Name</label>
            <input
              name="fullName"
              type="text"
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full px-4 py-2 bg-[#722626] text-white rounded border border-transparent focus:outline-none focus:border-[#580101]"
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
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
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
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
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
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
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>

          <div>
            <label className="block mb-[6px]">Age</label>
            <input
              name="age"
              type="text"
              onChange={handleChange}
              placeholder="Age"
              className="w-full px-4 py-2 bg-[#722626] text-white rounded border border-transparent focus:outline-none focus:border-[#580101]"
            />
            {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
          </div>

          <div>
            <label className="block mb-[6px]">Phone Number (Optional)</label>
            <input
              name="phoneNumber"
              type="tel"
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-2 bg-[#722626] text-white rounded border border-transparent focus:outline-none focus:border-[#580101]"
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
          </div>

          <div className="py-[40px]">
            <button
              type="submit"
              onClick={handleSubmit}
              className="w-full py-2 bg-[#580101] hover:bg-red-800 rounded"
            >
              Create Account
            </button>
          </div>
        </form>

        <p className="text-sm mt-4 text-center text-gray-300">
          Already have an account?{" "}
          <span className="text-[#FF4444] cursor-pointer">Sign in</span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
