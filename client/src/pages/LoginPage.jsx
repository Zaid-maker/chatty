import React from "react";
import AuthImagePattern from "../components/AuthImagePattern";
import { MessageSquare } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center mb-8">
                <div className="flex flex-col items-center gap-2 group">
                    <div>
                    <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                </div>
            </div>
        </div>
      </div>
      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={"Welcome back!"}
        subtitle={
          "Sign in to continue your conversations and catch up with your messages."
        }
      />
    </div>
  );
};

export default LoginPage;
