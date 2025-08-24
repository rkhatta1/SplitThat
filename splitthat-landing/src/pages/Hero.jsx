import React from "react";
import VideoDemo from "@/components/VideoDemo.jsx";
import { VIDEO_SRC } from "../config.js";
import { Button } from "@/components/ui/button.jsx";

function Hero() {
  return (
    <div className="grandParent w-full flex items-center justify-center bg-gray-100">
      <div className="parent max-w-[70%] flex-1 flex flex-col space-y-[3rem] py-[10rem] items-center justify-start bg-gray-300">
        <div className="sibling flex flex-col space-y-3 max-w-1/2 bg-white">
          <div className="text-center font-poppins font-bold text-[3rem]">
            <span className="">Split Bills, Not Hairs</span>
          </div>
          <div className="text-center font-poppins text-[1.2rem]">
            <p className="">
              Let our AI-powered assistant do the heavy lifting. Just upload a
              receipt, and we&apos;ll handle the rest.
            </p>
          </div>
        </div>
        <div className="sibling flex">
          <div className="buttonCTA cursor-pointer ">
            <Button
              className="bg-green-600 text-white font-poppins font-semibold p-6 text-[1.2rem] rounded-full hover:bg-green-700"
              onClick={() => {
                window.location.href = "/app";
              }}
            >
              Login with Splitwise
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
