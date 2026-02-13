package com.quizgen.app;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.quizgen.app.**.mapper")
@SpringBootApplication
public class QuizGenApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuizGenApplication.class, args);
    }
}
