"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "access_denied") {
      router.replace("/app?error=access_denied");
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground mb-4">
            ST
          </div>
          <CardTitle className="text-2xl">Welcome to SplitThat</CardTitle>
          <CardDescription>
            The AI-powered utility for your Splitwise account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={signIn} className="w-full h-11" size="lg">
            Login with Splitwise
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
