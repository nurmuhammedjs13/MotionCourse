namespace LESSONS {
    interface LessonItem {
        id: number;
        course_image: string;
        course_name: string;
        description: string;
        created_at: string;
    }
     interface VideoListItem {
        id: number;
        course: number;
        category_lesson: CategoryLesson;
        lesson_number: number;
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
    };

    type GetVideoListResponse = VideoListItem[];

    type GetLessonsRequest = void;

    type GetLessonDetailRequest = number;
}
