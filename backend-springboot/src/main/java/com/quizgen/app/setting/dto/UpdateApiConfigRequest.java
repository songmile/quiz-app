package com.quizgen.app.setting.dto;

public class UpdateApiConfigRequest {

    private String name;
    private String api_key;
    private String api_url;
    private String model;
    private Integer chunk_size;
    private Integer max_tokens;
    private Boolean enabled;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getApi_key() { return api_key; }
    public void setApi_key(String api_key) { this.api_key = api_key; }
    public String getApi_url() { return api_url; }
    public void setApi_url(String api_url) { this.api_url = api_url; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public Integer getChunk_size() { return chunk_size; }
    public void setChunk_size(Integer chunk_size) { this.chunk_size = chunk_size; }
    public Integer getMax_tokens() { return max_tokens; }
    public void setMax_tokens(Integer max_tokens) { this.max_tokens = max_tokens; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
}
