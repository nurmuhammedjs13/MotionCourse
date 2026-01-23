import { api as index } from "..";

const api = index.injectEndpoints({
    endpoints: (build) => ({
        // Список видео
        getVideos: build.query<
            VIDEO.GetVideoListResponse, // тип ответа
            VIDEO.GetVideoListRequest // тип параметров запроса
        >({
            query: (params) => ({
                url: `video`,
                method: "GET",
                params, // передаем query-параметры, если есть
            }),
            providesTags: ["video"],
        }),

        // Детали видео по id
        getVideosDetail: build.query<
            VIDEO.GetVideoDetailResponse, // тип ответа
            VIDEO.GetVideoDetailRequest // id видео
        >({
            query: (id) => ({
                url: `video/${id}`,
                method: "GET",
            }),
            providesTags: ["video"],
        }),

        // Видео по курсу пользователя
       
    }),
});

export const { useGetVideosQuery, useGetVideosDetailQuery } = api;
