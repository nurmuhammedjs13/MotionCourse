import ProtectedRoute from "@/components/ProtectedRoute";
import LayoutSite from "@/appPages/site/components/layout/LayoutSite";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <LayoutSite>{children}</LayoutSite>
        </ProtectedRoute>
    );
}
