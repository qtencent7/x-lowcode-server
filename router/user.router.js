const Router = require('@koa/router');
const router = new Router({ prefix: '/api/user' });
const util = require('../utils/util');
const userService = require('../service/user.service');
const nodemailer = require('nodemailer');
const config = require('../config');
const { Keyv } = require('keyv');
const keyv = new Keyv();
/**
 * 用户登录
 */
router.post('/login', async (ctx) => {
  const { userName, userPwd } = ctx.request.body;
  if (!userName || !userPwd) {
    util.fail(ctx, '用户名或密码不能为空');
    return;
  }
  const res = await userService.findUser(userName, userPwd);
  if (!res) {
    util.fail(ctx, '用户名或密码错误');
    return;
  }
  const token = util.createToken({ userName, userId: res.id, nickName: res.nickName });
  userService.updateUserInfo(res.id);
  util.success(ctx, {
    userId: res.id,
    userName,
    token,
  });
});

/**
 * 获取用户信息
 */
router.get('/info', async (ctx) => {
  const { userId } = util.decodeToken(ctx);
  const res = await userService.profile(userId);
  util.success(ctx, res);
});

/**
 * 获取个人信息
 */
router.get('/profile', async (ctx) => {
  const { userId } = util.decodeToken(ctx);
  const res = await userService.profile(userId);
  util.success(ctx, res);
});
/**
 * 用户搜索
 */
router.post('/search', async (ctx) => {
  const { keyword } = ctx.request.body;
  if (!keyword) {
    util.fail(ctx, '关键字不能为空');
    return;
  }
  const res = await userService.search(keyword);
  if (!res) {
    util.fail(ctx, '当前用户名不存在');
    return;
  }
  util.success(ctx, res);
});

/**
 * 用户信息更新
 */
router.post('/update/profile', async (ctx) => {
  const { nickName, avatar } = ctx.request.body;
  if (!nickName && !avatar) {
    util.fail(ctx, '参数异常，请重新提交');
    return;
  }
  const { userId } = util.decodeToken(ctx);
  await userService.updateUserInfo(userId, nickName, avatar);
  util.success(ctx, '更新成功');
});

/**
 * 用户注册 - 发送验证码
 */
router.post('/sendEmail', async (ctx) => {
  try {
    const { email } = ctx.request.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      util.fail(ctx, '邮箱不能为空或格式错误');
      return;
    }
    const val = await keyv.get(email);
    if (val) {
      util.fail(ctx, '验证码已发送，请查收');
      return;
    }
    let transporter = nodemailer.createTransport({
      host: config.EMAIL_HOST,
      port: config.EMAIL_PORT,
      auth: {
        user: config.EMAIL_USER, // 你的Gmail地址
        pass: config.EMAIL_PASSWORD, // 你的Gmail密码或应用专用密码
      },
    });

    const random = Math.random().toString().slice(2, 7).replace(/^(0)+/, '1');

    let mailOptions = {
      from: `"Marsview" <${config.EMAIL_USER}>`, // 发送者地址
      to: email, // 接收者列表
      subject: 'Marsview账号注册', // 主题行
      text: '验证码发送', // 纯文字正文
      html: `当前验证码为：<b>${random}</b>，3分钟内有效。<br/><br/>我是 Marsview 开源作者，感谢您注册成为 Marsview 用户，您在搭建过程中遇到任何问题均可邮件、issue或者微信联系我。<br/><br/>邮  箱：sunnyboysoft@163.com<br/>issue：https://github.com/JackySoft/marsview/issues<br/>微  信：MarsOne666`, // HTML正文
    };

    await transporter.sendMail(mailOptions);
    await keyv.set(email, random, 3 * 60 * 1000);
    util.success(ctx, '发送成功');
  } catch (error) {
    util.fail(ctx, error.message);
  }
});

/**
 * 用户注册
 */
