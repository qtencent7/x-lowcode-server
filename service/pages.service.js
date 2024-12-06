const connection = require('../sql');

class PagesService {
  async listCount(keyword, userId, projectId) {
    let statement = '';
    if (projectId) {
      statement = `
        SELECT 
          count(p.id) total
        FROM 
          pages p
        LEFT JOIN   
          pages_role pr 
        ON 
          p.id = pr.page_id and pr.user_id = ${userId}
        WHERE 
          (p.name like COALESCE(CONCAT('%',?,'%'), p.name) OR ? IS NULL) 
        AND 
          p.project_id = ${projectId} and (p.user_id = ${userId} OR pr.user_id IS NOT NULL)`;
    } else {
      statement = `
        SELECT 
            count(p.id) as total
        FROM 
          pages p
        LEFT JOIN   
          (select * from pages_role WHERE user_id= ${userId}) pr ON p.id = pr.page_id and p.user_id = ${userId}
        WHERE 
          (
            (p.name like COALESCE(CONCAT('%',?,'%'), p.name) OR ? IS NULL) 
            AND p.user_id = ${userId}
          ) OR pr.page_id IS NOT NULL
      `;
    }

    const [result] = await connection.execute(statement, [keyword || null, keyword || null]);
    return result[0];
  }
  async list(pageNum, pageSize, keyword, userId, projectId) {
    const offset = (+pageNum - 1) * pageSize + '';
    const limit = pageSize;
    let statement = '';
    if (projectId) {
      statement = `
        SELECT 
          p.id,
          p.name,
          p.user_id as userId,
          p.remark,
          p.is_public as isPublic,
          p.is_edit as isEdit,
          p.preview_img as previewImg,
          p.stg_publish_id as stgPublishId,
          p.pre_publish_id as prePublishId,
          p.prd_publish_id as prdPublishId,
          p.stg_state as stgState,
          p.pre_state as preState,
          p.prd_state as prdState,
          p.project_id as projectId,
          p.updated_at as updatedAt,
          SUBSTRING_INDEX(p.user_name, '@', 1) as userName
        FROM 
          pages p
        LEFT JOIN   
          pages_role pr 
        ON 
          p.id = pr.page_id and pr.user_id = ${userId}
        WHERE 
          (p.name like COALESCE(CONCAT('%',?,'%'), p.name) OR ? IS NULL) 
        AND 
          p.project_id = ${projectId} and (p.user_id = ${userId} OR pr.user_id IS NOT NULL)
        ORDER BY 
          p.updated_at DESC LIMIT ${offset},${limit};`;
    } else {
      statement = `
        SELECT 
          p.id,
          p.name,
          p.user_id as userId,
          p.remark,
          p.is_public as isPublic,
          p.is_edit as isEdit,
          p.preview_img as previewImg,
          p.stg_publish_id as stgPublishId,
          p.pre_publish_id as prePublishId,
          p.prd_publish_id as prdPublishId,
          p.stg_state as stgState,
          p.pre_state as preState,
          p.prd_state as prdState,
          p.project_id as projectId,
          p.updated_at as updatedAt,
          SUBSTRING_INDEX(p.user_name, '@', 1) as userName
        FROM 
          pages p
        LEFT JOIN   
          pages_role pr on pr.user_id = ${userId} and pr.page_id = p.id
        WHERE 
          (
            (p.name like COALESCE(CONCAT('%',?,'%'), p.name) OR ? IS NULL) 
            AND p.user_id = ${userId}
          ) OR pr.page_id IS NOT NULL
        ORDER BY 
          p.updated_at DESC LIMIT ${offset},${limit};`;
    }
    const [result] = await connection.execute(statement, [keyword || null, keyword || null]);
    return result;
  }

  // 查询页面模板总条数
  async listPageTemplateCount(keyword) {
    const statement = "SELECT COUNT(`id`) total FROM pages WHERE (name like COALESCE(CONCAT('%',?,'%'), name) OR ? IS NULL) AND is_public = 3;";
    const [result] = await connection.execute(statement, [keyword || null, keyword || null]);
    return result[0];
  }

