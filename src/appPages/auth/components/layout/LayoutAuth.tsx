// src/appPages/auth/components/layout/LayoutAuth.tsx
"use client";
import React, { ReactNode } from "react";
import styles from "./LayoutAuth.module.scss";

interface LayoutAuthProps {
    children: ReactNode;
}

export default function LayoutAuth({ children }: LayoutAuthProps) {
    return (
        <div className={styles.authLayout}>
            <div className={styles.authContainer}>{children}</div>
        </div>
    );
}
