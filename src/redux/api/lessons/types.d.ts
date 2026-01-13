namespace LESSONS {
    interface LessonItem {
        id: number;
        course_image: string;
        course_name: string;
        description: string;
        created_at: string;
    }

    interface VideoItem {
        id: number;
        video: string;
        description: string;
    }

    type GetLessonsResponse = LessonItem[];

    type GetLessonDetailResponse = {
        id: number;
        course_image: string;
        course_name: string;
        description: string;
        created_at: string;
        video_course: VideoItem[];
    };

    type GetLessonsRequest = void;

    type GetLessonDetailRequest = number;
}
