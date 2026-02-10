<template>
  <div class="knowledge-tree">
    <div class="card">
      <div class="card-header">
        <div class="card-title">
          <i class="fas fa-sitemap"></i> 知识树
        </div>
        <div class="card-actions">
          <button 
            class="action-button" 
            @click="generateKnowledgeTree"
            :disabled="isLoading || isGenerating"
            title="生成知识树"
          >
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': isGenerating }"></i>
          </button>
          <button 
            class="action-button" 
            @click="toggleFullscreen"
            :disabled="!knowledgeTree"
            title="全屏查看"
          >
            <i class="fas fa-expand"></i>
          </button>
          <button 
            class="action-button" 
            @click="resetZoom"
            :disabled="!knowledgeTree"
            title="重置视图"
          >
            <i class="fas fa-home"></i>
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
          <span>正在生成知识树，请稍候...</span>
          <div class="progress-bar">
            <div class="progress-indeterminate"></div>
          </div>
        </div>
        
        <div class="empty-state" v-else-if="!knowledgeTree">
          <i class="fas fa-project-diagram"></i>
          <p>尚未生成知识树</p>
          <button class="generate-button" @click="generateKnowledgeTree">
            生成知识树
          </button>
        </div>
        
        <div class="tree-content" v-else>
          <div class="tree-metadata">
            <span class="generated-time">
              生成时间: {{ formatDate(knowledgeTree.generatedAt) }}
            </span>
          </div>
          
          <div class="zoom-controls">
            <button class="zoom-button" @click="zoomIn" title="放大">
              <i class="fas fa-search-plus"></i>
            </button>
            <button class="zoom-button" @click="zoomOut" title="缩小">
              <i class="fas fa-search-minus"></i>
            </button>
            <div class="zoom-level">{{ Math.round(currentZoom * 100) }}%</div>
          </div>
          
          <div class="tree-instructions">
            <i class="fas fa-info-circle"></i> 提示: 拖动可平移视图，滚轮可缩放
          </div>
          
          <div id="tree-visualization" class="tree-visualization"></div>
        </div>
      </div>
    </div>
    
    <!-- Fullscreen Modal -->
    <div class="fullscreen-modal" v-if="isFullscreen" @click="closeFullscreen">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>知识树</h3>
          <div class="modal-controls">
            <button class="zoom-button" @click="zoomIn" title="放大">
              <i class="fas fa-search-plus"></i>
            </button>
            <button class="zoom-button" @click="zoomOut" title="缩小">
              <i class="fas fa-search-minus"></i>
            </button>
            <button class="zoom-button" @click="resetZoom" title="重置视图">
              <i class="fas fa-home"></i>
            </button>
            <button class="close-button" @click="closeFullscreen">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="modal-body">
          <div id="tree-visualization-fullscreen" class="tree-visualization-fullscreen"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'KnowledgeTree',
  props: {
    questionId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      checkInterval: null,
      isFullscreen: false,
      svgZoom: null,
      currentZoom: 1,
      currentContainer: null
    };
  },
  computed: {
    knowledgeTree() {
      return this.$store.getters['ai/knowledgeTree'];
    },
    isLoading() {
      return this.$store.getters['ai/isLoading'];
    },
    isGenerating() {
      return this.$store.getters['ai/generatingStatus'].knowledgeTree;
    }
  },
  methods: {
    async fetchKnowledgeTree() {
      await this.$store.dispatch('ai/getKnowledgeTree', this.questionId);
      
      // If tree data is found, render it
      if (this.knowledgeTree?.treeData) {
        this.$nextTick(() => {
          this.renderTree();
        });
      }
    },
    async generateKnowledgeTree() {
      // Start generation
      const response = await this.$store.dispatch('ai/generateKnowledgeTree', {
        questionId: this.questionId,
        force: false
      });
      
      if (response) {
        // Start polling for knowledge tree
        this.startPolling();
      }
    },
    startPolling() {
      // Clear existing interval if any
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      
      // Check every 3 seconds until tree is found or max attempts reached
      let attempts = 0;
      const maxAttempts = 30; // About 1.5 minute of polling (trees can take longer)
      
      this.checkInterval = setInterval(async () => {
        attempts++;
        await this.fetchKnowledgeTree();
        
        // Stop polling if tree is found or max attempts reached
        if (this.knowledgeTree?.treeData?.root || attempts >= maxAttempts) {
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
      if (!this.knowledgeTree) return;
      
      this.isFullscreen = true;
      this.$nextTick(() => {
        this.renderTree(true);
      });
    },
    closeFullscreen() {
      this.isFullscreen = false;
      this.$nextTick(() => {
        this.renderTree(false);
      });
    },
    renderTree(fullscreen = false) {
      if (!this.knowledgeTree?.treeData?.root) return;
      
      this.currentContainer = fullscreen ? 'tree-visualization-fullscreen' : 'tree-visualization';
      const containerId = this.currentContainer;
      const container = document.getElementById(containerId);
      
      if (!container) return;
      
      // Clear previous visualization
      container.innerHTML = '';
      
      // Reset zoom level
      this.currentZoom = 1;
      
      // Calculate dimensions
      const width = fullscreen ? 1200 : 600;
      const height = fullscreen ? 800 : 400;
      
      // Create SVG with zoom support
      const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .call(this.setupZoom(fullscreen))
        .append('g')
        .attr('class', 'zoom-container')
        .attr('transform', `translate(${width / 4}, ${height / 2})`);
      
      // Add a subtle grid pattern for background
      svg.append('pattern')
        .attr('id', 'grid')
        .attr('width', 20)
        .attr('height', 20)
        .attr('patternUnits', 'userSpaceOnUse')
        .append('path')
        .attr('d', 'M 20 0 L 0 0 0 20')
        .attr('fill', 'none')
        .attr('stroke', '#f0f0f0')
        .attr('stroke-width', 1);
        
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', -width/3)
        .attr('y', -height/2)
        .attr('fill', 'url(#grid)');
      
      // Convert data to d3 hierarchy
      const treeData = this.knowledgeTree.treeData.root;
      const treeHeight = height * 0.8;
      const treeWidth = width * 0.8;
      
      // Create d3 tree layout
      const treeLayout = d3.tree()
        .size([treeHeight, treeWidth])
        .nodeSize([40, 100]);
      
      // Create hierarchy from data
      const root = d3.hierarchy(treeData);
      
      // Assign positions to nodes
      treeLayout(root);
      
      // Create links with curved paths
      const links = svg.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d => {
          return d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x)(d);
        })
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .attr('stroke', d => {
          // Use different colors for core and non-core branches
          return d.target.data.is_core ? '#ff9800' : '#90caf9';
        })
        .attr('stroke-dasharray', d => {
          // Add dash effect for non-core branches
          return d.target.data.is_core ? 'none' : '5,3';
        })
        .style('opacity', 0) // Start invisible for animation
        .transition()
        .duration(800)
        .style('opacity', 0.7); // Fade in
      
      // Create nodes
      const nodes = svg.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', d => `node ${d.children ? 'node-internal' : 'node-leaf'}`)
        .attr('transform', d => `translate(${d.y},${d.x})`)
        .style('opacity', 0) // Start invisible for animation
        .transition()
        .duration(800)
        .delay((d, i) => i * 20) // Stagger animation
        .style('opacity', 1); // Fade in
      
      // Create node groups with click interaction
      const nodeGroups = svg.selectAll('.node');
      
      // Add node backgrounds (larger hit area and visual emphasis)
      nodeGroups.append('circle')
        .attr('r', d => d.data.is_core ? 30 : 25)
        .attr('fill', 'white')
        .attr('stroke', d => {
          return d.data.is_core ? '#ff5722' : '#2196f3';
        })
        .attr('stroke-width', 1)
        .attr('opacity', 0.3);
      
      // Add node circles
      nodeGroups.append('circle')
        .attr('r', d => d.data.is_core ? 15 : 12)
        .attr('fill', d => {
          // Use provided color or default based on node type
          if (d.data.color) return d.data.color;
          if (d.data.is_core) return '#ff5722';
          if (!d.children) return '#4caf50'; // Leaf nodes
          return '#2196f3'; // Internal nodes
        })
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d => d.data.is_core ? 17 : 14);
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', d => d.data.is_core ? 15 : 12);
        });
      
      // Add node labels
      nodeGroups.append('text')
        .attr('dy', d => d.children ? -20 : 25)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(d => d.data.name)
        .style('font-size', d => d.data.is_core ? '14px' : '12px')
        .style('font-weight', d => d.data.is_core ? 'bold' : 'normal')
        .style('fill', '#333')
        .style('text-shadow', '0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white')
        .style('pointer-events', 'none'); // Don't interfere with node clicking
      
      // Add interactive tooltips
      nodeGroups.append('title')
        .text(d => {
          let tooltip = d.data.name;
          if (d.data.description) {
            tooltip += '\n\n' + d.data.description;
          }
          if (d.data.level !== undefined) {
            tooltip += '\n\n层级: ' + d.data.level;
          }
          if (d.data.is_core) {
            tooltip += '\n\n[核心知识点]';
          }
          return tooltip;
        });
      
      // Add event listener for nodes
      nodeGroups.selectAll('circle')
        .on('click', (event, d) => {
          // Highlight node and its path to root when clicked
          this.highlightNodePath(svg, d, root);
        });
      
      // Append a legend
      if (fullscreen) {
        this.appendLegend(svg, width, height);
      }
    },
    setupZoom(fullscreen) {
      // Create zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4]) // Min and max zoom scale
        .on('zoom', (event) => {
          // Update the transform of the zoom container
          d3.select(`#${this.currentContainer} svg g.zoom-container`)
            .attr('transform', event.transform);
          
          // Update current zoom level for display
          this.currentZoom = event.transform.k;
        });
      
      this.svgZoom = zoom;
      return zoom;
    },
    highlightNodePath(svg, d, root) {
      // First reset all nodes and links to normal state
      svg.selectAll('.node circle')
        .transition()
        .duration(300)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('r', d => d.data.is_core ? 15 : 12);
      
      svg.selectAll('.link')
        .transition()
        .duration(300)
        .attr('stroke-width', 1.5)
        .style('opacity', 0.7);
      
      // Highlight the clicked node
      svg.selectAll('.node')
        .filter(node => node === d)
        .select('circle')
        .transition()
        .duration(300)
        .attr('stroke', '#ff5722')
        .attr('stroke-width', 4)
        .attr('r', d.data.is_core ? 17 : 14);
      
      // Find path to root
      const pathNodes = [];
      let currentNode = d;
      while (currentNode) {
        pathNodes.push(currentNode);
        currentNode = currentNode.parent;
      }
      
      // Highlight links in the path
      svg.selectAll('.link')
        .filter(link => {
          return pathNodes.includes(link.target) && pathNodes.includes(link.source);
        })
        .transition()
        .duration(300)
        .attr('stroke-width', 3)
        .style('opacity', 1);
      
      // Highlight nodes in the path
      svg.selectAll('.node')
        .filter(node => pathNodes.includes(node) && node !== d) // Not the clicked node (already styled)
        .select('circle')
        .transition()
        .duration(300)
        .attr('stroke', '#ff9800')
        .attr('stroke-width', 3);
    },
    appendLegend(svg, width, height) {
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${-width/4 + 20}, ${-height/2 + 30})`);
      
      // Legend title
      legend.append('text')
        .attr('x', 0)
        .attr('y', 0)
        .text('图例')
        .style('font-weight', 'bold')
        .style('font-size', '14px');
      
      // Core node
      legend.append('circle')
        .attr('cx', 10)
        .attr('cy', 25)
        .attr('r', 8)
        .attr('fill', '#ff5722');
      
      legend.append('text')
        .attr('x', 25)
        .attr('y', 29)
        .text('核心知识点')
        .style('font-size', '12px');
      
      // Internal node
      legend.append('circle')
        .attr('cx', 10)
        .attr('cy', 50)
        .attr('r', 8)
        .attr('fill', '#2196f3');
      
      legend.append('text')
        .attr('x', 25)
        .attr('y', 54)
        .text('概念节点')
        .style('font-size', '12px');
      
      // Leaf node
      legend.append('circle')
        .attr('cx', 10)
        .attr('cy', 75)
        .attr('r', 8)
        .attr('fill', '#4caf50');
      
      legend.append('text')
        .attr('x', 25)
        .attr('y', 79)
        .text('叶节点')
        .style('font-size', '12px');
    },
    zoomIn() {
      if (!this.svgZoom) return;
      
      const selection = d3.select(`#${this.currentContainer} svg`);
      this.svgZoom.scaleBy(selection, 1.3);
    },
    zoomOut() {
      if (!this.svgZoom) return;
      
      const selection = d3.select(`#${this.currentContainer} svg`);
      this.svgZoom.scaleBy(selection, 0.7);
    },
    resetZoom() {
      if (!this.svgZoom) return;
      
      const selection = d3.select(`#${this.currentContainer} svg`);
      this.svgZoom.transform(selection, d3.zoomIdentity);
    }
  },
  mounted() {
    // Fetch knowledge tree when component mounts
    this.fetchKnowledgeTree();
  },
  beforeUnmount() {
    // Clear interval when component is unmounted
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  },
  watch: {
    // Fetch new tree when question changes
    questionId(newId) {
      this.$store.commit('ai/SET_KNOWLEDGE_TREE', null);
      this.fetchKnowledgeTree();
    }
  }
};
</script>

