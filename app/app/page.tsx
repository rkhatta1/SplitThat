"use client";

import { useSession } from "@/lib/auth-client";
import { useSplitwiseContext } from "@/lib/splitwise-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon, UserIcon, Wallet01Icon } from "@hugeicons/core-free-icons";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-[18px] w-[18px] rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-8 text-center space-y-4">
        <Skeleton className="h-7 w-40 mx-auto" />
        <Skeleton className="h-4 w-96 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const { data: splitwiseData } = useSplitwiseContext();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/app/login");
    }
  }, [session, isPending, router]);

  if (isPending) return <DashboardSkeleton />;
  if (!session) return null;

  const groupCount = splitwiseData?.groups?.length || 0;
  const friendCount = splitwiseData?.friends?.length || 0;

  // Calculate total balance from all friends
  const totalBalance = splitwiseData?.friends?.reduce((sum, friend) => {
    const balance = friend.balance?.[0];
    const amount = balance ? parseFloat(balance.amount) : 0;
    return sum + amount;
  }, 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Da<span className="font-kalam">$</span>hboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <HugeiconsIcon icon={Wallet01Icon} size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalBalance > 0 ? "text-green-600" : totalBalance < 0 ? "text-red-600" : ""}`}>
              {totalBalance >= 0 ? "" : "-"}${Math.abs(totalBalance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBalance > 0 ? "You are owed" : totalBalance < 0 ? "You owe" : "All settled up"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <HugeiconsIcon icon={UserGroupIcon} size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groupCount}</div>
            <p className="text-xs text-muted-foreground">Groups in Splitwise</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friends</CardTitle>
            <HugeiconsIcon icon={UserIcon} size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{friendCount}</div>
            <p className="text-xs text-muted-foreground">Connected friends</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow p-8 text-center space-y-4">
        <h2 className="text-xl font-semibold">Ready to split?</h2>
        <p className="text-muted-foreground max-w-md md:max-w-lg mx-auto">
          Click the "New Split" button at the bottom to create a manual expense or upload a receipt for AI-powered itemization.
        </p>
      </div>
    </div>
  );
}
