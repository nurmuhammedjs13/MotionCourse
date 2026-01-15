"use client";

import React, { useState } from "react";
import style from "./lessonsTable.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetLessonsQuery } from "@/redux/api/lessons";

interface CourseItem {
    id: number;
    course_image: string;
    course_name: string;
    description: string;
    created_at: string;
}

function LessonsTable() {
    const [search, setSearch] = useState("");
    const [date, setDate] = useState("");
    const router = useRouter();

    const { data: CourseItem = [] } = useGetLessonsQuery();

    const filteredData = CourseItem.filter((item) => {
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
                                        width={300}
                                        height={200}
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
