package com.quizgen.app.setting.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("backup_job")
public class BackupJob {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("job_no")
    private String jobNo;

    private String kind;

    private String filename;

    private String status;

    @TableField("retry_count")
    private Integer retryCount;

    @TableField("max_retries")
    private Integer maxRetries;

    @TableField("error_message")
    private String errorMessage;

    @TableField("started_at")
    private LocalDateTime startedAt;

    @TableField("created_at")
    private LocalDateTime createdAt;

    @TableField("ended_at")
    private LocalDateTime endedAt;

    @TableField("updated_at")
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getJobNo() { return jobNo; }
    public void setJobNo(String jobNo) { this.jobNo = jobNo; }
    public String getKind() { return kind; }
    public void setKind(String kind) { this.kind = kind; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getRetryCount() { return retryCount; }
    public void setRetryCount(Integer retryCount) { this.retryCount = retryCount; }
    public Integer getMaxRetries() { return maxRetries; }
    public void setMaxRetries(Integer maxRetries) { this.maxRetries = maxRetries; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
