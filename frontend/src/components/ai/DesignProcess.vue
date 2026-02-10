<template>
  <div class="design-process">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <i class="fas fa-project-diagram"></i> 设计流程
        </div>
        <div class="card-actions">
          <button 
            class="action-button" 
            @click="generateDesignProcess"
            :disabled="isLoading || isGenerating"
            title="生成设计流程"
          >
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isGenerating }"></i>
          </button>
          <button 
            class="action-button" 
            @click="toggleFullscreen"
            :disabled="!designProcess"
            title="全屏查看"
          >
            <i class="fas fa-expand"></i>
          </button>
        </div>
      </div>
      
      <div class="card-content">
        <div class="loading-spinner" v-if="isLoading">
          <i class="fas fa-circle-notch fa-spin"></i>
          <span>加载中...</span>
        </div>
        
        <div class="generating-indicator" v-else-if="isGenerating">
          <i class="fas fa-cog fa-spin"></i>
          <span>正在生成设计流程，请稍候...</span>
          <div class="progress-bar">
            <div class="progress-indeterminate"></div>
          </div>
        </div>
        
        <div class="empty-state" v-else-if="!designProcess">
          <i class="fas fa-project-diagram"></i>
          <p>尚未生成设计流程</p>
          <button class="generate-button" @click="generateDesignProcess">
            生成设计流程
          </button>
        </div>
        
        <div class="process-content" v-else>
          <div class="process-metadata">
            <span class="generated-time">
              生成时间: {{ formatDate(designProcess.generatedAt) }}
            </span>
          </div>
          
          <div class="design-analysis" v-if="hasDesignAnalysis">
            <h3>设计分析</h3>
            <div class="analysis-section">
              <div class="section-title">核心概念:</div>
              <div class="section-content">{{ designAnalysis.core_concept }}</div>
            </div>
            
            <div class="analysis-section">
              <div class="section-title">设计意图:</div>
              <div class="section-content">{{ designAnalysis.design_intent }}</div>
            </div>
            
            <div class="option-analysis" v-if="hasOptionAnalysis">
              <h4>选项分析</h4>
              
              <div class="correct-option">
                <div class="option-title">正确选项:</div>
                <div class="option-logic">{{ optionAnalysis.correct_option.logic }}</div>
                <div class="option-knowledge">知识点: {{ optionAnalysis.correct_option.knowledge_point }}</div>
              </div>
              
              <div class="wrong-options">
                <div class="option-title">错误选项分析:</div>
                <div 
                  v-for="(option, index) in optionAnalysis.wrong_options" 
                  :key="index"
                  class="wrong-option"
                >
                  <div class="option-letter">选项 {{ option.option }}:</div>
                  <div class="option-trap">设计逻辑: {{ option.trap_logic }}</div>
                  <div class="option-misunderstanding">常见误解: {{ option.common_misunderstanding }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flowcharts" v-if="hasFlowcharts">
            <h3>流程图</h3>
            
            <div 
              v-for="(chart, index) in designProcess.flowcharts" 
              :key="index"
              class="flowchart-container"
            >
              <div class="chart-header">
                <h4>{{ chart.title || `流程图 ${index + 1}` }}</h4>
                <p v-if="chart.description" class="chart-description">{{ chart.description }}</p>
              </div>
              
              <div :id="`chart-${index}`" class="mermaid-chart"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Fullscreen Modal -->
    <div class="fullscreen-modal" v-if="isFullscreen" @click="closeFullscreen">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>设计流程</h3>
          <button class="close-button" @click="closeFullscreen">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="design-analysis" v-if="hasDesignAnalysis">
            <h3>设计分析</h3>
            <div class="analysis-section">
              <div class="section-title">核心概念:</div>
              <div class="section-content">{{ designAnalysis.core_concept }}</div>
            </div>
            
            <div class="analysis-section">
              <div class="section-title">设计意图:</div>
              <div class="section-content">{{ designAnalysis.design_intent }}</div>
            </div>
            
            <div class="option-analysis" v-if="hasOptionAnalysis">
              <h4>选项分析</h4>
              
              <div class="correct-option">
                <div class="option-title">正确选项:</div>
                <div class="option-logic">{{ optionAnalysis.correct_option.logic }}</div>
                <div class="option-knowledge">知识点: {{ optionAnalysis.correct_option.knowledge_point }}</div>
              </div>
              
              <div class="wrong-options">
                <div class="option-title">错误选项分析:</div>
                <div 
                  v-for="(option, index) in optionAnalysis.wrong_options" 
                  :key="index"
                  class="wrong-option"
                >
                  <div class="option-letter">选项 {{ option.option }}:</div>
                  <div class="option-trap">设计逻辑: {{ option.trap_logic }}</div>
                  <div class="option-misunderstanding">常见误解: {{ option.common_misunderstanding }}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flowcharts" v-if="hasFlowcharts">
            <h3>流程图</h3>
            
            <div 
              v-for="(chart, index) in designProcess.flowcharts" 
              :key="index"
              class="flowchart-container"
            >
              <div class="chart-header">
                <h4>{{ chart.title || `流程图 ${index + 1}` }}</h4>
                <p v-if="chart.description" class="chart-description">{{ chart.description }}</p>
              </div>
              
              <div :id="`chart-fullscreen-${index}`" class="mermaid-chart-fullscreen"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 引入mermaid库用于渲染流程图
import mermaid from 'mermaid';

export default {
  name: 'DesignProcess',
  props: {
    questionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      checkInterval: null,
      isFullscreen: false
    };
  },
  computed: {
    designProcess() {
      return this.$store.getters['ai/designProcess'];
    },
    isLoading() {
      return this.$store.getters['ai/isLoading'];
    },
    isGenerating() {
      return this.$store.getters['ai/generatingStatus'].designProcess;
    },
    hasDesignAnalysis() {
      return this.designProcess && 
             this.designProcess.processData && 
             this.designProcess.processData.design_analysis;
    },
    designAnalysis() {
      return this.hasDesignAnalysis ? this.designProcess.processData.design_analysis : {};
    },
    hasOptionAnalysis() {
      return this.hasDesignAnalysis && 
             this.designAnalysis.option_analysis;
    },
    optionAnalysis() {
      return this.hasOptionAnalysis ? this.designAnalysis.option_analysis : {};
    },
    hasFlowcharts() {
      return this.designProcess && 
             this.designProcess.flowcharts && 
             this.designProcess.flowcharts.length > 0;
    }
  },
  methods: {
    async fetchDesignProcess() {
      await this.$store.dispatch('ai/getDesignProcess', this.questionId);
      
      // If design process is found, render flowcharts
      if (this.designProcess?.flowcharts) {
        this.$nextTick(() => {
          this.renderFlowcharts();
        });
      }
    },
    async generateDesignProcess() {
      // Start generation
      const response = await this.$store.dispatch('ai/generateDesignProcess', {
        questionId: this.questionId,
        force: false
      });
      
      if (response) {
        // Start polling for design process
        this.startPolling();
      }
    },
    startPolling() {
      // Clear existing interval if any
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      
      // Check every 3 seconds until design process is found or max attempts reached
      let attempts = 0;
      const maxAttempts = 30; // About 1.5 minute of polling (charts can take longer)
      
      this.checkInterval = setInterval(async () => {
        attempts++;
        await this.fetchDesignProcess();
        
        // Stop polling if design process is found or max attempts reached
        if (this.designProcess?.flowcharts || attempts >= maxAttempts) {
          clearInterval(this.checkInterval);
          this.checkInterval = null;
        }
      }, 3000);
    },
    formatDate(dateString) {
      if (!dateString) return '';
      
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    toggleFullscreen() {
      if (!this.designProcess) return;
      
      this.isFullscreen = true;
      this.$nextTick(() => {
        this.renderFlowcharts(true);
      });
    },
    closeFullscreen() {
      this.isFullscreen = false;
    },

    renderFlowcharts(fullscreen = false) {
  if (!this.designProcess?.flowcharts) return;
  
  // 确保在浏览器环境中执行
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  
  // 使用setTimeout确保DOM已完全渲染
  setTimeout(() => {
    try {
      // 重新初始化mermaid以防止先前的错误状态影响
      mermaid.initialize({
        startOnLoad: false,
        theme: 'neutral',
        securityLevel: 'loose',
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true,
          curve: 'basis'
        }
      });
      
      this.designProcess.flowcharts.forEach((chart, index) => {
        const containerId = fullscreen ? `chart-fullscreen-${index}` : `chart-${index}`;
        const container = document.getElementById(containerId);
        
        if (container && chart.mermaidCode) {
          // 清空容器
          container.innerHTML = '';
          
          // 使用替代渲染方法
          const renderDiv = document.createElement('div');
          renderDiv.className = 'mermaid';
          renderDiv.textContent = chart.mermaidCode;
          container.appendChild(renderDiv);
          
          try {
            // 使用init替代render方法
            mermaid.init(undefined, container.querySelectorAll('.mermaid'));
          } catch (renderError) {
            console.error('Error during mermaid.init:', renderError);
            container.innerHTML = `<div class="chart-error">
              <i class="fas fa-exclamation-triangle"></i>
              <p>流程图渲染失败: ${renderError.message}</p>
            </div>`;
          }
        }
      });
    } catch (error) {
      console.error('General error in renderFlowcharts:', error);
    }
  }, 200); // 增加延迟时间以确保DOM准备就绪
}

  },
  mounted() {
    // Fetch design process when component mounts
    this.fetchDesignProcess();
  },
  beforeUnmount() {
    // Clear interval when component is unmounted
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  },
  watch: {
    // Fetch new design process when question changes
    questionId(newId) {
      this.$store.commit('ai/SET_DESIGN_PROCESS', null);
      this.fetchDesignProcess();
    }
  }
};
</script>

