package <%= variables.packageName %>.service.impl;

import org.springframework.stereotype.Service;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;

import <%= variables.packageName %>.DO.<%= variables.className %>DO;
import <%= variables.packageName %>.Dao.<%= variables.className %>Dao;
import <%= variables.packageName %>.service.<%= variables.className %>Service;

@Service("<%= variables.className %>Service")
public class <%= variables.className %>ServiceImpl extends ServiceImpl<<%= variables.className %>Dao, <%= variables.className %>DO> implements <%= variables.className %>Service {

}
