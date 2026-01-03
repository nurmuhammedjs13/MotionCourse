"use client";

import Image from "next/image";
import style from "./Footer.module.scss";
import { useRouter } from "next/navigation";

import LogoIcon from "@/assets/Icons/Logo.svg";

const Links = [
    {
        name: "→ Главная",
        href: "/home",
    },
    {
        name: "→ Уроки",
        href: "/lessons",
    },
    {
        name: "→ Чат",
        href: "/chat",
    },
];

function Footer() {
    const router = useRouter();

    return (
        <footer className={style.footer}>
            <div className="container">
                <div className={style.content}>
                    <div className={style.topBlockFooter}>
                        <div className={style.firstTopBlock}>
                            <div
                                onClick={() => router.push("/home")}
                                className={style.footerLogo}
                            >
                                <Image
                                    className={style.logo}
                                    src={LogoIcon}
                                    alt="Logo"
                                />
                                <div className={style.logoTextBlock}>
                                    <span className={style.logoText1}>
                                        Motion
                                    </span>
                                    <span className={style.logoText2}>Web</span>
                                </div>
                            </div>
                            <span className={style.footerLogoInfo}>
                                Образовательная платформа для изучения
                                современной веб-разработки{" "}
                            </span>
                        </div>
                        <div className={style.secondTopBlock}>
                            <h2 className={style.title}>НАВИГАЦИЯ</h2>
                            <div className={style.footerNavs}>
                                {Links.map((link, index) => (
                                    <a
                                        key={index}
                                        onClick={() => router.push(link.href)}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div className={style.thirstTopBlock}>
                            <h2 className={style.title}>КОНТАКТЫ</h2>
                            <div className={style.contactsContent}>
                                <span className={style.footerContacts}>
                                    Email: example@example.com
                                </span>
                                <span className={style.footerContacts}>
                                    Phone: +7 (999) 123-45-67
                                </span>
                                <span className={style.footerContacts}>
                                    Phone: +7 (999) 123-45-67
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={style.hr}></div>
                    <div className={style.bottomBlockFooter}>
                        <h2 className={style.bottomFirstBlock}>
                            © 2026 MOTION WEB ACADEMY. ВСЕ ПРАВА ЗАЩИЩЕНЫ.
                        </h2>
                        <div className={style.bottomSecondBlock}>
                            <h2 className={style.bottomButton}>
                                ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ
                            </h2>
                            <h2 className={style.bottomButton}>
                                УСЛОВИЯ ИСПОЛЬЗОВАНИЯ
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
