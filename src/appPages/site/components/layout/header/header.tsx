// src/appPages/site/components/layout/header/header.tsx
"use client";

import style from "./Header.module.scss";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ProfileIcon from "@/assets/Icons/profile.jpg";
import Logo from "@/assets/Icons/Logo.svg";
import { useLogoutMutation } from "@/redux/api/auth";
import { useAppSelector } from "@/redux/hooks";
import Cookies from "js-cookie";

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
    const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

    // Получаем пользователя из Redux (данные уже загружены через AuthInitializer)
    const currentUser = useAppSelector((state) => state.user);

    // Проверяем наличие токена
    const hasToken =
        typeof window !== "undefined" && !!Cookies.get("access_token");

    // Пользователь аутентифицирован, если есть токен и имя пользователя в Redux
    const isAuthenticated = hasToken && !!currentUser?.username;

    // Логирование для отладки
    console.log("🔍 [HEADER] Debug info:", {
        hasToken,
        currentUser,
        isAuthenticated,
    });

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
        } catch (error) {
            console.log("⚠️ Logout failed:", error);
        } finally {
            setShowProfileMenu(false);
            setTimeout(() => {
                router.push("/login");
            }, 100);
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
                                {isAuthenticated && currentUser && (
                                    <span className={style.username}>
                                        {currentUser.username}
                                    </span>
                                )}
                                {!isAuthenticated && (
                                    <span className={style.username}>
                                        Войти
                                    </span>
                                )}
                            </button>

                            {isAuthenticated &&
                                showProfileMenu &&
                                currentUser && (
                                    <div className={style.profileMenu}>
                                        <div className={style.profileInfo}>
                                            <p className={style.profileName}>
                                                {currentUser.username}
                                            </p>
                                            <p className={style.profileEmail}>
                                                {currentUser.email ||
                                                    "Email не указан"}
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