<style scoped>
.design-process {
  margin-bottom: 20px;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f0f7ff;
  border-bottom: 1px solid #d1e6ff;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  background-color: transparent;
  border: none;
  border-radius: 4px;
  padding: 6px;
  cursor: pointer;
  color: #1e40af;
  transition: all 0.2s;
}

.action-button:hover:not(:disabled) {
  background-color: rgba(30, 64, 175, 0.1);
}

.action-button:disabled {
  color: #93c5fd;
  cursor: not-allowed;
}

.card-content {
  padding: 20px;
  min-height: 400px;
}

.loading-spinner, .generating-indicator, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 360px;
  gap: 15px;
  color: #6c757d;
}

.loading-spinner i, .generating-indicator i, .empty-state i {
  font-size: 2rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-indeterminate {
  position: absolute;
  height: 100%;
  width: 30%;
  background-color: #1e40af;
  animation: indeterminate 1.5s infinite ease-in-out;
}

@keyframes indeterminate {
  0% {
    left: -30%;
  }
  100% {
    left: 100%;
  }
}

.generate-button {
  background-color: #1e40af;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.generate-button:hover {
  background-color: #1e3a8a;
}

.process-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.process-metadata {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: right;
}

.design-analysis {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.design-analysis h3, .flowcharts h3 {
  font-size: 1.2rem;
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 10px;
}

.analysis-section {
  margin-bottom: 15px;
}

.section-title {
  font-weight: 500;
  color: #1e40af;
  margin-bottom: 5px;
}

.section-content {
  line-height: 1.5;
  color: #333;
}

.option-analysis {
  margin-top: 20px;
}

.option-analysis h4 {
  font-size: 1.1rem;
  color: #333;
  margin-top: 0;
  margin-bottom: 15px;
}

.correct-option {
  background-color: #e8f5e9;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.option-title {
  font-weight: 500;
  color: #2e7d32;
  margin-bottom: 10px;
}

.option-logic {
  line-height: 1.5;
  color: #333;
  margin-bottom: 10px;
}

.option-knowledge {
  font-style: italic;
  color: #2e7d32;
}

.wrong-options {
  background-color: #ffebee;
  border-radius: 6px;
  padding: 15px;
}

.wrong-option {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ffcdd2;
}

.wrong-option:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.option-letter {
  font-weight: 500;
  color: #c62828;
  margin-bottom: 5px;
}

.option-trap, .option-misunderstanding {
  line-height: 1.5;
  color: #333;
  margin-bottom: 5px;
}

.flowcharts {
  margin-top: 10px;
}

.flowchart-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.flowchart-container:last-child {
  margin-bottom: 0;
}

.chart-header {
  margin-bottom: 15px;
}

.chart-header h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1rem;
  color: #333;
}

.chart-description {
  margin: 0;
  font-size: 0.9rem;
  color: #6c757d;
}

.mermaid-chart {
  background-color: white;
  border-radius: 6px;
  padding: 15px;
  overflow-x: auto;
  border: 1px solid #e9ecef;
  min-height: 200px;
}

.chart-error {
  text-align: center;
  padding: 20px;
  color: #c62828;
}

.chart-error i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.fullscreen-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.close-button {
  background-color: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(90vh - 70px);
}

.mermaid-chart-fullscreen {
  background-color: white;
  border-radius: 6px;
  padding: 15px;
  overflow-x: auto;
  border: 1px solid #e9ecef;
  min-height: 300px;
  margin-bottom: 20px;
}
</style>
