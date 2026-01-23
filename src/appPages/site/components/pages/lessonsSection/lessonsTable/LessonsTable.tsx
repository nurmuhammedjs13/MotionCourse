"use client";

import React, { useState } from "react";
import style from "./lessonsTable.module.scss";
import { useRouter } from "next/navigation";
import { useGetCourseVideosQuery, useGetLessonDetailQuery } from "@/redux/api/lessons";
import { useAppSelector } from "@/redux/hooks";

function LessonsTable() {
    const [search, setSearch] = useState("");
    const [lessonNumber, setLessonNumber] = useState("");
    const router = useRouter();
    
    const currentUser = useAppSelector((state) => state.user);
    
    // Получаем видео курса пользователя
    const { data: videos = [], isLoading } = useGetCourseVideosQuery(
        {
            course_id: currentUser?.course?.toString() || "",
            category_lesson: search || undefined,
            lesson_number: lessonNumber || undefined,
        },
        {
            skip: !currentUser?.course,
        }
    );

    // Получаем детали курса по ID из профиля пользователя
    const { data: courseDetail, isLoading: isCourseLoading } = useGetLessonDetailQuery(
        currentUser?.course || 0,
        {
            skip: !currentUser?.course,
        }
    );

    // Фильтрация на клиентской стороне (если бэкенд не фильтрует должным образом)
    const filteredVideos = videos.filter((video) => {
        const matchesCategory = !search || 
            video.category_lesson.ct_lesson_name.toLowerCase().includes(search.toLowerCase());
        const matchesNumber = !lessonNumber || 
            video.lesson_number.toString() === lessonNumber;
        
        return matchesCategory && matchesNumber;
    });

    const handleVideoClick = (video: LESSONS.VideoListItem): void => {
        router.push(`/lessons/${video.id}`);
    };

    return (
        <section className={style.LessonsTable}>
            <div className="container">
                <div className={style.content}>
                    <div className={style.title}>
                        <div className={style.titleContent}>
                            <h2 className={style.cardsTitle}>
                                БИБЛИОТЕКА УРОКОВ
                            </h2>
                            {courseDetail && (
                                <h2 className={style.cardsTitleCourse}>
                                    {courseDetail.course_name}
                                </h2>
                            )}
                        </div>
                        <div className={style.filters}>
                            <input
                                type="text"
                                placeholder="Поиск по названию урока..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={style.input}
                            />
                            <input
                                type="number"
                                placeholder="Номер урока..."
                                value={lessonNumber}
                                onChange={(e) => setLessonNumber(e.target.value)}
                                className={style.input}
                                min="1"
                            />
                        </div>
                    </div>
                    <div className={style.cards}>
                        {!currentUser?.course ? (
                            <p className={style.empty}>У вас нет назначенного курса</p>
                        ) : isLoading ? (
                            <p className={style.empty}>Загрузка...</p>
                        ) : filteredVideos.length > 0 ? (
                            filteredVideos.map((video) => (
                                <div
                                    key={video.id}
                                    className={style.card}
                                    onClick={() => handleVideoClick(video)}
                                >
                                    <div className={style.videoCard}>
                                        <div className={style.videoHeader}>
                                            <h3>Урок: {video.category_lesson.ct_lesson_name}</h3>
                                        </div>
                                        <div className={style.videoInfo}>
                                            <p>Номер урока: {video.lesson_number}</p>
                                        </div>
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

export default LessonsTable;