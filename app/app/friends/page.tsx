"use client";

import { useSession } from "@/lib/auth-client";
import { useSplitwiseContext } from "@/lib/splitwise-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FriendsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const { data, isLoading } = useSplitwiseContext();
  const router = useRouter();

  useEffect(() => {
    if (!sessionPending && !session) {
      router.push("/login");
    }
  }, [session, sessionPending, router]);

  if (sessionPending || isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Friend<span className="font-kalam">$</span></h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!session) return null;

  const friends = data?.friends || [];

  return (
    <div className="space-y-6 no-scrollbar">
      <h1 className="text-3xl font-bold">Friend<span className="font-kalam">$</span></h1>
      {friends.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No friends found. Add friends on Splitwise to see them here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 no-scrollbar">
          {friends.map((friend) => {
            const balance = friend.balance?.[0];
            const amount = balance ? parseFloat(balance.amount) : 0;

            return (
              <Card
                key={friend.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={friend.picture?.medium} />
                      <AvatarFallback>
                        {friend.first_name?.[0]}
                        {friend.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {friend.first_name} {friend.last_name || ""}
                      </p>
                      {amount !== 0 && (
                        <Badge
                          variant={amount > 0 ? "default" : "destructive"}
                          className="mt-1"
                        >
                          {amount > 0 ? "owes you" : "you owe"} $
                          {Math.abs(amount).toFixed(2)}
                        </Badge>
                      )}
                      {amount === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Settled up
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
