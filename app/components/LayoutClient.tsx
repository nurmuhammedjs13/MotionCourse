"use client";
import { store } from "@/redux/store";
import { ReactNode } from "react";
import { Provider } from "react-redux";

interface LayoutClientProps {
    children?: ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
    return <Provider store={store}>{children}</Provider>;
}
