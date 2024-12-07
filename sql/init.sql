-- 删除表（按照外键关系的反序删除）
DROP TABLE IF EXISTS `pages_role`;
DROP TABLE IF EXISTS `pages`;
DROP TABLE IF EXISTS `project_user`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `projects`;
DROP TABLE IF EXISTS `lib_publish`;
DROP TABLE IF EXISTS `lib`;
DROP TABLE IF EXISTS `imgcloud`;
DROP TABLE IF EXISTS `feedback`;
DROP TABLE IF EXISTS `workflows`;
DROP TABLE IF EXISTS `users`;

-- 创建用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(50) NOT NULL COMMENT '用户名',
  `nick_name` varchar(50) DEFAULT NULL COMMENT '昵称',
  `user_pwd` varchar(100) NOT NULL COMMENT '密码',
  `avatar` varchar(200) DEFAULT NULL COMMENT '头像',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_name` (`user_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 插入默认管理员用户 (密码为 admin123)
INSERT INTO `users` (`user_name`, `nick_name`, `user_pwd`) VALUES 
('admin@qq.com', 'Administrator', 'admin123');

-- 创建项目表
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '项目名称',
  `remark` text COMMENT '项目备注',
  `logo` varchar(200) DEFAULT NULL COMMENT '项目logo',
  `user_id` int(11) NOT NULL COMMENT '创建者ID',
  `user_name` varchar(50) NOT NULL COMMENT '创建者用户名',
  `is_public` tinyint(1) DEFAULT '1' COMMENT '是否公开',
  `layout` varchar(50) DEFAULT NULL COMMENT '布局',
  `menu_mode` varchar(50) DEFAULT NULL COMMENT '菜单模式',
  `menu_theme_color` varchar(50) DEFAULT NULL COMMENT '菜单主题色',
  `system_theme_color` varchar(50) DEFAULT NULL COMMENT '系统主题色',
  `breadcrumb` tinyint(1) DEFAULT NULL COMMENT '面包屑',
  `tag` tinyint(1) DEFAULT NULL COMMENT '标签',
  `footer` tinyint(1) DEFAULT NULL COMMENT '页脚',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 创建项目角色表
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL COMMENT '项目ID',
  `name` varchar(100) NOT NULL COMMENT '角色名称',
  `half_checked` text COMMENT '半选中的权限',
  `checked` text COMMENT '选中的权限',
  `remark` text COMMENT '备注',
  `user_id` int(11) NOT NULL COMMENT '创建者ID',
  `user_name` varchar(50) NOT NULL COMMENT '创建者用户名',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `roles_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `roles_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目角色表';

