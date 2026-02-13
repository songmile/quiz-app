package com.quizgen.app.question.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.import-job")
public class ImportJobProperties {

    private int chunkMaxRetries = 2;
    private long retryBaseDelayMs = 1200L;
    private int retentionHours = 24;
    private int timeoutHours = 6;
    private int maxFinishedKeep = 200;

    public int getChunkMaxRetries() {
        return Math.max(0, chunkMaxRetries);
    }

    public void setChunkMaxRetries(int chunkMaxRetries) {
        this.chunkMaxRetries = chunkMaxRetries;
    }

    public long getRetryBaseDelayMs() {
        return Math.max(100L, retryBaseDelayMs);
    }

    public void setRetryBaseDelayMs(long retryBaseDelayMs) {
        this.retryBaseDelayMs = retryBaseDelayMs;
    }

    public int getRetentionHours() {
        return Math.max(1, retentionHours);
    }

    public void setRetentionHours(int retentionHours) {
        this.retentionHours = retentionHours;
    }

    public int getTimeoutHours() {
        return Math.max(1, timeoutHours);
    }

    public void setTimeoutHours(int timeoutHours) {
        this.timeoutHours = timeoutHours;
    }

    public int getMaxFinishedKeep() {
        return Math.max(10, maxFinishedKeep);
    }

    public void setMaxFinishedKeep(int maxFinishedKeep) {
        this.maxFinishedKeep = maxFinishedKeep;
    }
}
