package <%= variables.packageName %>.controller;

import <%= variables.packageName %>.VO.<%= variables.className %>VO;
import <%= variables.packageName %>.service.<%= variables.className %>Service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


@Slf4j
@RestController
@RequestMapping("/")
public class <%= variables.className %>Controller {
    @Autowired
    private <%= variables.className %>Service service;

}
