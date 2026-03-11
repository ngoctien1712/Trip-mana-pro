import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service.js';

export async function getMyNotifications(req: Request, res: Response) {
    try {
        const userId = req.user!.userId;
        const notifications = await NotificationService.listByUser(userId);
        res.json({ data: notifications });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}

export async function markAsRead(req: Request, res: Response) {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        await NotificationService.markAsRead(id, userId);
        res.json({ success: true });
    } catch (err) {
        console.error('Mark notification as read error:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}

export async function markAllAsRead(req: Request, res: Response) {
    try {
        const userId = req.user!.userId;
        await NotificationService.markAllAsRead(userId);
        res.json({ success: true });
    } catch (err) {
        console.error('Mark all notifications as read error:', err);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
}
