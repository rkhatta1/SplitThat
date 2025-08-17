import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TopNav from "../components/TopNav";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import FilePicker from "../components/FilePicker";
import ParticipantsInput from "../components/ParticipantsInput";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { useSplit } from "../state/SplitContext";
import api from "../api/api";

export default function HomeUpload() {
  const nav = useNavigate();
  const {
    file,
    setFile,
    participants,
    setParticipants,
    userPrompt,
    setUserPrompt,
    groups,
    setGroups,
    selectedGroup,
    setSelectedGroup,
    setCurrentUser,
    currentUser
  } = useSplit();

  const [error, setError] = useState("");
  const [allFriends, setAllFriends] = useState([]);
  const [availableParticipants, setAvailableParticipants] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("Fetching user data...");
      try {
        const jwt = localStorage.getItem("jwt");
        console.log("JWT from localStorage:", jwt);
        if (jwt) {
          console.log("Making request to /me endpoint...");
          const response = await api.fetch("http://localhost:8000/api/v1/me");
          console.log("Response from /me endpoint:", response);
          if (response.ok) {
            const userData = await response.json();
            console.log("User data received:", userData);
            setCurrentUser(userData);
            if (userData.friends) {
              setAllFriends(userData.friends);
              const currentUserAsParticipant = { ...userData, id: userData.splitwise_id };
              setAvailableParticipants([currentUserAsParticipant, ...userData.friends]);
            }
            if (userData.groups) {
              setGroups(userData.groups.filter(g => g.name !== "Non-group expenses"));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [setParticipants, setGroups, setAllFriends, setCurrentUser, setAvailableParticipants]);

  useEffect(() => {
    if (selectedGroup) {
      const group = groups.find((g) => g.id === parseInt(selectedGroup));
      if (group) {
        setAvailableParticipants(group.members);
        // Filter the current participants to only include members of the new group
        setParticipants(prevParticipants =>
          prevParticipants.filter(p => group.members.some(m => m.id === p.id))
        );
      }
    } else {
      // If no group is selected, revert to the full friends list plus the current user
      if (currentUser) {
        const currentUserAsParticipant = { ...currentUser, id: currentUser.splitwise_id };
        setAvailableParticipants([currentUserAsParticipant, ...allFriends]);
        // Also filter the current participants to only include friends and the current user
        setParticipants(prevParticipants =>
          prevParticipants.filter(p => [currentUserAsParticipant, ...allFriends].some(f => f.id === p.id))
        );
      }
    }
  }, [selectedGroup, groups, allFriends, currentUser, setParticipants]);

  function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a receipt image or PDF.");
      return;
    }
    if (!participants.length) {
      setError("Add at least one participant.");
      return;
    }

    nav("/loading", {
      state: { from: "home" }
    });
  }

  return (
    <div className="min-h-full">
      <TopNav />
      <main className="container py-8">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <h1 className="text-xl font-semibold">
                Itemized split from a receipt
              </h1>
              <a href="http://localhost:8000/api/v1/auth/splitwise">
                <Button>Login with Splitwise</Button>
              </a>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload a photo or PDF, add people, and optionally give
                instructions. We’ll parse the receipt and pre-fill the
                items.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <section className="space-y-2">
                  <h2 className="text-sm font-medium">Receipt</h2>
                  <FilePicker
                    accept="image/*,application/pdf"
                    onFile={setFile}
                  />
                </section>

                <section className="space-y-2">
                  <h2 className="text-sm font-medium">Group</h2>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select a group (optional)</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </section>

                <section className="space-y-2">
                  <h2 className="text-sm font-medium">Participants</h2>
                  <ParticipantsInput
                    value={participants}
                    onChange={setParticipants}
                    availableParticipants={availableParticipants}
                  />
                </section>

                <section className="space-y-2">
                  <h2 className="text-sm font-medium">
                    Instructions (optional)
                  </h2>
                  <Textarea
                    rows={4}
                    placeholder="e.g., Alice gets the Diet Coke; Bob gets the avocados."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                  />
                </section>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <div className="flex justify-end">
                  <Button type="submit">Process receipt</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}