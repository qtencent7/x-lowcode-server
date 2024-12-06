const Router = require('@koa/router');
const router = new Router({ prefix: '/api/project' });
const projectsController = require('../controller/projects.controller');

/**
 * 项目服务API接口
 */

// 获取项目列表
router.get('/list', projectsController.list);

// 获取所属项目列表
router.get('/category', projectsController.getCategoryList);

// 获取我名下所有项目列表
router.get('/queryAllProjects', projectsController.queryAllProjects);

// 创建项目
router.post('/create', projectsController.create);

// 删除项目
router.post('/delete', projectsController.delete);

// 更新项目
router.post('/update', projectsController.update);

// 获取项目详情
router.get('/detail/:id', projectsController.detail);

module.exports = router;
