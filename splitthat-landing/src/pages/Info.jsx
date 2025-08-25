import React from "react";
import { Button } from "@/components/ui/button.jsx";
import CountdownTimer from "@/components/CountdownTimer";
import { Badge } from "@/components/ui/badge";
import { AtomIcon } from "@/components/ui/AtomIcon";
import { DollarSign } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { LinkedInIcon } from "@/components/ui/LinkedinIcon";

function Info() {
  return (
    <div className="grandParent overflow-hidden w-full relative z-10 pb-[5rem] flex text-gray-100 items-center justify-center bg-gray-900">
      <div className="parent max-w-3/4 relative z-15 flex-1 flex flex-col py-[10rem] items-center justify-start">
        <div className="sibling flex flex-col space-y-1 max-w-5/7 justify-center">
          <div className="text-center flex justify-center font-poppins font-medium text-[2rem]">
            <span>The smartest and fastest way to split your bills</span>
          </div>
          <div className="flex space-x-2 justify-start">
            <Badge
              variant={"default"}
              className={
                "bg-green-600 flex items-center font-poppins cursor-default"
              }
            >
              Currently Building <AtomIcon className={"ml-1"} size={14} />
            </Badge>
            <Badge className={"bg-white text-gray-900 rounded-full"}>
              <a target="_blank" href="https://github.com/rkhatta1/SplitThat">
                <GithubIcon size={14} />
              </a>
            </Badge>
            <Badge className={"bg-blue-500 text-white rounded-full"}>
              <a target="_blank" href="https://linkedin.com/in/raajveer-khattar">
                <LinkedInIcon size={14} />
              </a>
            </Badge>
          </div>
        </div>
        <div className="sibling max-w-1/2 pt-[5rem] flex items-center justify-center">
          <div className="">
            <CountdownTimer />
          </div>
        </div>
      </div>
      <div className="Decor absolute z-10 left-1/2 -bottom-[5rem] opacity-10 rotate-12">
        <DollarSign size={400} />
      </div>
    </div>
  );
}

export default Info;
