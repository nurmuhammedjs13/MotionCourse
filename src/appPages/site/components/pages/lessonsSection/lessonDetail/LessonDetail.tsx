"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import style from "./lessonDetail.module.scss";
import Image from "next/image";
import { useGetLessonsQuery } from "@/redux/api/lessons";
import { useGetVideosDetailQuery } from "@/redux/api/video";

interface CourseItem {
    id: number;
    course_image: string;
    course_name: string;
    description: string;
    created_at: string;
}

export interface CourseItemDetail {
    id: number;
    course: number;
    category_lesson: CategoryLesson;
    video: string;
    lesson_number: number;
    description: string;
}

export interface CategoryLesson {
    id: number;
    ct_lesson_name: string;
}

function LessonDetail() {
    const router = useRouter();
    const { data: CourseItem = [] } = useGetLessonsQuery();
    const { id } = useParams();

    const { data: CourseItemDetail } = useGetVideosDetailQuery(Number(id), {
        skip: !id,
    });

    const [search] = useState("");
    const [date] = useState("");
    const course = CourseItem.find((item) => item.id === Number(id));
    const courseDetail = CourseItemDetail;

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

    if (!course) {
        return <p>Курс не найден 😕</p>;
    }
    return (
        <section className={style.LessonDetail}>
            <div className="container">
                <div className={style.content}>
                    <div className={style.detailContent}>
                        {courseDetail?.video && (
                            <video
                                className={style.lessonVideo}
                                src={courseDetail.video}
                                controls
                                autoPlay={false}
                                loop={false}
                            >
                                Ваш браузер не поддерживает видео тег.
                            </video>
                        )}
                        <div className={style.lessonInfo}>
                            <h2 className={style.title}>
                                {courseDetail?.category_lesson.ct_lesson_name}
                            </h2>
                            <div className={style.hr}></div>

                            <div className={style.themeBlock}>
                                <h2 className={style.themeTitle}>Подтема:</h2>
                                <h2 className={style.theme}>
                                    {course?.course_name}
                                </h2>
                            </div>
                            <div className={style.numberBlock}>
                                <h2 className={style.numberTitle}>
                                    Урок по счету:
                                </h2>
                                <h2 className={style.number}>
                                    {courseDetail?.course}
                                </h2>
                            </div>
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
