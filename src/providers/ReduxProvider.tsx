"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";

type ReduxProviderProps = {
    children: React.ReactNode;
};

export default function ReduxProvider({
    children,
}: ReduxProviderProps) {
    return <Provider store={store}>{children}</Provider>;
}

// Why "use client"?
// React Redux uses client-side React context and hooks. The provider makes the Redux store available to components nested inside it.