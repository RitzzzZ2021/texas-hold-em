"use client";

import { Provider } from "react-redux";
import { AuthSessionProvider } from "./AuthSessionProvider";
import { store } from "@/store/store";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </Provider>
  );
}
