import { FC, ReactNode } from "react";
import scss from "./LayoutSite.module.scss";
import Header from "./header/header";
import Footer from "./footer/footer";

interface LayoutSiteProps {
    children: ReactNode;
}

const LayoutSite: FC<LayoutSiteProps> = ({ children }) => {
    return (
        <div className={scss.LayoutSite}>
            <Header />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

export default LayoutSite;
