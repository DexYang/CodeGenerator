-- ----------------------------
-- Table structure for <%= variables.tableName %>
-- ----------------------------
CREATE TABLE <%= variables.tableName %> (
    "id" int8 NOT NULL,
    <% fields.forEach(field => { %><% if (field.type === 'Integer') { %>"<%= field.__line %>" int2 NOT NULL DEFAULT 0,
    <% } else if (field.type === 'Long') { %>"<%= field.__line %>" int8 NOT NULL DEFAULT 0,
    <% } else if (field.type === 'Double') { %>"<%= field.__line %>" numeric NOT NULL DEFAULT 0,
    <% } else if (field.type === 'String') { %>"<%= field.__line %>" varchar(255) COLLATE "pg_catalog"."default" NOT NULL DEFAULT ''::character varying,
    <% } else if (field.type === 'LocalDateTime') { %>"<%= field.__line %>" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    <% } %><% }) %>
    PRIMARY KEY("id")
);
-- COMMENT
COMMENT ON TABLE <%= variables.tableName %> IS '<%= variables.tableNameAlias %>';
COMMENT ON COLUMN <%= variables.tableName %>.id IS '<%= variables.tableNameAlias %>ID';
<% fields.forEach(field => { %>COMMENT ON COLUMN <%= variables.tableName %>.<%= field.__line %> IS '<%= field.alias %>';
<% }) %>
