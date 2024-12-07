const jwt = require('jsonwebtoken');
const sdk = require('@baiducloud/sdk');
const config = require('../config');
const { Keyv } = require('keyv');
const keyv = new Keyv();
const request = require('./request');

/**
 * 工具函数
 */
module.exports = {
  /**
   * 接口成功输出
   * @param {*} ctx 上下文对象
   * @param {*} data 返回结果
   * @param {*} code 返回状态码
   */
  success(ctx, data = '', code = 0) {
    ctx.body = {
      code,
      data,
      message: 'success',
    };
  },
  /**
   * 接口失败输出
   * @param {*} ctx 上下文对象
   * @param {*} message 返回信息
   * @param {*} code 返回状态码
   */
  fail(ctx, message = '', code = -1, data = '') {
    ctx.body = {
      code,
      data,
      message,
    };
  },
  /**
   * 判断是否为空
   * @param {*} val 判断值
   * @returns
   */
  isNotEmpty(val) {
    if (val === undefined || val == null || val === '') {
      return false;
    } else if (typeof val === 'string') {
      if (val.trim() === '') {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  },
  /**
   * 判断是否为数字
   * @param {*} val 判断值
   * @returns
   */
  isNumber(val) {
    const isTrue = this.isNotEmpty(val);
    return isTrue && (typeof val === 'number' || isNaN(val) === false);
  },
  /**
   * 验证环境是否合法
   * @param {*} env 环境名称
   * @returns
   */
  checkEnv(env) {
    if (['stg', 'pre', 'prd'].includes(env)) {
      return true;
    }
    return false;
  },
  /**
   * 获取cookie
   * @param {*} ctx 上下文对象
   * @param {*} name cookie名称
   * @returns
   */
  getCookie(ctx, name) {
    return ctx.cookies.get(name);
  },
  /**
   * 生成jwt-token
   * @param {*} payload 参数对象
   * @returns jwt-token
   */
  createToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });
  },
  /**
   * 解密jwt-token
   * @param {*} ctx 上下文对象
   * @returns 解密后对象
   */
  decodeToken(ctx) {
    try {
      let [, authorization] = (ctx.request.headers?.authorization || '').split(' ');
      if (!authorization) {
        return ctx.throw(400, '账号信息异常，请重新登录');
      }
      return jwt.verify(authorization, config.JWT_SECRET);
    } catch (error) {
      return ctx.throw(401, '账号信息异常，请重新登录');
    }
  },
  // 解密重置密码对应的token
  decodeResetToken(token) {
    return jwt.verify(token, config.JWT_SECRET);
  },
  /**
   * 上传文件到本地
   * @param {*} fileName 文件名称
   * @param {*} content 文件内容
   * @returns 上传后的本地文件路径
   */
  async uploadString(fileName, content) {
    const fs = require('fs');
    const path = require('path');
    
    // 确保 uploads 目录存在
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    // 创建 libs 子目录
    const libsDir = path.join(uploadsDir, 'libs');
    if (!fs.existsSync(libsDir)) {
      fs.mkdirSync(libsDir);
    }

    const filePath = path.join(libsDir, fileName);
    
    // 写入文件
    await fs.promises.writeFile(filePath, content, 'utf8');
    
    // 返回文件的相对路径，用于访问
    return `/uploads/libs/${fileName}`;
  },
  /**
   * 传入文本，通过百度内容审核接口校验文本的合法性，返回校验结果
   * @param {*} content 文本内容
   * @returns
   */
  async checkContent(content) {
    let baidu_access_token = await keyv.get('baidu_access_token');
    if (!baidu_access_token) {
      const new_access_token = await this.getAccessToken();
      baidu_access_token = new_access_token;
      await keyv.set('baidu_access_token', new_access_token, 29 * 24 * 60 * 60 * 1000); // 29天的过期时间
    }

    const content_url = 'https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined?access_token=' + baidu_access_token;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };

    const params = new URLSearchParams();
    params.append('text', content);

    const content_res = await request.post(content_url, params.toString(), { headers });
    return JSON.parse(content_res.data);
  },

  /**
   * 检验图片是否合法
   * @param {*} image 图片地址
   * @returns
   */
  async checkImage(image_base64) {
    let baidu_access_token = await keyv.get('baidu_access_token');
    if (!baidu_access_token) {
      const new_access_token = await this.getAccessToken();
      baidu_access_token = new_access_token;
      await keyv.set('baidu_access_token', new_access_token, 29 * 24 * 60 * 60 * 1000); // 29天的过期时间
    }

    const image_url = 'https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=' + baidu_access_token;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    };

    const params = new URLSearchParams();
    params.append('image', image_base64);

    const image_res = await request.post(image_url, params.toString(), { headers });
    return JSON.parse(image_res.data);
  },

  async getAccessToken() {
    const url =
      'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + config.API_KEY + '&client_secret=' + config.Secret_Key;
    const res = await request.post(url);
    const data = JSON.parse(res.data);
    if (!data.access_token) {
      throw new Error('获取百度内容审核access_token失败');
    }
    return data.access_token;
  },
};
