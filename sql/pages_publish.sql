DROP TABLE IF EXISTS `pages_publish`;

CREATE TABLE IF NOT EXISTS `pages_publish` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `page_id` int(11) NOT NULL COMMENT '页面ID',
  `page_name` varchar(255) NOT NULL COMMENT '页面名称',
  `page_data` longtext COMMENT '页面数据',
  `user_id` int(11) NOT NULL COMMENT '用户ID',
  `user_name` varchar(100) NOT NULL COMMENT '用户名',
  `env` varchar(10) NOT NULL COMMENT '环境：stg/pre/prd',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_env` (`env`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面发布记录表';
