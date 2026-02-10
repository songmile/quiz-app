/**
 * Mermaid图表解析器 - 解析Mermaid语法并转换为其他格式
 */
class MermaidParser {
  constructor() {
    this.nodes = {};
    this.connections = [];
    this.nodeLabels = {};
  }

  /**
   * 解析流程图代码
   * @param {String} mermaidCode Mermaid流程图代码
   * @returns {Object} 解析后的数据
   */
  parseFlowchart(mermaidCode) {
    // 重置
    this.nodes = {};
    this.connections = [];
    this.nodeLabels = {};

    // 提取流程图方向
    let directionMatch = mermaidCode.match(/flowchart\s+([A-Z]{2})/);
    if (!directionMatch) {
      directionMatch = mermaidCode.match(/graph\s+([A-Z]{2})/);
    }

    const direction = directionMatch ? directionMatch[1] : "TD";

    // 提取节点定义
    const nodePattern = /([A-Za-z0-9_]+)(?:\[([^\]]*)\]|\(([^\)]*)\)|{([^}]*)}|>\[([^\]]*)\]|{\{([^}]*)\}})/g;
    let match;
    while ((match = nodePattern.exec(mermaidCode)) !== null) {
      const nodeId = match[1];
      // 找到第一个非空的组，包含标签
      const label = Array.from(match).slice(2).find(g => g !== undefined) || "";
      this.nodes[nodeId] = { id: nodeId };
      this.nodeLabels[nodeId] = label;
    }

    // 提取连接
    const connectionPatterns = [
      /([A-Za-z0-9_]+)\s*-->\s*([A-Za-z0-9_]+)/g,  // A --> B
      /([A-Za-z0-9_]+)\s*-->\|([^|]*)\|\s*([A-Za-z0-9_]+)/g,  // A -->|text| B
      /([A-Za-z0-9_]+)\s*---\s*([A-Za-z0-9_]+)/g,  // A --- B
      /([A-Za-z0-9_]+)\s*-{2,3}\|([^|]*)\|\s*([A-Za-z0-9_]+)/g  // A --|text|-- B or A---|text|--- B
    ];

    for (const pattern of connectionPatterns) {
      while ((match = pattern.exec(mermaidCode)) !== null) {
        const groups = match.slice(1);
        if (groups.length === 2) {  // 简单连接
          const [source, target] = groups;
          this.connections.push({
            source,
            target,
            label: ''
          });
        } else if (groups.length === 3) {  // 带标签的连接
          const [source, label, target] = groups;
          this.connections.push({
            source,
            target,
            label
          });
        }
      }
    }

    return {
      direction,
      nodes: this.nodes,
      connections: this.connections,
      nodeLabels: this.nodeLabels
    };
  }

  /**
   * 转换解析的数据为DOT格式（用于Graphviz）
   * @param {Object} parsedData 解析后的数据
   * @returns {String} DOT格式代码
   */
  toDot(parsedData) {
    const { direction, nodeLabels } = parsedData;
    const rankdir = (direction === "TD" || direction === "TB") ? "TB" : 
                    (direction === "LR" || direction === "RL") ? "LR" : "TB";

    let dotCode = ['digraph G {'];
    dotCode.push(`  rankdir="${rankdir}";`);
    dotCode.push('  node [shape=box, style=filled, fillcolor=lightblue];');
    dotCode.push('  edge [];');

    // 添加节点
    for (const [nodeId, label] of Object.entries(nodeLabels)) {
      const escapedLabel = label.replace(/"/g, '\\"');
      dotCode.push(`  ${nodeId} [label="${escapedLabel}"];`);
    }

    // 添加连接
    for (const conn of parsedData.connections) {
      const { source, target, label } = conn;
      if (label) {
        const escapedLabel = label.replace(/"/g, '\\"');
        dotCode.push(`  ${source} -> ${target} [label="${escapedLabel}"];`);
      } else {
        dotCode.push(`  ${source} -> ${target};`);
      }
    }

    dotCode.push('}');
    return dotCode.join('\n');
  }

  /**
   * 将Mermaid代码转换为SVG格式（通过第三方服务）
   * @param {String} mermaidCode Mermaid流程图代码
   * @returns {Promise<String>} SVG代码
   */
  async toSvg(mermaidCode) {
    try {
      // 在Web应用中，可以使用mermaid.js库在前端渲染
      // 在后端，这里只是一个占位方法
      // 实际实现可能需要调用外部服务或使用Node.js的SVG生成库
      return `<svg><text>转换SVG功能需要在前端实现</text></svg>`;
    } catch (error) {
      console.error(`转换SVG失败: ${error.message}`);
      throw new Error(`转换SVG失败: ${error.message}`);
    }
  }
}

module.exports = MermaidParser;