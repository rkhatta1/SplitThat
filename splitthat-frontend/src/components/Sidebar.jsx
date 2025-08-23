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
    setSelectedGroup,
    setShopName,
    setPaidBy,
    setDateOfPurchase,
    currentUser,
    open,
    currentSplit,
    refreshSplits
  } = useSplit();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSplits();
  }, [refreshSplits]);

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
        setDistribution(splitData.split_data.distribution || { tax: "equal", tip: "equal" });
        setSelectedGroup(splitData.split_data.group_id);
        setShopName(splitData.split_data.shop_name || "Los Pollos Hermanos");
        const paidByUser = splitData.split_data.users.find(user => user.paid_share > 0);
        if (paidByUser) {
          setPaidBy(paidByUser.user_id);
        }
        setDateOfPurchase(splitData.split_data.date_of_purchase);
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
                <ul className="flex flex-col">
                  {currentSplit && currentSplit.status === 'processing' && (
                    <li className="p-1 flex justify-between items-center space-x-2">
                      <Button
                        variant="ghost"
                        className="max-w-3/4 flex flex-1 px-2 bg-gray-200 justify-start hover:bg-gray-300"
                      >
                        <span>Processing...</span>
                      </Button>
                    </li>
                  )}
                  {currentSplit && currentSplit.status === 'editing' && (
                    <li className="p-1 flex justify-between items-center space-x-2">
                      <Button
                        variant="ghost"
                        className="max-w-full flex flex-1 px-2 bg-gray-200 justify-start hover:bg-gray-300"
                      >
                        <span>{currentSplit.data.shop_name} - {currentSplit.data.date_of_purchase}</span>
                      </Button>
                    </li>
                  )}
                  {splits.map((split) => (
                    <li
                      key={split.id}
                      className="p-1 flex justify-between items-center space-x-2"
                    >
                      <Button
                        variant="ghost"
                        className="max-w-3/4 scrollbar-none overflow-auto flex flex-1 px-2 bg-gray-200 justify-start hover:bg-gray-300"
                        onClick={() => editSplit(split.id)}
                      >
                        {currentUser && <span>{split.split_data.title}</span>}
                      </Button>
                      <Button
                      className={"bg-red-400 hover:bg-red-500 text-white"}
                        // variant="ghost"
                        // size="sm"
                        onClick={() => deleteSplit(split.id)}
                      >
                        {currentUser && <span>Delete</span>}
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
              <span>Login with Splitwise</span>
            </Button>
          </a>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
