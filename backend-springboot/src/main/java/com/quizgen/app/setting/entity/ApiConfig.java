package com.quizgen.app.setting.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("api_config")
public class ApiConfig {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    @TableField("api_url")
    private String apiUrl;

    private String model;

    @TableField("api_key_masked")
    private String apiKeyMasked;

    @TableField("api_key_cipher")
    private String apiKeyCipher;

    @TableField("chunk_size")
    private Integer chunkSize;

    @TableField("max_tokens")
    private Integer maxTokens;

    private Boolean enabled;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getApiKeyMasked() { return apiKeyMasked; }
    public void setApiKeyMasked(String apiKeyMasked) { this.apiKeyMasked = apiKeyMasked; }
    public String getApiKeyCipher() { return apiKeyCipher; }
    public void setApiKeyCipher(String apiKeyCipher) { this.apiKeyCipher = apiKeyCipher; }
    public Integer getChunkSize() { return chunkSize; }
    public void setChunkSize(Integer chunkSize) { this.chunkSize = chunkSize; }
    public Integer getMaxTokens() { return maxTokens; }
    public void setMaxTokens(Integer maxTokens) { this.maxTokens = maxTokens; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
