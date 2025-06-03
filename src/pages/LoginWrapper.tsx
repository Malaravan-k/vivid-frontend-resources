import React, { ReactNode } from "react";
import LoginImage from '../assets/LoginImage.jpg'

interface WrapperProps {
  children: ReactNode;
}

const LoginWrapper: React.FC<WrapperProps> = ({ children}) => {
  return (
    <div className="flex min-h-screen rounded-lg overflow-hidden" >
      {/* Left Side: Children */}
      <div className="flex-1">
        {children}
      </div>

      {/* Right Side: Image */}
      <div className="hidden md:flex md:w-1/2 rounded-lg overflow-hidden">
        <img src={LoginImage} alt="LoginImage" className="object-cover w-full h-full" />
      </div>
    </div>
  );
};

export default LoginWrapper;
