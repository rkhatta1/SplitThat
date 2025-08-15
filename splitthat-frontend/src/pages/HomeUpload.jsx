import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TopNav from "../components/TopNav";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import FilePicker from "../components/FilePicker";
import ParticipantsInput from "../components/ParticipantsInput";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { useSplit } from "../state/SplitContext";

export default function HomeUpload() {
  const nav = useNavigate();
  const {
    file,
    setFile,
    participants,
    setParticipants,
    userPrompt,
    setUserPrompt
  } = useSplit();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = localStorage.getItem("splitwise_access_token");
        if (accessToken) {
          const response = await fetch("http://localhost:8000/api/v1/me");
          if (response.ok) {
            const userData = await response.json();
            if (userData.friends) {
              const friendNames = userData.friends.map(friend => `${friend.first_name} ${friend.last_name}`);
              setParticipants(friendNames);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [setParticipants]);

  const [error, setError] = useState("");

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
                  <h2 className="text-sm font-medium">Participants</h2>
                  <ParticipantsInput
                    value={participants}
                    onChange={setParticipants}
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