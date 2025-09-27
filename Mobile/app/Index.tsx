import { Redirect } from "expo-router";

export default function Index() {
  // redirige siempre a login al abrir la app
  return <Redirect href="/screens/login" />;
}