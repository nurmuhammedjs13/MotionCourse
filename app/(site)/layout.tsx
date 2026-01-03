import LayoutSite from "@/appPages/site/components/layout/LayoutSite";

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <LayoutSite>{children}</LayoutSite>;
}
