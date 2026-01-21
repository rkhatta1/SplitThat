"use client";

import { useSession } from "@/lib/auth-client";
import { useSplitwiseContext } from "@/lib/splitwise-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GroupsPage() {
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
        <h1 className="text-3xl font-bold">Groups</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!session) return null;

  const groups = data?.groups || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Group<span className="font-kalam">$</span></h1>
      {groups.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No groups found. Create a group on Splitwise to see it here.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {group.avatar?.medium ? (
                    <Avatar>
                      <AvatarImage src={group.avatar.medium} />
                      <AvatarFallback>{group.name?.[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {group.name?.[0]}
                    </div>
                  )}
                  <span>{group.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {group.members?.length || 0} members
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