  // 查询页面模板
  async listPageTemplate(pageNum, pageSize, keyword) {
    const offset = (+pageNum - 1) * pageSize + '';
    const statement = `
    SELECT 
      id,
      name,
      user_id as userId,
      remark,
      is_public as isPublic,
      is_edit as isEdit,
      preview_img as previewImg,
      stg_publish_id as stgPublishId,
      stg_state as stgState,
      project_id as projectId,
      updated_at as updatedAt,
      SUBSTRING_INDEX(user_name, '@', 1) as userName 
    FROM 
      pages 
    WHERE 
      (name like COALESCE(CONCAT('%',?,'%'), name) OR ? IS NULL) 
    AND 
      is_public = 3 
    ORDER BY 
      updated_at DESC LIMIT ?,?;`;
    const [result] = await connection.execute(statement, [keyword || null, keyword || null, offset, pageSize]);
    return result;
  }

  async getPageInfoById(id) {
    const statement = `
    SELECT 
      id,
      name,
      user_id as userId,
      user_name as userName,
      remark,
      is_public as isPublic,
      is_edit as isEdit,
      preview_img as previewImg,
      page_data as pageData,
      stg_publish_id as stgPublishId,
      pre_publish_id as prePublishId,
      prd_publish_id as prdPublishId,
      stg_state as stgState,
      pre_state as preState,
      prd_state as prdState,
      project_id as projectId,
      updated_at as updatedAt,
      SUBSTRING_INDEX(user_name, '@', 1) as userName 
    FROM 
      pages 
    WHERE id = ?;
    `;
    const [result] = await connection.execute(statement, [id]);
    return result;
  }

  async getPageSimpleById(id) {
    const statement = 'SELECT user_id as userId, is_public as isPublic, is_edit as isEdit FROM pages WHERE id = ?;';
    const [result] = await connection.execute(statement, [id]);
    return result;
  }

  async createPage(name, userId, userName, remark = '', pageData, projectId = 0) {
    const statement = 'INSERT INTO pages (name, user_id, user_name, remark, page_data, project_id) VALUES (?, ?, ?, ?, ?, ?);';
    const [result] = await connection.execute(statement, [name, userId, userName, remark, pageData, projectId]);
    return result;
  }

  async deletePage(pageId, userId) {
    const statement = 'DELETE FROM pages WHERE id = ? and user_id = ?;';
    const [result] = await connection.execute(statement, [pageId, userId]);
    return result;
  }

  // 删除项目下所有页面
  async deletePageByProjectId(projectId, userId) {
    const statement = 'DELETE FROM pages WHERE project_id = ? and user_id = ?;';
    const [result] = await connection.execute(statement, [projectId, userId]);
    return result;
  }

  // 解除项目下页面列表归属
  async updatePageForProjectId(projectId) {
    const statement = 'update pages set project_id = null where project_id = ?';
    const [result] = await connection.execute(statement, [projectId]);
    return result;
  }

  //state=> 1: 未保存 2: 已保存 3: 已发布 4: 已回滚
  async updatePageInfo(id, name, remark, pageData, previewImg, projectId) {
    let statement = `UPDATE pages SET stg_state=2, pre_state=2, prd_state=2, name = ?, remark = ?`;
    let sql_params = [name, remark];

    if (previewImg) {
      statement += `, preview_img = ?`;
      sql_params.push(previewImg);
    }
    if (pageData) {
      statement += `, page_data = ?`;
      sql_params.push(pageData);
    }
    if (projectId) {
      statement += `, project_id = ?`;
      sql_params.push(projectId);
    }

    statement += ` WHERE id = ?;`;
    sql_params.push(id);
    const [result] = await connection.execute(statement, sql_params);
    return result;
  }

  //state=> 1: 未保存 2: 已保存 3: 已发布 4: 已回滚
  async updatePageState(lastPublishId, id, env, previewImg) {
    let statement = `UPDATE pages SET ${env}_state=3, ${env}_publish_id = ?`;
    let sql_params = [lastPublishId];
    if (previewImg) {
      statement += `, preview_img = ?`;
      sql_params.push(previewImg);
    }
    statement += ` WHERE id = ?;`;
    sql_params.push(id);
    const [result] = await connection.execute(statement, sql_params);
    return result;
  }

  async updateLastPublishId(pageId, lastPublishId, env) {
    const statement = `UPDATE pages SET ${env}_state=4, ${env}_publish_id = ? WHERE id = ?;`;
    const [result] = await connection.execute(statement, [lastPublishId, pageId]);
    return result;
  }
}

module.exports = new PagesService();
