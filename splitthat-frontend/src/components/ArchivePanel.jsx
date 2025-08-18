import { useEffect, useState } from "react";
import api from "../api/api";
import { Button } from "./ui/button";
import { useSplit } from "../state/SplitContext";
import { useNavigate } from "react-router-dom";

export default function ArchivePanel() {
  const [splits, setSplits] = useState([]);
  const { setResult, setParticipants, setDistribution } = useSplit();
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
        const response = await api.fetch(`http://localhost:8000/api/v1/splits/${splitId}`, {
          method: "DELETE",
        });
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
      const response = await api.fetch(`http://localhost:8000/api/v1/splits/${splitId}`);
      if (response.ok) {
        const splitData = await response.json();
        console.log("Full splitData from backend:", splitData);
        console.log("splitData.split_data:", splitData.split_data);
        // Populate the context with the split data
        setResult(splitData.split_data);
        setParticipants(splitData.split_data.users);
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
    <div className="w-64 p-4 border-r">
      <h2 className="text-lg font-semibold mb-4">Archive</h2>
      <ul>
        {splits.map(split => (
          <li key={split.id} className="py-1 flex justify-between items-center">
            <span>Split #{split.id}</span>
            <div>
              <Button variant="ghost" size="sm" onClick={() => editSplit(split.id)}>Edit</Button>
              <Button variant="ghost" size="sm" onClick={() => deleteSplit(split.id)}>Delete</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
