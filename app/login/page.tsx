import { redirect } from "next/navigation";

interface LoginRedirectPageProps {
  searchParams?: Promise<{
    error?: string;
  }>;
}

export default async function LoginRedirectPage({ searchParams }: LoginRedirectPageProps) {
  const resolvedSearchParams = await searchParams;

  if (resolvedSearchParams?.error === "access_denied") {
    redirect("/app?error=access_denied");
  }

  redirect("/app/login");
}
