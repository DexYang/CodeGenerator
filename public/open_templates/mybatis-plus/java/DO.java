package <%= variables.packageName %>.DO;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@TableName("<%= variables.tableName %>")
@Data
public class <%= variables.className %>DO {
<% fields.forEach(field => { -%>
<% if (['id', 'creator_id', 'delete_flag', 'insert_time', 'update_time'].indexOf(field.__line) === -1) { %>
    @TableField(value = "<%= field.__line %>")
    public <%= field.type %> <%= field.__hump %>;
<% }}) %>
}
