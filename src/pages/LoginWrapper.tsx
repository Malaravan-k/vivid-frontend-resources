import React, { ReactNode } from "react";
import LoginImage from '../assets/LoginImage.jpg';

interface WrapperProps {
  children: ReactNode;
}

const LoginWrapper: React.FC<WrapperProps> = ({ children }) => {
  return (
    <div className=" min-h-fit bg-gradient-to-br flex items-center justify-center ">
      <div className="w-full max-w-6xl min-h-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Form Content */}
        <div className="w-full md:w-1/2 py-20 flex flex-col justify-center">
          {children}
        </div>

        {/* Right Side: Image */}
        <div className="hidden md:block md:w-1/2 relative">
          <img 
            src={LoginImage} 
            alt="Login Visual" 
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-8">
            <div className="text-white">
              <h3 className="text-2xl font-bold">Welcome to Voxlane</h3>
              <p className="mt-2 opacity-90">Streamline your workflow with our powerful dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginWrapper;