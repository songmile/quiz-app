package com.quizgen.app.question.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("import_job")
public class ImportJob {

    @TableId(type = IdType.AUTO)
    private Long id;

    @TableField("job_no")
    private String jobNo;

    private String mode;

    private String status;

    @TableField("total_chunks")
    private Integer totalChunks;

    @TableField("processed_chunks")
    private Integer processedChunks;

    @TableField("success_chunks")
    private Integer successChunks;

    @TableField("failed_chunks")
    private Integer failedChunks;

    @TableField("started_at")
    private LocalDateTime startedAt;

    @TableField("ended_at")
    private LocalDateTime endedAt;

    @TableField("error_message")
    private String errorMessage;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getJobNo() { return jobNo; }
    public void setJobNo(String jobNo) { this.jobNo = jobNo; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getTotalChunks() { return totalChunks; }
    public void setTotalChunks(Integer totalChunks) { this.totalChunks = totalChunks; }
    public Integer getProcessedChunks() { return processedChunks; }
    public void setProcessedChunks(Integer processedChunks) { this.processedChunks = processedChunks; }
    public Integer getSuccessChunks() { return successChunks; }
    public void setSuccessChunks(Integer successChunks) { this.successChunks = successChunks; }
    public Integer getFailedChunks() { return failedChunks; }
    public void setFailedChunks(Integer failedChunks) { this.failedChunks = failedChunks; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }
    public LocalDateTime getEndedAt() { return endedAt; }
    public void setEndedAt(LocalDateTime endedAt) { this.endedAt = endedAt; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
