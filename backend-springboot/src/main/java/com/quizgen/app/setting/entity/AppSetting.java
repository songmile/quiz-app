package com.quizgen.app.setting.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("app_setting")
public class AppSetting {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("setting_key")
    private String settingKey;

    @TableField("setting_value_json")
    private String settingValueJson;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }
    public String getSettingValueJson() { return settingValueJson; }
    public void setSettingValueJson(String settingValueJson) { this.settingValueJson = settingValueJson; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
