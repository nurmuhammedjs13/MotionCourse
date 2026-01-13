// src/app/layout.tsx
import "./global.scss";
import StoreProvider from "@/redux/storeProvider";

export const metadata = {
    title: "MOTION WEB ACADEMY",
    description:
        "Изучайте Python, Django, JavaScript и React с Motion Web Academy. Структурированные видеоуроки, групповые чаты и персональная поддержка.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="icon"
                    type="image/svg"
                    sizes="32x32"
                    href="/Logo.svg"
                />
            </head>
            <body>
                <StoreProvider>{children}</StoreProvider>
            </body>
        </html>
    );
}