<style scoped>
.knowledge-tree {
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
  background-color: #f0fff0;
  border-bottom: 1px solid #d1e7dd;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #198754;
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
  color: #198754;
  transition: all 0.2s;
}

.action-button:hover:not(:disabled) {
  background-color: rgba(25, 135, 84, 0.1);
}

.action-button:disabled {
  color: #8bc4a5;
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
  background-color: #198754;
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
  background-color: #198754;
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
  background-color: #157347;
}

.tree-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.tree-metadata {
  font-size: 0.8rem;
  color: #6c757d;
  text-align: right;
}

.tree-instructions {
  font-size: 0.85rem;
  color: #6c757d;
  text-align: center;
  padding: 6px 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 8px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.zoom-button {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  background-color: white;
  color: #198754;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.zoom-button:hover {
  background-color: #f0fff0;
  border-color: #198754;
}

.zoom-level {
  font-size: 0.85rem;
  color: #6c757d;
  min-width: 45px;
}

.tree-visualization {
  height: 400px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background-color: #fcfcfc;
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

.modal-controls {
  display: flex;
  align-items: center;
  gap: 10px;
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
}

.tree-visualization-fullscreen {
  height: 700px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background-color: #fcfcfc;
}

/* D3 specific styles */
:deep(.link) {
  stroke-linejoin: round;
  stroke-linecap: round;
}

:deep(.node-internal text) {
  text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff;
}
</style>