/**
 * 通知系统工具
 * 提供创建通知的功能，支持成功、错误、警告和信息四种类型
 */

// 在DOM中创建通知容器（如果不存在）
const createNotificationContainer = () => {
  let container = document.getElementById('notification-container');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.maxWidth = '350px';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  
  return container;
};

// 创建通知函数
export const createNotification = (options) => {
  // 默认配置
  const defaults = {
    type: 'info',
    title: '',
    text: '',
    duration: 3000
  };
  
  // 合并配置
  const config = { ...defaults, ...options };
  
  // 创建通知容器
  const container = createNotificationContainer();
  
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.style.backgroundColor = 'white';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.15)';
  notification.style.padding = '15px';
  notification.style.marginBottom = '10px';
  notification.style.transition = 'all 0.3s ease';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-20px)';
  
  // 设置不同类型的通知样式
  switch (config.type) {
    case 'success':
      notification.style.borderLeft = '4px solid #4caf50';
      break;
    case 'error':
      notification.style.borderLeft = '4px solid #f44336';
      break;
    case 'warning':
      notification.style.borderLeft = '4px solid #ff9800';
      break;
    default:
      notification.style.borderLeft = '4px solid #2196f3';
  }
  
  // 创建通知内容
  const content = document.createElement('div');
  
  // 添加标题（如果存在）
  if (config.title) {
    const title = document.createElement('div');
    title.className = 'notification-title';
    title.textContent = config.title;
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    content.appendChild(title);
  }
  
  // 添加文本内容
  const text = document.createElement('div');
  text.className = 'notification-text';
  text.textContent = config.text;
  content.appendChild(text);
  
  // 添加关闭按钮
  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '18px';
  closeButton.style.color = '#999';
  
  // 关闭按钮点击事件
  closeButton.addEventListener('click', () => {
    removeNotification();
  });
  
  // 添加到通知元素
  notification.style.position = 'relative';
  notification.appendChild(closeButton);
  notification.appendChild(content);
  
  // 添加到容器
  container.appendChild(notification);
  
  // 显示通知（通过延迟使动画生效）
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // 移除通知函数
  const removeNotification = () => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    
    // 等待动画结束后移除元素
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  };
  
  // 设置自动关闭
  if (config.duration > 0) {
    setTimeout(removeNotification, config.duration);
  }
  
  // 返回一个对象，允许手动控制通知
  return {
    close: removeNotification
  };
};

// 提供便捷方法
export const notify = {
  info: (text, title = '', duration = 3000) => {
    return createNotification({ type: 'info', title, text, duration });
  },
  success: (text, title = '', duration = 3000) => {
    return createNotification({ type: 'success', title, text, duration });
  },
  error: (text, title = '', duration = 3000) => {
    return createNotification({ type: 'error', title, text, duration });
  },
  warning: (text, title = '', duration = 3000) => {
    return createNotification({ type: 'warning', title, text, duration });
  }
};

export default createNotification;