-- 创建项目用户表
CREATE TABLE IF NOT EXISTS `project_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL COMMENT '项目ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) NOT NULL COMMENT '用户名',
  `system_role` varchar(50) NOT NULL COMMENT '系统角色',
  `role_id` int(11) DEFAULT NULL COMMENT '角色ID',
  `created_uid` int(11) NOT NULL COMMENT '创建者ID',
  `created_uname` varchar(50) NOT NULL COMMENT '创建者用户名',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_user` (`project_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `project_user_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_user_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_user_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目用户表';

-- 创建页面表
CREATE TABLE IF NOT EXISTS `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '页面名称',
  `user_id` int(11) NOT NULL COMMENT '创建者ID',
  `user_name` varchar(50) NOT NULL COMMENT '创建者用户名',
  `remark` text COMMENT '页面备注',
  `is_public` tinyint(1) DEFAULT '1' COMMENT '是否公开',
  `is_edit` tinyint(1) DEFAULT '1' COMMENT '是否可编辑',
  `preview_img` varchar(200) DEFAULT NULL COMMENT '预览图',
  `page_data` longtext COMMENT '页面数据',
  `stg_publish_id` varchar(50) DEFAULT NULL COMMENT '测试环境发布ID',
  `pre_publish_id` varchar(50) DEFAULT NULL COMMENT '预发布环境发布ID',
  `prd_publish_id` varchar(50) DEFAULT NULL COMMENT '生产环境发布ID',
  `stg_state` tinyint(1) DEFAULT '1' COMMENT '测试环境状态',
  `pre_state` tinyint(1) DEFAULT '1' COMMENT '预发布环境状态',
  `prd_state` tinyint(1) DEFAULT '1' COMMENT '生产环境状态',
  `project_id` int(11) DEFAULT NULL COMMENT '所属项目ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `pages_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL,
  CONSTRAINT `pages_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面表';

-- 创建页面角色表
CREATE TABLE IF NOT EXISTS `pages_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_id` int(11) NOT NULL COMMENT '页面ID',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `page_user` (`page_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `pages_role_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pages_role_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面角色表';

-- 创建图片云存储表
CREATE TABLE IF NOT EXISTS `imgcloud` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) NOT NULL COMMENT '用户名',
  `origin_name` varchar(200) NOT NULL COMMENT '原始文件名',
  `file_name` varchar(200) NOT NULL COMMENT '存储文件名',
  `type` varchar(50) NOT NULL COMMENT '文件类型',
  `size` int(11) NOT NULL COMMENT '文件大小',
  `url` varchar(500) NOT NULL COMMENT '访问地址',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `imgcloud_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图片云存储表';

-- 创建组件库表
CREATE TABLE IF NOT EXISTS `lib` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag` varchar(50) NOT NULL COMMENT '组件标签',
  `name` varchar(100) NOT NULL COMMENT '组件名称',
  `description` text COMMENT '组件描述',
  `react_code` longtext COMMENT 'React代码',
  `less_code` longtext COMMENT 'Less代码',
  `config_code` longtext COMMENT '配置代码',
  `md_code` longtext COMMENT 'Markdown文档',
  `hash` varchar(50) DEFAULT NULL COMMENT '代码哈希',
  `user_id` int(11) NOT NULL COMMENT '创建者ID',
  `user_name` varchar(50) NOT NULL COMMENT '创建者用户名',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `lib_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组件库表';

-- 创建组件发布表
CREATE TABLE IF NOT EXISTS `lib_publish` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `release_id` varchar(50) NOT NULL COMMENT '发布ID',
  `lib_id` int(11) NOT NULL COMMENT '组件ID',
  `react_url` varchar(500) NOT NULL COMMENT 'React代码URL',
  `css_url` varchar(500) DEFAULT NULL COMMENT 'CSS代码URL',
  `config_url` varchar(500) NOT NULL COMMENT '配置代码URL',
  `release_hash` varchar(50) NOT NULL COMMENT '发布哈希',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) NOT NULL COMMENT '用户名',
  `count` int(11) DEFAULT '0' COMMENT '使用次数',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `lib_id` (`lib_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `lib_publish_ibfk_1` FOREIGN KEY (`lib_id`) REFERENCES `lib` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lib_publish_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='组件发布表';

-- 创建反馈表
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL COMMENT '标题',
  `content` text NOT NULL COMMENT '内容',
  `type` tinyint(1) NOT NULL COMMENT '类型：1-问题反馈，2-功能建议',
  `images` text COMMENT '图片列表',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `is_top` tinyint(1) DEFAULT '0' COMMENT '是否置顶',
  `is_solve` tinyint(1) DEFAULT '0' COMMENT '是否解决',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈表';

-- 创建工作流表
CREATE TABLE IF NOT EXISTS `workflows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `form_name` varchar(100) NOT NULL COMMENT '表单名称',
  `form_desc` text COMMENT '表单描述',
  `page_id` int(11) DEFAULT NULL COMMENT '页面ID',
  `template_data` longtext COMMENT '模板数据',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `user_name` varchar(50) NOT NULL COMMENT '用户名',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `page_id` (`page_id`),
  CONSTRAINT `workflows_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workflows_ibfk_2` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流表';