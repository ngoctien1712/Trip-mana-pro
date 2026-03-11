import pool from '../config/db.js';

export class NotificationService {
    static async create({ userId, title, message, type = 'info' }: { userId: string, title: string, message: string, type?: string }) {
        try {
            const { rows } = await pool.query(
                `INSERT INTO notifications (id_user, title, message, type)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
                [userId, title, message, type]
            );
            return rows[0];
        } catch (err) {
            console.error('Error creating notification:', err);
            // Don't throw, just log. Notifications shouldn't break the main flow.
        }
    }

    static async listByUser(userId: string) {
        const { rows } = await pool.query(
            `SELECT * FROM notifications 
       WHERE id_user = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
            [userId]
        );
        return rows;
    }

    static async markAsRead(notificationId: string, userId: string) {
        await pool.query(
            `UPDATE notifications SET is_read = TRUE 
       WHERE id_notification = $1 AND id_user = $2`,
            [notificationId, userId]
        );
    }

    static async markAllAsRead(userId: string) {
        await pool.query(
            `UPDATE notifications SET is_read = TRUE 
       WHERE id_user = $1 AND is_read = FALSE`,
            [userId]
        );
    }
}
