import React from "react";
import { signInWithGoogle } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from '../../icons/logo.png'
// import Useronboarding from "./useronboarding";

const Home = () => {

  const navigate= useNavigate();

  const handleGoogleSignUp = async () => {
    try {
      const {onboarding, isNewUser} = await signInWithGoogle();
      
      console.log("Auth result:", { onboarding, isNewUser });
      
      // If user has completed onboarding, go to dashboard
      if (onboarding) {
        navigate("/dashboard");
      } else {
        // New user or user without onboarding data
        navigate("/useronboarding");
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      alert(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-br from-pink-300 to-blue-300 min-h-screen w-screen flex items-center justify-center px-4">
      <div className="w-full text-center px-4">
        {/* Logo */}
        <img
          src={logo}
          alt="DotDay Logo"
          className="mx-auto w-50 sm:w-20 md:w-50 mb-4"
        />

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-5xl font-black text-gray-900 mb-4 leading-snug">
          Breaking Silence, <br />
          Building Support
        </h1>

        {/* Paragraph */}
        <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 max-w-xl mx-auto px-2">
          DotDay breaks the silence around menstruation by promoting care,
          communication, and support between partners.
        </p>

        {/* Google Button */}
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-800 font-medium rounded-lg shadow hover:shadow-md transition w-full max-w-xs mx-auto"
        onClick={handleGoogleSignUp}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google Logo"
            className="w-5 h-5"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Home;