"use client";

import style from "./Header.module.scss";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProfileIcon from "@/assets/Icons/profile.jpg";
import Logo from "@/assets/Icons/Logo.svg";

const Links = [
    {
        name: "Уроки",
        href: "/lessons",
    },
    {
        name: "Чат",
        href: "/chat",
    },
];

const Header: React.FC = () => {
    const router = useRouter();

    return (
        <header className={style.header}>
            <div className="container">
                <div className={style.content}>
                    <div
                        onClick={() => router.push("/home")}
                        className={style.logoButton}
                    >
                        <Image className={style.logo} src={Logo} alt="Logo" />
                        <div className={style.logoTextBlock}>
                            <span className={style.logoText1}>Motion</span>
                            <span className={style.logoText2}>Web</span>
                        </div>
                    </div>
                    <div className={style.navs}>
                        {Links.map((link) => (
                            <a
                                key={link.name}
                                className={style.nav}
                                href={link.href}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                    <Image
                        className={style.profile}
                        src={ProfileIcon}
                        alt="profile"
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;
