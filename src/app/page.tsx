import { auth } from "@/lib/auth";
import LandingPage from "@/components/landing/LandingPage";

export default async function HomePage() {
  const session = await auth();

  return <LandingPage isLoggedIn={Boolean(session)} />;
}
