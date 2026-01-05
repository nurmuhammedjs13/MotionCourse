"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/redux/api/auth";
import style from "./login.module.scss";

export default function Login() {
    const router = useRouter();
    const [login, { isLoading }] = useLoginMutation();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState<string>("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setErrorMessage("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            setErrorMessage("Пожалуйста, заполните все поля");
            return;
        }

        try {
            const result = await login({
                username: formData.username,
                password: formData.password,
            }).unwrap();

            // Успешная авторизация
            console.log("Login successful:", result);
            router.push("/home");
        } catch (err) {
            console.error("Login error:", err);
            setErrorMessage(
                err || "Неверный логин или пароль. Попробуйте снова."
            );
        }
    };

    return (
        <section className={style.login}>
            <div className={style.content}>
                <form className={style.form} onSubmit={handleSubmit}>
                    <h2 className={style.title}>ВХОД В СИСТЕМУ</h2>

                    {errorMessage && (
                        <div className={style.error}>{errorMessage}</div>
                    )}

                    <div className={style.Block}>
                        <h2 className={style.Text}>ЛОГИН</h2>
                        <input
                            className={style.input}
                            placeholder="Введите логин"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className={style.Block}>
                        <h2 className={style.Text}>ПАРОЛЬ</h2>
                        <input
                            className={style.input}
                            placeholder="Введите пароль"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        className={style.button}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "ВХОД..." : "ВОЙТИ"}
                    </button>
                </form>
            </div>
        </section>
    );
}
