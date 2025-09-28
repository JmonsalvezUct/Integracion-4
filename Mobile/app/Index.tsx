import { Redirect } from "expo-router";

export default function Index() {
  const isLoggedIn = false; // luego reemplaza con tu lógica real
  return <Redirect href={isLoggedIn ? "/(tabs)" : "/screens/login"} />;
}
