"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import video from "@/assets/Icons/videoIcon.png";
import style from "./lessonDetail.module.scss";
import Image, { StaticImageData } from "next/image";

interface CourseItem {
    id: number;
    course_image: StaticImageData;
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

function LessonDetail() {
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const { id } = useParams();
    const course = cardData.find((item) => item.id === Number(id));

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

    if (!course) {
        return <p>Курс не найден 😕</p>;
    }
    return (
        <section className={style.LessonDetail}>
            <div className="container">
                <div className={style.content}>
                    <div className={style.detailContent}>
                        <Image
                            className={style.lessonVideo}
                            src={course.course_image}
                            alt="video lesson"
                        />
                        <div className={style.lessonInfo}>
                            <h2 className={style.title}>
                                {course.course_name}
                            </h2>
                            <div className={style.hr}></div>

                            <div className={style.dataBlock}>
                                <h2 className={style.dataTitle}>Дата:</h2>
                                <h2 className={style.data}>
                                    {course.created_at}
                                </h2>
                            </div>
                            <div className={style.hr}></div>
                            <div className={style.descBlock}>
                                <h2 className={style.desctitle}>ОПИСАНИЕ</h2>
                                <p className={style.desc}>
                                    {course.description}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={style.table}>
                        <h2 className={style.title}>СЛЕДУЮЩИЕ УРОКИ</h2>
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
                                <p className={style.empty}>
                                    Ничего не найдено 😕
                                </p>
                            )}
                        </div>
                    </div>{" "}
                </div>
            </div>
        </section>
    );
}

export default LessonDetail;
