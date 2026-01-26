"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-client";

export default function LoginPage() {
  const { signIn } = useAuth();

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
