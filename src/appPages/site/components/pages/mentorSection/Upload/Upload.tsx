"use client";

import React, { useState } from "react";
import style from "./Upload.module.scss";
import Image from "next/image";
import videoIcon from "@/assets/Icons/videoIcon.png";

function Upload() {
    const [formData, setFormData] = useState<{
        lessonName: string;
        lessonOrder: string;
        lessonDesc: string;
        lessonTheme: string;
        videoFile: File | null;
        videoPreview: string | null;
    }>({
        lessonName: "",
        lessonOrder: "",
        lessonDesc: "",
        lessonTheme: "",
        videoFile: null,
        videoPreview: null,
    });

    const getCurrentDate = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);
            video.currentTime = 1;

            video.addEventListener("loadeddata", () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

                const thumbnail = canvas.toDataURL("image/jpeg");
                setFormData((prev) => ({
                    ...prev,
                    videoFile: file,
                    videoPreview: thumbnail,
                }));

                URL.revokeObjectURL(video.src);
            });
        }
    };

    return (
        <section className={style.Upload}>
            <div className="container">
                <div className={style.content}>
                    <h2 className={style.title}>ЗАГРУЗИТЬ ВИДЕО</h2>
                    <div className={style.preview}>
                        <h2 className={style.previewTitle}>
                            ПРЕДПРОСМОТР / ПРЕВЬЮ
                        </h2>
                        <div className={style.previewBlock}>
                            {formData.videoPreview ? (
                                <Image
                                    className={style.image}
                                    width={320}
                                    height={220}
                                    src={formData.videoPreview}
                                    alt="Video preview"
                                    unoptimized
                                />
                            ) : (
                                <Image
                                    className={style.image}
                                    width={320}
                                    height={220}
                                    src={videoIcon}
                                    alt=""
                                />
                            )}
                            <div className={style.info}>
                                <h2 className={style.lessonName}>
                                    {formData.lessonName}
                                </h2>
                                <span className={style.lessonDesc}>
                                    {formData.lessonDesc}
                                </span>
                                <div className={style.infoLastBlock}>
                                    <h2 className={style.lessonTheme}>
                                        {formData.lessonTheme}
                                    </h2>
                                    <h2 className={style.lessonData}>
                                        {getCurrentDate()}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <div className={style.UploadBlock}>
                            <div className={style.inputs}>
                                <div className={style.inputBlock}>
                                    <h2 className={style.inputTitle}>
                                        Название урока
                                    </h2>
                                    <input
                                        name="lessonName"
                                        value={formData.lessonName}
                                        onChange={handleInputChange}
                                        placeholder="react/zustand"
                                        type="text"
                                        className={style.input}
                                    />
                                </div>
                                <div className={style.inputBlock}>
                                    <h2 className={style.inputTitle}>
                                        Урок по порядку
                                    </h2>
                                    <input
                                        name="lessonOrder"
                                        value={formData.lessonOrder}
                                        onChange={handleInputChange}
                                        placeholder="1й или 2й урок по порядку"
                                        type="text"
                                        className={style.input}
                                    />
                                </div>
                                <div className={style.inputBlock}>
                                    <h2 className={style.inputTitle}>Видео</h2>
                                    <input
                                        name="videoFile"
                                        onChange={handleFileChange}
                                        placeholder="видео"
                                        type="file"
                                        accept="video/*"
                                        className={style.input}
                                    />
                                </div>
                                <div className={style.inputBlock}>
                                    <h2 className={style.inputTitle}>
                                        Тема видео
                                    </h2>
                                    <input
                                        name="lessonTheme"
                                        value={formData.lessonTheme}
                                        onChange={handleInputChange}
                                        placeholder="тема урока"
                                        type="text"
                                        className={style.input}
                                    />
                                </div>
                            </div>
                            <div className={style.descInput}>
                                <h2 className={style.inputTitle}>Описание</h2>
                                <input
                                    name="lessonDesc"
                                    value={formData.lessonDesc}
                                    onChange={handleInputChange}
                                    placeholder="описание урока"
                                    type="text"
                                    className={style.input}
                                />
                            </div>
                            <button className={style.load}>
                                ЗАГРУЗИТЬ ВИДЕО
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Upload;
