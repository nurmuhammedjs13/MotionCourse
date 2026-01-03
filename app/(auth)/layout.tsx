import LayoutAuth from "@/appPages/auth/components/layout/LayoutAuth";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <LayoutAuth>{children}</LayoutAuth>;
}
