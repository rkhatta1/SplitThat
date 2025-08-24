import React from "react";
import VideoDemo from "@/components/VideoDemo.jsx";
import { VIDEO_SRC } from "../config.js";

function Hero() {
  return (
    <div className="grandParent w-full flex items-center justify-center bg-gray-100">
      <div className="parent max-w-[70%] flex-1 flex space-x-[1rem] py-[10rem] bg-gray-300">
        <div className="sibling flex flex-col space-y-3 max-w-1/2 bg-white">
          <div className="text-start font-poppins font-bold text-[3rem]">
            <span className="">Split Bills, Not Hairs</span>
          </div>
          <div className="text-start font-poppins text-[1.2rem]">
            <p className="">
              Let our AI-powered assistant do the heavy lifting. Just upload a
              receipt, and we&apos;ll handle the rest.
            </p>
          </div>
        </div>
        <div className="sibling flex items-center aspect-video max-w-1/2 bg-yellow-200">
          <VideoDemo />
        </div>
      </div>
    </div>
  );
}

export default Hero;
