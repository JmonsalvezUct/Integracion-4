import { Redirect } from "expo-router";

export default function Index() {
  const isLoggedIn = false;
  return <Redirect href={isLoggedIn ? "/(tabs)" : "/auth/login"} />;
}
