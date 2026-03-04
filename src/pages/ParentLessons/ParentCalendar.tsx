import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { CalendarView, type CalendarDayDto } from '../../components/CalendarView/CalendarView';
import { getParentCalendar } from '../../services/parent-lesson.service';

const ParentCalendar: React.FC = () => {
    const [calendarData, setCalendarData] = useState<CalendarDayDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const fetchCalendar = async () => {
        setIsLoading(true);
        try {
            // Lấy dữ liệu cho 30 ngày (từ hiện tại đến 30 ngày sau)
            const startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
            const endDate = dayjs().add(30, 'day').format('YYYY-MM-DD');

            const response = await getParentCalendar(startDate, endDate);
            setCalendarData(response.content || []);
        } catch (error) {
            toast.error('Không thể tải dữ liệu thời khóa biểu');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCalendar();
    }, []);

    const handleLessonClick = (lessonId: number) => {
        navigate(`/parent-portal/lessons/${lessonId}`);
    };

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#1a2238', marginBottom: '24px' }}>Thời khóa biểu</h1>
            <CalendarView
                data={calendarData}
                isLoading={isLoading}
                onLessonClick={handleLessonClick}
            />
        </div>
    );
};

export default ParentCalendar;
