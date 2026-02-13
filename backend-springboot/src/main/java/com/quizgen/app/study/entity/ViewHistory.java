package com.quizgen.app.study.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("view_history")
public class ViewHistory {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("view_key")
    private String viewKey;

    @TableField("current_index")
    private Integer currentIndex;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getViewKey() { return viewKey; }
    public void setViewKey(String viewKey) { this.viewKey = viewKey; }
    public Integer getCurrentIndex() { return currentIndex; }
    public void setCurrentIndex(Integer currentIndex) { this.currentIndex = currentIndex; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}