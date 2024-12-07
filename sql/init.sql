-- 删除表（按照外键关系的反序删除）
DROP TABLE IF EXISTS `pages`;
DROP TABLE IF EXISTS `projects`;
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
('admin', 'Administrator', 'admin123');

-- 创建项目表
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '项目名称',
  `description` text COMMENT '项目描述',
  `cover` varchar(200) DEFAULT NULL COMMENT '项目封面',
  `user_id` int(11) NOT NULL COMMENT '创建者ID',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='项目表';

-- 创建页面表
CREATE TABLE IF NOT EXISTS `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL COMMENT '页面名称',
  `path` varchar(100) NOT NULL COMMENT '页面路径',
  `title` varchar(100) DEFAULT NULL COMMENT '页面标题',
  `description` text COMMENT '页面描述',
  `project_id` int(11) NOT NULL COMMENT '所属项目ID',
  `content` longtext COMMENT '页面内容',
  `status` tinyint(1) DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `pages_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面表';
