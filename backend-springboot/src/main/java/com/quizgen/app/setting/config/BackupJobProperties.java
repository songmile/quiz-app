package com.quizgen.app.setting.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.backup-job")
public class BackupJobProperties {

    private int maxRetries = 2;
    private long retryBaseDelayMs = 1200L;
    private int retentionHours = 72;
    private int maxFinishedKeep = 200;
    private int staleProcessingMinutes = 30;

    public int getMaxRetries() { return Math.max(0, maxRetries); }
    public void setMaxRetries(int maxRetries) { this.maxRetries = maxRetries; }

    public long getRetryBaseDelayMs() { return Math.max(100L, retryBaseDelayMs); }
    public void setRetryBaseDelayMs(long retryBaseDelayMs) { this.retryBaseDelayMs = retryBaseDelayMs; }

    public int getRetentionHours() { return Math.max(1, retentionHours); }
    public void setRetentionHours(int retentionHours) { this.retentionHours = retentionHours; }

    public int getMaxFinishedKeep() { return Math.max(10, maxFinishedKeep); }
    public void setMaxFinishedKeep(int maxFinishedKeep) { this.maxFinishedKeep = maxFinishedKeep; }

    public int getStaleProcessingMinutes() { return Math.max(5, staleProcessingMinutes); }
    public void setStaleProcessingMinutes(int staleProcessingMinutes) { this.staleProcessingMinutes = staleProcessingMinutes; }
}
