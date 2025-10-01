// app/index.tsx
import React from "react";
import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { getAccessToken } from "@/lib/secure-store";

SplashScreen.preventAutoHideAsync();

export default function Entry() {
  const [dest, setDest] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken(); //  usa la MISMA clave que guarda auth.ts
        setDest(token ? "/(tabs)" : "/login");
      } finally {
        SplashScreen.hideAsync();
      }
    })();
  }, []);

  if (!dest) return null; // conserva el splash mientras decide
  return <Redirect href={dest} />;
}