"use client";

import style from "./Header.module.scss";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProfileIcon from "@/assets/Icons/profile.jpg";
import Logo from "@/assets/Icons/Logo.svg";
import { tokenService } from "@/utils/token";
import { useLogoutMutation } from "@/redux/api/auth";

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
    const [logout] = useLogoutMutation();
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<{
        username: string;
        email: string;
    } | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

    useEffect(() => {
        // Проверяем авторизацию при монтировании компонента
        const checkAuth = () => {
            const authenticated = tokenService.isAuthenticated();
            setIsAuthenticated(authenticated);
            if (authenticated) {
                setUser(tokenService.getUser());
            }
        };

        checkAuth();

        // Проверяем авторизацию при изменении localStorage
        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const handleProfileClick = (): void => {
        if (isAuthenticated) {
            setShowProfileMenu(!showProfileMenu);
        } else {
            router.push("/login");
        }
    };

    const handleLogout = async (): Promise<void> => {
        try {
            await logout().unwrap();
            setIsAuthenticated(false);
            setUser(null);
            setShowProfileMenu(false);
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const toggleMenu = (): void => {
        setIsMenuOpen(!isMenuOpen);
    };

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

                    <div className={style.rightBlock}>
                        <div className={style.profileWrapper}>
                            <button
                                onClick={handleProfileClick}
                                className={style.buttonBlock}
                            >
                                <Image
                                    className={style.profile}
                                    src={ProfileIcon}
                                    alt="profile"
                                />
                                {isAuthenticated && user && (
                                    <span className={style.username}>
                                        {user.username}
                                    </span>
                                )}
                            </button>

                            {isAuthenticated && showProfileMenu && (
                                <div className={style.profileMenu}>
                                    <div className={style.profileInfo}>
                                        <p className={style.profileName}>
                                            {user?.username}
                                        </p>
                                        <p className={style.profileEmail}>
                                            {user?.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className={style.logoutButton}
                                    >
                                        Выйти
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={toggleMenu}
                            className={style.burgerButton}
                            aria-label="Toggle menu"
                        >
                            <span
                                className={`${style.burgerLine} ${
                                    isMenuOpen ? style.open : ""
                                }`}
                            ></span>
                            <span
                                className={`${style.burgerLine} ${
                                    isMenuOpen ? style.open : ""
                                }`}
                            ></span>
                            <span
                                className={`${style.burgerLine} ${
                                    isMenuOpen ? style.open : ""
                                }`}
                            ></span>
                        </button>
                    </div>

                    <nav
                        className={`${style.mobileMenu} ${
                            isMenuOpen ? style.active : ""
                        }`}
                    >
                        {Links.map((link) => (
                            <a
                                key={link.name}
                                className={style.mobileNav}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        {isAuthenticated && (
                            <button
                                onClick={handleLogout}
                                className={style.mobileLogout}
                            >
                                Выйти
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
