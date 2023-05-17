package  <%= variables.packageName %>.Dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import <%= variables.packageName %>.DO.<%= variables.className %>DO;


public interface <%= variables.className %>Dao extends BaseMapper<<%= variables.className %>DO> {

}
