import React from "react";
import style from "./Main.module.scss";

export default function Main() {
    return (
        <section className={style.Main}>
            <div className="container">
                <div className={style.content}>
                    <div className={style.hero}>
                        <div className={style.titleBlock}>
                            <h2 className={style.title1}>MOTION WEB</h2>
                            <h2 className={style.title2}>ACADEMY</h2>
                        </div>
                        <span className={style.titleInfo}>
                            Изучай современную веб-разработку с нуля до
                            профессионала. Структурированная программа обучения
                            с реальными проектами.
                        </span>
                        <button className={style.heroButton}>
                            СМОТРЕТЬ УРОКИ
                        </button>
                    </div>
                    <div className={style.courseInfo}>
                        <div className={style.infoBlock}>
                            <h2 className={style.infoTitle}>
                                🎯 <br />
                                Структурированные <br />
                                уроки
                            </h2>
                            <h2 className={style.info}>
                                Пошаговая программа обучения от базовых
                                концепций до продвинутых техник веб-разработки
                            </h2>
                        </div>
                        <div className={style.infoBlock}>
                            <h2 className={style.infoTitle}>
                                💬 <br />
                                Живое <br />
                                общение{" "}
                            </h2>
                            <h2 className={style.info}>
                                Общайтесь с преподавателями и другими студентами
                                в реальном времени через чат
                            </h2>
                        </div>
                        <div className={style.infoBlock}>
                            <h2 className={style.infoTitle}>
                                🔒
                                <br /> Персональный
                                <br /> доступ
                            </h2>
                            <h2 className={style.info}>
                                Индивидуальный трек обучения с отслеживанием
                                прогресса и персональными рекомендациями
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
