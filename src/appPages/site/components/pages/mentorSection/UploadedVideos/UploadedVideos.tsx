"use client";

import React, { useState, useMemo } from "react";
import style from "./UploadedVideos.module.scss";
import defaultIcon from "@/assets/Icons/videoIcon.png";
import Image from "next/image";
import { useGetLessonsQuery } from "@/redux/api/lessons";

interface CourseItem {
    id: number;
    course_image: string;
    course_name: string;
    description: string;
    created_at: string;
}

function UploadedVideos() {
    const { data: CourseItem = [] } = useGetLessonsQuery();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");

    // Получаем уникальные категории из данных
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(
            new Set(CourseItem.map((item) => item.course_name))
        );
        return uniqueCategories;
    }, [CourseItem]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const filteredData = CourseItem.filter((item) => {
        const matchesName = item.course_name
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesCategory = category ? item.course_name === category : true;

        const matchesDate = date
            ? formatDate(item.created_at).includes(date)
            : true;

        return matchesName && matchesCategory && matchesDate;
    });

    return (
        <section className={style.UploadedVideos}>
            <div className="container">
                <div className={style.content}>
                    <h2 className={style.title}>
                        Загруженные видео ({filteredData.length})
                    </h2>
                    <div className={style.filterBlock}>
                        <input
                            placeholder="поиск по названию"
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={style.Name}
                        />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={style.categories}
                            aria-label="Фильтр по категориям"
                        >
                            <option value="">Все категории</option>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <input
                            placeholder="поиск по дате (дд.мм.гггг)"
                            type="text"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={style.data}
                        />
                    </div>
                    <div className={style.videoBlock}>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <div key={item.id} className={style.card}>
                                    <div className={style.content}>
                                        <div className={style.imageWrapper}>
                                            <Image
                                                className={style.videoIcon}
                                                src={
                                                    item.course_image ||
                                                    defaultIcon
                                                }
                                                alt="videoIcon"
                                                fill
                                                unoptimized
                                            />
                                        </div>
                                        <div className={style.cardInfo}>
                                            <h2 className={style.lessonName}>
                                                {item.course_name}
                                            </h2>
                                            <span className={style.lessonDesc}>
                                                {item.description}
                                            </span>
                                            <div
                                                className={style.infoLastBlock}
                                            >
                                                <h2
                                                    className={
                                                        style.lessonTheme
                                                    }
                                                >
                                                    {item.course_name}
                                                </h2>
                                                <h2
                                                    className={style.lessonData}
                                                >
                                                    {formatDate(
                                                        item.created_at
                                                    )}
                                                </h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={style.buttons}>
                                        <button className={style.edit}>
                                            Редактировать
                                        </button>
                                        <button className={style.delete}>
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={style.empty}>Ничего не найдено 😕</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default UploadedVideos;
