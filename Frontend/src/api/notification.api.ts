import { httpClient } from './http';

export const notificationApi = {
    async list(): Promise<{ data: any[] }> {
        return httpClient.get('/notifications');
    },
    async markRead(id: string): Promise<any> {
        return httpClient.patch(`/notifications/${id}/read`, {});
    },
    async markAllRead(): Promise<any> {
        return httpClient.post('/notifications/read-all', {});
    },
};
