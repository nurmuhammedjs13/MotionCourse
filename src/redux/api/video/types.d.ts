namespace VIDEO {
    interface CategoryLesson {
        id: number;
        ct_lesson_name: string;
    }

    interface VideoListItem {
        id: number;
        course: number;
        category_lesson: CategoryLesson;
        lesson_number: number;
    }

    interface VideoDetailItem {
        id: number;
        course: number;
        category_lesson: CategoryLesson;
        video: string;
        lesson_number: number;
        description: string;
    }

    type GetVideoListResponse = VideoListItem[];
    type GetVideoDetailResponse = VideoDetailItem;

    type GetVideoListRequest = {
        category_lesson?: string;
        lesson_number?: string;
    };

    type GetVideoDetailRequest = number; // ID видео
}
