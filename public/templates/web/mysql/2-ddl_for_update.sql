-- 记录日志
tee Log/2-ddl_for_update.log

-- 当前时间
select now();

-- 开始事务
start transaction;

-- 以下填写变更SQL
use `<%= variables.dbName %>`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for <%= variables.tableName %>
-- ----------------------------
CREATE TABLE `<%= variables.tableName %>` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  <% fields.forEach(field => { %><% if (field.type === 'int2') { %>`<%= field.fieldName %>` tinyint(4) NOT NULL DEFAULT 0 COMMENT '<%= field.alias %>',
  <% } else if (field.type === 'int8') { %>`<%= field.fieldName %>` bigint(20) NOT NULL DEFAULT 0 COMMENT '<%= field.alias %>',
  <% } else if (field.type === 'varchar(255)') { %>`<%= field.fieldName %>` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '<%= field.alias %>',
  <% } else if (field.type === 'timestamp(6)') { %>`<%= field.fieldName %>` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '<%= field.alias %>',
  <% } %><% }) %>
  PRIMARY KEY (`id`) USING BTREE
)ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '<%= variables.tableNameAlias %>' ROW_FORMAT = Dynamic;


SET FOREIGN_KEY_CHECKS = 1;

-- 查询变更之后的结果

-- 提交事务
commit;

-- 查询当前时间
select now();

-- 关闭日志记录
notee
