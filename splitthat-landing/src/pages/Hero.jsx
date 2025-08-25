import React from "react";
import VideoDemo from "@/components/VideoDemo.jsx";
import { VIDEO_SRC } from "../config.js";
import { Button } from "@/components/ui/button.jsx";
import { ReceiptText } from "lucide-react";
import { PiggyBank } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


function Hero() {
  return (
    <div className="grandParent w-full relative flex text-gray-900 items-center justify-center bg-gray-200">
      <div className="parent relative max-w-3/4 z-15 flex-1 flex flex-col pt-[10rem] items-center justify-start">
        <div className="sibling flex flex-col space-y-3 max-w-2/3 justify-center items-center">
          <div className="text-center flex justify-center font-poppins font-bold text-[4rem]">
            <div className="relative">
              <span className="relative z-20">Split Bills,</span>
              <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              style={{ originX: 0 }}
              transition={{ type: "spring", duration: 1, delay: 0.5, stiffness: 50, damping: 20 }}
              className="highlightSplit absolute rounded-full h-[1.7rem] z-10 bottom-[1.2rem] bg-gradient-to-r from-green-300 to-green-500"></motion.div>
            </div>
            <div className="ml-2">Not Hairs</div>
          </div>
          <div className="text-center flex max-w-2/3 font-poppins text-[1.2rem]">
            <p className="">
              Let our AI-powered assistant do the heavy lifting. Just upload a
              receipt, and we&apos;ll handle the rest.
            </p>
          </div>
        </div>
        <div className="sibling max-w-1/2 flex items-center justify-center">
          <div className="">
              <video className="" autoPlay muted playsInline>
                <source src="/ST-Animate-Final.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
          </div>
        </div>
        <div className="sibling flex absolute bottom-[-1.5rem]">
          <div className="buttonCTA">
            <Tooltip>
              <TooltipTrigger>
            <Button
              disabled
              className="disabled:opacity-100 bg-green-600 text-white font-poppins font-semibold p-6 text-[1.2rem] rounded-full hover:bg-green-600"
              onClick={() => {
                window.location.href = "#";
              }}
            >
              Login with Splitwise
            </Button>
              </TooltipTrigger>
              <TooltipContent className={"bg-gray-900 text-gray-100 font-poppins"}>
                Coming Soon
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className="Decor absolute -left-1/12 -top-1/10 rotate-25 ">
        <ReceiptText className="w-[30rem] h-[30rem] 2xl:w-[40rem] 2xl:h-[40rem] z-5 text-gray-400 opacity-30" />
      </div>
      <div className="Decor absolute -right-1/12 -bottom-1/10 rotate-25 scale-x-[-1]">
        <PiggyBank className="w-[30rem] h-[30rem] 2xl:w-[40rem] 2xl:h-[40rem] z-5 text-gray-400 opacity-30" />
      </div>
    </div>
  );
}

export default Hero;
