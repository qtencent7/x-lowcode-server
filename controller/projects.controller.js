const projectsService = require('../service/projects.service');
const pagesRoleService = require('../service/pagesRole.service');
const pagesService = require('../service/pages.service');
const menuService = require('../service/menu.service');
const roleService = require('../service/roles.service');
const util = require('../utils/util');

module.exports = {
  async list(ctx) {
    const { userId } = util.decodeToken(ctx);
    const { pageNum = 1, pageSize = 12, keyword, type = 1 } = ctx.request.query;
    const { total } = await projectsService.listCount(keyword, type, userId);
    if (total == 0) {
      return util.success(ctx, {
        list: [],
        total: 0,
        pageSize: +pageSize,
        pageNum: +pageNum,
      });
    }
    const list = await projectsService.list(pageNum, pageSize, keyword, type, userId);
    util.success(ctx, {
      list,
      total,
      pageSize: +pageSize,
      pageNum: +pageNum,
    });
  },

  async getCategoryList(ctx) {
    const { userId } = util.decodeToken(ctx);
    const { pageNum, pageSize, keyword } = ctx.request.query;
    const { total } = await projectsService.getCategoryCount(keyword, userId);
    if (total == 0) {
      return util.success(ctx, {
        list: [],
        total: 0,
        pageSize: +pageSize || 12,
        pageNum: +pageNum || 1,
      });
    }
    const list = await projectsService.getCategoryList(pageNum || 1, pageSize || 12, keyword, userId);

    util.success(ctx, {
      list,
      total,
      pageSize: +pageSize,
      pageNum: +pageNum,
    });
  },

  // 查询我名下所有项目列表，用于创建页面时进行归属设置
  async queryAllProjects(ctx) {
    const { userId } = util.decodeToken(ctx);
    const list = await projectsService.ownList(1, 100, userId);
    util.success(ctx, list);
  },

  async create(ctx) {
    const params = ctx.request.body;
    const { userId, userName } = util.decodeToken(ctx);
    if (!params.name) {
      return ctx.throw(400, '项目名称不能为空');
    }

    if (!params.remark) {
      return ctx.throw(400, '项目描述不能为空');
    }

    if (!params.logo) {
      return ctx.throw(400, '项目logo不能为空');
    }
    await projectsService.createProject({
      ...params,
      userId,
      userName,
    });
    util.success(ctx);
  },

  async delete(ctx) {
    const { id, type } = ctx.request.body;
    if (!util.isNumber(id)) {
      return ctx.throw(400, 'id参数不正确');
    }
    const { userId } = util.decodeToken(ctx);
    const [projectInfo] = await projectsService.getProjectInfoById(+id);
    if (!projectInfo || projectInfo.userId != userId) {
      return ctx.throw(400, '您暂无权限删除该项目');
    }
    // 删除项目本身
    const res = await projectsService.deleteProject(id, userId);
    // 删除项目对应开发者权限
    await pagesRoleService.deleteByPageId(id);
    // 删除项目菜单
    await menuService.deleteMenuByProjectId(id);
    // 删除项目角色
    await roleService.deleteByProjectId(id);
    if (type == 'all') {
      await pagesService.deletePageByProjectId(id, userId);
    } else {
      await pagesService.updatePageForProjectId(id);
    }
    if (res.affectedRows > 0) {
      util.success(ctx);
    } else {
      return ctx.throw(400, '当前暂无权限');
    }
  },

  async update(ctx) {
    const { id, name, remark, logo } = ctx.request.body;
    if (!util.isNumber(id)) {
      return ctx.throw(400, 'id参数不正确');
    }
    if (!name) {
      return ctx.throw(400, '项目名称不能为空');
    }
    if (!remark) {
      return ctx.throw(400, '项目描述不能为空');
    }
    if (!logo) {
      return ctx.throw(400, '项目logo不能为空');
    }

    await projectsService.updateProjectInfo(ctx.request.body);
    util.success(ctx);
  },

  async detail(ctx) {
    const { id } = ctx.params;
    if (!util.isNumber(id)) {
      return ctx.throw(400, 'id参数不正确');
    }

    const [projectInfo] = await projectsService.getProjectInfoById(+id);

    if (!projectInfo) {
      return ctx.throw(400, '项目不存在');
    }
    util.success(ctx, projectInfo);
  },
};
