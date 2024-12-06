const connection = require('../sql');

class FeedbackService {
  async feedbackListCount(title, type) {
    const sql = `
        SELECT 
            count(f.id) total
        FROM 
            users u 
        RIGHT JOIN 
            feedback f 
        ON 
            f.user_id = u.id
        WHERE
            (f.title like COALESCE(CONCAT('%',?,'%'), f.title) OR ? IS NULL) 
        AND ${type ? 'f.type = ?' : '? is null'}`;
    const [result] = await connection.execute(sql, [title || null, title || null, type || null]);
    return result[0];
  }

  async feedbackList(pageNum, pageSize, title, type) {
    const offset = (+pageNum - 1) * pageSize + '';
    const limit = pageSize;
    const sql = `
        SELECT 
            f.id, f.title, f.type, f.created_at createdAt, u.nick_name nickName, f.is_top isTop, f.is_solve isSolve
        FROM 
            users u 
        RIGHT JOIN 
            feedback f 
        ON 
            f.user_id = u.id
        WHERE
            (f.title like COALESCE(CONCAT('%',?,'%'), f.title) OR ? IS NULL)
        AND
            ${type ? 'f.type = ?' : '? is null'}
        ORDER BY f.is_top DESC, f.created_at DESC
        LIMIT ${offset},${limit}
    `;
    const [result] = await connection.execute(sql, [title || null, title || null, type || null]);
    return result;
}

  async create(title, content, type, images = '', userId, userName) {
    const statement = 'INSERT INTO feedback (title, content, type, images,user_id) VALUES (?, ?, ?, ?, ?);';
    const [result] = await connection.execute(statement, [title, content, type, images, userId]);
    return result;
  }

  async queryFeedbackDetail(id) {
    const sql = `
        SELECT 
            f.id, f.title, f.type, f.content, f.created_at createdAt, u.nick_name nickName, f.images, f.is_solve isSolve, f.is_review isReview, f.is_top isTop
        FROM 
            users u 
        RIGHT JOIN 
            feedback f 
        ON 
            f.user_id = u.id
        WHERE
            f.id = ?
    `;
    const [result] = await connection.execute(sql, [id]);
    return result;
  }

  async queryFeedbackTotal() {
    const sql = 'select (SELECT count(id) FROM feedback) as total, count(id) resolveCount from feedback where is_solve = 1 GROUP BY is_solve;';
    const sql2 = 'select count(id) bugCount from feedback where type = 2;'; 

    const [result] = await connection.execute(sql, []);
    const [result2] = await connection.execute(sql2, []);

    return {
      resolveCount: result[0]?.resolveCount || 0,
      bugCount: result2[0]?.bugCount || 0,
    };
  }

  async createComment(userId, feedbackId, content) {
    const statement = 'INSERT INTO feedback_comment (user_id, feedback_id, content) VALUES (?, ?, ?);';
    const [result] = await connection.execute(statement, [userId, feedbackId, content]);
    return result;
  }

  async updateComment(is_top, id) {
    const statement = 'UPDATE feedback_comment SET is_top = ? WHERE id = ?;';
    const [result] = await connection.execute(statement, [is_top, id]);
    return result;
  }

  async queryCommentList(feedbackId, pageNum, pageSize) {
    const offset = (+pageNum - 1) * pageSize + '';
    const limit = pageSize;
    const statement = `
      SELECT 
        u.nick_name nickName, 
        fb.id, 
        fb.content, 
        fb.is_review isReview, 
        fb.is_top isTop, 
        fb.created_at createdAt 
      FROM 
        users u 
      RIGHT JOIN 
        feedback_comment fb 
      ON  
        fb.user_id = u.id 
      WHERE 
        fb.feedback_id = ? 
      ORDER BY 
        fb.is_top DESC, 
        fb.created_at ASC 
      LIMIT ?,?;
    `;
    const [result] = await connection.execute(statement, [feedbackId, offset, limit]);
    return result;
}

  async queryCommentListCount(feedbackId) {
    const statement = 'SELECT count(id) total FROM feedback_comment WHERE feedback_id = ?;';
    const [result] = await connection.execute(statement, [feedbackId]);
    return result[0];
  }
}

module.exports = new FeedbackService();