router.post('/regist', async (ctx) => {
  const { userName, code, userPwd } = ctx.request.body;
  if (!userName || !userPwd) {
    util.fail(ctx, '用户名或密码不能为空');
    return;
  }
  if (!code) {
    util.fail(ctx, '邮箱验证码不能为空');
    return;
  }
  const val = await keyv.get(userName);
  if (!val) {
    util.fail(ctx, '验证码已过期');
    return;
  }
  if (val != code) {
    util.fail(ctx, '验证码错误');
    return;
  }
  const user = await userService.search(userName);
  if (user) {
    util.fail(ctx, '当前用户已存在');
    return;
  }

  const nickName = userName.split('@')[0];
  const res = await userService.create(nickName, userName, userPwd);
  if (res.affectedRows == 1) {
    const token = util.createToken({ userName, userId: res.insertId });

    util.success(ctx, {
      userId: res.id,
      userName,
      token,
    });
  } else {
    util.fail(ctx, '注册失败,请重试');
  }
});

/**
 * 忘记密码 - 生成链接
 */
router.post('/password/forget', async (ctx) => {
  const { userEmail } = ctx.request.body;
  if (!userEmail) {
    util.fail(ctx, '邮箱不能为空');
    return;
  }
  const user = await userService.search(userEmail);
  if (!user) {
    util.fail(ctx, '当前用户不存在');
    return;
  }
  // 生成验证码，保存在redis中，用来验证链接有效期
  const random = Math.random().toString().slice(2, 7);
  await keyv.set(userEmail, random, 5 * 60 * 1000);
  // 生成加密后token
  const token = util.createToken({ userEmail });

  // 发送邮件
  let transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    auth: {
      user: config.EMAIL_USER, // 你的Gmail地址
      pass: config.EMAIL_PASSWORD, // 你的Gmail密码或应用专用密码
    },
  });
  let mailOptions = {
    from: `"Marsview" <${config.EMAIL_USER}>`, // 发送者地址
    to: userEmail, // 接收者列表
    subject: 'Marsview密码找回', // 主题行
    text: '验证码发送', // 纯文字正文
    html: `Hello，${userEmail}! <br/> 我们收到了你重置密码的申请，请点击下方按链接行重置，<a href="https://www.marsview.com.cn/password-reset?resetToken=${token}">重置密码</a> <br/> 链接 3分钟内有效，请尽快操作，如不是你发起的请求，请忽略。`, // HTML正文
  };

  await transporter.sendMail(mailOptions);
  util.success(ctx, '发送成功');
});

/**
 * 忘记密码 - 获取账号
 */
router.post('/password/getUserByToken', async (ctx) => {
  const { resetToken } = ctx.request.query;
  const { userEmail } = util.decodeResetToken(resetToken);
  const val = await keyv.get(userEmail);
  if (!val) {
    util.fail(ctx, '链接已失效，请重新操作');
    return;
  }
  util.success(ctx, userEmail);
});

/**
 * 忘记密码 - 重置密码
 */
router.post('/password/reset', async (ctx) => {
  const { resetToken, userPwd } = ctx.request.body;
  if (!resetToken) {
    util.fail(ctx, '重置Token不能为空');
    return;
  }
  if (!userPwd) {
    util.fail(ctx, '重置密码不能为空');
    return;
  }
  const { userEmail } = util.decodeResetToken(resetToken);
  if (!userEmail) {
    util.fail(ctx, 'Token 识别错误，请重新操作');
    return;
  }
  const val = await keyv.get(userEmail);
  if (!val) {
    util.fail(ctx, '链接已失效，请重新操作');
    return;
  }
  await userService.resetPwd(userEmail, userPwd);
  await keyv.delete(userEmail);
  util.success(ctx, '更新成功');
});

/**
 * 密码修改
 */

router.post('/password/update', async (ctx) => {
  const { oldPwd, userPwd, confirmPwd } = ctx.request.body;
  if (!oldPwd || !userPwd || !confirmPwd) {
    util.fail(ctx, '密码不能为空');
    return;
  }
  if (userPwd !== confirmPwd) {
    util.fail(ctx, '两次密码不一致');
    return;
  }
  const { userName } = util.decodeToken(ctx);

  try {
    const res = await userService.verifyOldPwd(userName, oldPwd);
    if (res) {
      await userService.resetPwd(userName, userPwd);
      util.success(ctx, '密码更改成功');
    } else {
      util.fail(ctx, '原密码输入错误');
    }
  } catch (error) {
    util.fail(ctx, error.message);
  }
});

module.exports = router;
