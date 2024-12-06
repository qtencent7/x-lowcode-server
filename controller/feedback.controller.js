const feedbackService = require('../service/feedback.service');
const util = require('../utils/util');

module.exports = {
  async feedbackList(ctx) {
    const { pageNum, pageSize, title, type } = ctx.request.query;
    const { total } = await feedbackService.feedbackListCount(title, Number(type));
    if (total == 0) {
      return util.success(ctx, {
        list: [],
        total: 0,
        pageSize: +pageSize || 12,
        pageNum: +pageNum || 1,
      });
    }

    const list = await feedbackService.feedbackList(pageNum || 1, pageSize || 12, title, Number(type));
    util.success(ctx, {
      list,
      total,
      pageSize: +pageSize,
      pageNum: +pageNum,
    });
  },
  async create(ctx) {
    const { title, content, type, images } = ctx.request.body;
    if (![1, 2, 3].includes(type)) {
      return ctx.throw(400, '反馈类型错误');
    }
    const { userId, userName } = util.decodeToken(ctx);
    await feedbackService.create(title, content, Number(type), images, userId, userName);
    util.success(ctx, '创建成功');
  },
  async queryFeedbackDetail(ctx) {
    
    const { id } = ctx.request.query;
    if (!util.isNumber(id)) {
      return ctx.throw(400, 'id参数异常');
    }

    const res  = await feedbackService.queryFeedbackDetail(id);
    util.success(ctx, res?.[0]);
  },
  async queryFeedbackTotal(ctx) {
    const res = await feedbackService.queryFeedbackTotal();
    util.success(ctx, res);
  },
  async getComments(ctx) {
    const { feedbackId, pageNum, pageSize } = ctx.request.query;
    if (!feedbackId) {
      return ctx.throw(400, '反馈ID不能为空');
    }

    const {total } = await feedbackService.queryCommentListCount(feedbackId);
    const list = await feedbackService.queryCommentList(feedbackId, pageNum, pageSize);
    util.success(ctx, {
      list,
      total,
      pageSize: +pageSize,
      pageNum: +pageNum,
    });
  },
  async createComment(ctx) {
    const { feedbackId, content } = ctx.request.body;
    if (!feedbackId) {
      return ctx.throw(400, '反馈ID不能为空');
    }
    if (!content) {
      return ctx.throw(400, '评论内容不能为空');
    }
    const { userId } = util.decodeToken(ctx);
    await feedbackService.createComment(userId, feedbackId, content);
    util.success(ctx, {
      content,
      userId
    });
  },

  async updateComment(ctx) {
    const { isTop, id } = ctx.request.body;
    if (!isTop != 0 && isTop != 1) {
      return ctx.throw(400, 'isTop参数无效');
    }
    if (!util.isNumber(id)) {
      return ctx.throw(400, 'id参数异常');
    }
    await feedbackService.updateComment(isTop, id);
    util.success(ctx, '置顶成功');
  },
};
