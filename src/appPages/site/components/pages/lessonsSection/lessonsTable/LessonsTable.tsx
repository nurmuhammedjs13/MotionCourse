"use client";

import React, { useState } from "react";
import style from "./lessonsTable.module.scss";
import video from "@/assets/Icons/videoIcon.png";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CourseItem {
    id: number;
    course_image: any;
    course_name: string;
    description: string;
    created_at: string;
}

const cardData: CourseItem[] = [
    {
        id: 0,
        course_image: video,
        course_name: "react",
        description:
            "React — библиотека для создания динамических интерфейсов на JavaScript с использованием компонентов и виртуального DOM.",
        created_at: "2026-01-04",
    },
    {
        id: 1,
        course_image: video,
        course_name: "vue",
        description:
            "Vue — прогрессивный JavaScript-фреймворк для создания пользовательских интерфейсов с плавной реактивностью.",
        created_at: "2026-01-03",
    },
    {
        id: 2,
        course_image: video,
        course_name: "angular",
        description:
            "Angular — мощный фреймворк от Google для построения масштабируемых веб-приложений.",
        created_at: "2026-01-02",
    },
    {
        id: 3,
        course_image: video,
        course_name: "nextjs",
        description:
            "Next.js — фреймворк поверх React с серверным рендерингом, роутингом и оптимизацией производительности.",
        created_at: "2026-01-01",
    },
    {
        id: 4,
        course_image: video,
        course_name: "nodejs",
        description:
            "Node.js — серверная платформа на JavaScript для создания быстрых и масштабируемых backend-приложений.",
        created_at: "2025-12-30",
    },
    {
        id: 5,
        course_image: video,
        course_name: "typescript",
        description:
            "TypeScript — надстройка над JavaScript с типизацией, повышающая надёжность и масштабируемость кода.",
        created_at: "2025-12-28",
    },
];

function LessonsTable() {
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const router = useRouter();

    const filteredData = cardData.filter((item) => {
        const matchesName = item.course_name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesDate = date ? item.created_at === date : true;

        return matchesName && matchesDate;
    });

    const handleBookClick = (item: CourseItem): void => {
        router.push(`/lessons/${item.id}`);
    };

    return (
        <section className={style.LessonsTable}>
            <div className="container">
                <div className={style.content}>
                    <div className={style.title}>
                        <h2 className={style.cardsTitle}>БИБЛИОТЕКА УРОКОВ</h2>
                        <div className={style.filters}>
                            <input
                                type="text"
                                placeholder="Поиск по названию..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={style.input}
                            />

                            <input
                                type="date"
                                placeholder="none"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className={style.input}
                            />
                        </div>{" "}
                    </div>
                    <div className={style.cards}>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <div
                                    key={item.id}
                                    className={style.card}
                                    onClick={() => handleBookClick(item)}
                                >
                                    <Image
                                        src={item.course_image}
                                        alt={item.course_name}
                                        className={style.image}
                                    />
                                    <div className={style.cardInfo}>
                                        <h3>{item.course_name}</h3>
                                        <p>{item.description}</p>
                                        <span className={style.date}>
                                            {item.created_at}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={style.empty}>Ничего не найдено 😕</p>
                        )}
                    </div>{" "}
                </div>
            </div>
        </section>
    );
}

export default LessonsTable;
