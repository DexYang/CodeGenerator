-- ----------------------------
-- Table structure for <%= variables.tableName %>
-- ----------------------------
CREATE TABLE `<%= variables.tableName %>` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'ID',
  <% fields.forEach(field => { %><% if (field.type === 'Integer') { %>`<%= field.__line %>` tinyint(4) NOT NULL DEFAULT 0 COMMENT '<%= field.alias %>',
  <% } else if (field.type === 'Long') { %>`<%= field.__line %>` bigint(20) NOT NULL DEFAULT 0 COMMENT '<%= field.alias %>',
  <% } else if (field.type === 'Double') { %>`<%= field.__line %>` double NOT NULL DEFAULT 0 COMMENT '<%= field.alias %>',
  <% } else if (field.type === 'String') { %>`<%= field.__line %>` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '<%= field.alias %>',
  <% } else if (field.type === 'LocalDateTime') { %>`<%= field.__line %>` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '<%= field.alias %>',
  <% } %><% }) %>
  PRIMARY KEY (`id`) USING BTREE
)ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '<%= variables.tableNameAlias %>' ROW_FORMAT = Dynamic;
