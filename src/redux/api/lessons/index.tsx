import { api as index } from "..";
const api = index.injectEndpoints({
    endpoints: (build) => ({
        getLessons: build.query<
            LESSONS.GetLessonsResponse,
            LESSONS.GetLessonsRequest
        >({
            query: () => ({
                url: `course`,
                method: "GET",
            }),
            providesTags: ["lessons"],
        }),
        getLessonDetail: build.query<
            LESSONS.GetLessonDetailResponce,
            LESSONS.GetLessonDetailRequest
        >({
            query: (id) => ({
                url: `course/${id}`,
                method: "GET",
            }),
        }),
    }),
});

export const { useGetLessonsQuery, useGetLessonDetailQuery } = api;
