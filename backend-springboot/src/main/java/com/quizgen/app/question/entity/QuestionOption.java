package com.quizgen.app.question.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

@TableName("question_option")
public class QuestionOption {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("question_id")
    private Long questionId;

    @TableField("option_key")
    private String optionKey;

    @TableField("option_text")
    private String optionText;

    @TableField("sort_order")
    private Integer sortOrder;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getOptionKey() { return optionKey; }
    public void setOptionKey(String optionKey) { this.optionKey = optionKey; }
    public String getOptionText() { return optionText; }
    public void setOptionText(String optionText) { this.optionText = optionText; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}