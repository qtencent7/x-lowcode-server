const Router = require('@koa/router');
const feedback = require('../controller/feedback.controller');
const router = new Router({ prefix: '/api/feedback' });

// 查询反馈列表
router.get('/list', feedback.feedbackList);

// 创建反馈
router.post('/create', feedback.create);

// 查询反馈详情
router.get('/detail', feedback.queryFeedbackDetail);

// 查询反馈汇总
router.get('/queryFeedbackTotal', feedback.queryFeedbackTotal);

// 查询评论列表
router.get('/getComments', feedback.getComments);

// 反馈评论
router.post('/createComment', feedback.createComment);

// 置顶评论
router.post('/updateComment', feedback.updateComment);

module.exports = router;
