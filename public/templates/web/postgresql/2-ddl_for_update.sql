
\o Log/2-ddl_for_update.log
begin;

--查询当前时间
select now();

\timing
--ddl SQL变更语句

-- ----------------------------
-- Table structure for <%= variables.tableName %>
-- ----------------------------
CREATE TABLE <%= variables.tableName %> (
    "id" int8 NOT NULL,
    <% fields.forEach(field => { %><% if (field.type === 'int2') { %>`<%= field.fieldName %>` int2 NOT NULL DEFAULT 0,
    <% } else if (field.type === 'int8') { %>`<%= field.fieldName %>` int8 NOT NULL DEFAULT 0,
    <% } else if (field.type === 'varchar(255)') { %>`<%= field.fieldName %>` varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
    <% } else if (field.type === 'timestamp(6)') { %>`<%= field.fieldName %>` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    <% } %><% }) %>
    PRIMARY KEY("id")
);
-- COMMENT
COMMENT ON TABLE <%= variables.tableName %> IS '<%= variables.tableNameAlias %>';
COMMENT ON COLUMN <%= variables.tableName %>.id IS '<%= variables.tableNameAlias %>ID';
<% fields.forEach(field => { %>COMMENT ON COLUMN <%= variables.tableName %>.<%= field.fieldName %> IS '<%= field.alias %>';
<% }) %>

\timing
--查询当前时间
select now();

commit;
