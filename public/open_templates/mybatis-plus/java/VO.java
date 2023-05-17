package <%= variables.packageName %>.VO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class <%= variables.className %>VO {
    @JsonProperty("id")
    public Long id;

<% fields.forEach(field => { -%>
<% if (field.show) { -%>
<% if (field.notNull) { -%>
    @NotNull
    @NotBlank
<% } -%>
    @JsonProperty("<%= field.__line %>")
    public <%= field.type %> <%= field.__hump %>;

<% }}) %>}
