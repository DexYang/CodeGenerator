-- 记录日志
tee Log/2-ddl_for_update.log

-- 当前时间
select now();

-- 开始事务
start transaction;

-- 以下填写变更SQL
use `sysdb`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t_example
-- ----------------------------
CREATE TABLE `t_example` (
	`id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
	`string_field` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'string_field',
	`state` tinyint(4) NOT NULL DEFAULT 0 COMMENT 'state',
	`delete_flag` tinyint(4) NOT NULL DEFAULT 0 COMMENT '逻辑删除标志',
	`creator_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '创建者ID',
	`insert_time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '插入时间',
	`update_time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '更新时间',
	`scope` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '数据权限标识',
	PRIMARY KEY (`id`) USING BTREE
)ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'Example表' ROW_FORMAT = Dynamic;


SET FOREIGN_KEY_CHECKS = 1;

-- 查询变更之后的结果

-- 提交事务
commit;

-- 查询当前时间
select now();

-- 关闭日志记录
notee
