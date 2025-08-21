import { useEffect, useState } from "react";
import api from "../api/api";
import { Button } from "./ui/button";
import { useSplit } from "../state/SplitContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function SidebarPane({ className }) {
  const [splits, setSplits] = useState([]);
  const {
    setResult,
    setParticipants,
    setDistribution,
    setExpenseId,
    currentUser,
    open
  } = useSplit();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSplits();
  }, []);

  async function fetchSplits() {
    try {
      const response = await api.fetch("http://localhost:8000/api/v1/splits");
      if (response.ok) {
        const data = await response.json();
        setSplits(data);
      }
    } catch (error) {
      console.error("Error fetching splits:", error);
    }
  }

  async function deleteSplit(splitId) {
    if (window.confirm("Are you sure you want to delete this split?")) {
      try {
        const response = await api.fetch(
          `http://localhost:8000/api/v1/splits/${splitId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          fetchSplits(); // Refresh the list
        } else {
          alert("Failed to delete split.");
        }
      } catch (error) {
        console.error("Error deleting split:", error);
        alert("An error occurred while deleting the split.");
      }
    }
  }

  async function editSplit(splitId) {
    try {
      const response = await api.fetch(
        `http://localhost:8000/api/v1/splits/${splitId}`
      );
      if (response.ok) {
        const splitData = await response.json();
        console.log("Full splitData from backend:", splitData);
        console.log("splitData.split_data:", splitData.split_data);

        const normalizedParticipants = splitData.split_data.users.map(
          (user) => ({
            ...user,
            id: user.user_id,
          })
        );
        // Populate the context with the split data
        setResult(splitData.split_data);
        setParticipants(normalizedParticipants);
        setExpenseId(splitData.splitwise_expense_id);
        setDistribution({ tax: "equal", tip: "equal" }); // Reset distribution options
        navigate("/editor");
      } else {
        alert("Failed to load split data.");
      }
    } catch (error) {
      console.error("Error loading split data:", error);
      alert("An error occurred while loading the split data.");
    }
  }

  return (
    <Sidebar collapsible="none" className={cn("border-r-1 border-solid border-r-gray-200", className)}>
      <SidebarHeader className={cn("p-[1rem]")}>
      {/* <SidebarTrigger /> */}
      <div className="text-gray-800 font-bold text-2xl">SplitThat</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn("text-md font-bold")}>Recent</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="space-y-1">
                <ul>
                  {splits.map((split) => (
                    <li
                      key={split.id}
                      className="py-1 flex justify-between items-center"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => editSplit(split.id)}
                      >
                        {open && <span>Split #{split.id}</span>}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSplit(split.id)}
                      >
                        {open && <span>Delete</span>}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={"p-[1rem] border-solid border-t-1 border-t-gray-200"}>
        {currentUser ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={currentUser.picture.small} />
              <AvatarFallback>{currentUser.first_name[0]}</AvatarFallback>
            </Avatar>
            {currentUser && <span>{currentUser.first_name} {currentUser.last_name}</span>}
          </div>
        ) : (
          <a href="http://localhost:8000/api/v1/auth/splitwise">
            <Button className="w-full">
              {open && <span>Login with Splitwise</span>}
            </Button>
          </a>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
