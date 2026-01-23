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
            providesTags: ["course"],
        }),
        getLessonDetail: build.query<
            LESSONS.GetLessonDetailResponse,
            LESSONS.GetLessonDetailRequest
        >({
            query: (id) => ({
                url: `course/${id}`,
                method: "GET",
            }),
        }),
        getCourseVideos: build.query<
            LESSONS.GetVideoListResponse,
            { course_id: string; category_lesson?: string; lesson_number?: string }
        >({
            query: ({ course_id, ...params }) => ({
                url: `courses/${course_id}/videos/`,
                method: "GET",
                params,
            }),
            providesTags: ["video"],
        }),
    }),
});

export const { 
    useGetLessonsQuery, 
    useGetLessonDetailQuery, 
    useGetCourseVideosQuery 
} = api;