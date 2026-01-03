"use client";

import "./global.scss";
import LayoutClient from "./components/LayoutClient";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../src/redux/store";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/icon?family=Material+Icons"
                />
            </head>

            <body>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <LayoutClient>{children}</LayoutClient>
                    </PersistGate>
                </Provider>
            </body>
        </html>
    );
}
