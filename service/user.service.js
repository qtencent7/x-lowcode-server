const connection = require('../sql');

class UserService {
  // 用户登录
  async findUser(userName, userPwd) {
    const statement = 'SELECT id, user_name as userName, nick_name as nickName, avatar FROM users WHERE user_name = ? and user_pwd = ? ;';
    const [result] = await connection.execute(statement, [userName, userPwd]);
    return result[0];
  }
  // 用户注册
  async create(nickName, userName, userPwd) {
    const statement = 'INSERT INTO users (nick_name, user_name, user_pwd) VALUES (?, ?, ?);';
    const [result] = await connection.execute(statement, [nickName, userName, userPwd]);
    return result;
  }
  // 用户查找
  async search(userName) {
    const statement = 'select id, user_name as userName from users where user_name = ?;';
    const [result] = await connection.execute(statement, [userName]);
    return result[0];
  }
  // 个人信息
  async profile(userId) {
    const statement = 'select id as userId, user_name as userName, nick_name as nickName, avatar, created_at as createdAt from users where id = ?;';
    const [result] = await connection.execute(statement, [userId]);
    return result[0];
  }
  // 更新用户
  async updateUserInfo(id, nickName, avatar) {
    const date = new Date();
    let statement = 'UPDATE users SET updated_at = ?';
    const params = [date];

    if (nickName) {
      statement += ', nick_name = ?';
      params.push(nickName);
    }
    if (avatar) {
      statement += ', avatar = ?';
      params.push(avatar);
    }
    statement += ' WHERE id = ?';
    params.push(id);

    const [result] = await connection.execute(statement, params);
    return result;
  }
  // 重置密码
  async resetPwd(userName, userPwd) {
    const statement = 'UPDATE users SET user_pwd = ? WHERE user_name = ?;';
    const [result] = await connection.execute(statement, [userPwd, userName]);
    return result;
  }

  // 验证旧密码
  async verifyOldPwd(userName, oldPwd) {
    const statement = 'SELECT id FROM users WHERE user_name = ? and user_pwd = ?;';
    const [result] = await connection.execute(statement, [userName, oldPwd]);
    return result[0];
  }
}
module.exports = new UserService();
