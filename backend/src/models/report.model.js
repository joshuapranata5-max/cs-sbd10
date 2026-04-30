const db = require('../config/database');

class Report {
    static async getTopUsers(limit = 10) {
        const query = `
        SELECT 
            u.id, 
            u.name, 
            u.username, 
            SUM(t.total) AS total_spent,
            RANK() OVER (ORDER BY SUM(t.total) DESC) as rank
        FROM users u
        JOIN transactions t ON u.id = t.user_id
        WHERE t.status = 'paid'
        GROUP BY u.id, u.name, u.username
        ORDER BY rank ASC
        LIMIT $1
        `;
        const result = await db.query(query, [limit]);
        return result.rows;
    }
    
    static async getItemsSold() {
        const query = `
        SELECT 
            i.id AS item_id, 
            i.name AS item_name, 
            i.price,
            COALESCE(SUM(t.quantity), 0) AS total_quantity_sold,
            COALESCE(SUM(t.total), 0) AS total_revenue
        FROM items i
        LEFT JOIN transactions t ON i.id = t.item_id AND t.status = 'paid'
        GROUP BY i.id, i.name, i.price
        ORDER BY total_revenue DESC
        `;
        const result = await db.query(query);
        return result.rows;
    }
    
    static async getMonthlySales(year) {
        const query = `
        SELECT 
            TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
            COALESCE(SUM(quantity), 0) AS total_items_sold,
            COALESCE(SUM(total), 0) AS total_revenue
        FROM transactions
        WHERE EXTRACT(YEAR FROM created_at) = $1 AND status = 'paid'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
        `;
        const result = await db.query(query, [year]);
        return result.rows;
    }
}

module.exports = Report;