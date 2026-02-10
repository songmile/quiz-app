const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const settingsController = require('../controllers/settingsController');

// 获取所有设置
router.get('/', asyncHandler(settingsController.getSettings));

// 更新设置
router.put('/', asyncHandler(settingsController.updateSettings));

// 更新API配置
router.put('/api/:index', asyncHandler(settingsController.updateApiConfig));

// 更新字体设置
router.put('/fonts', asyncHandler(settingsController.updateFontSettings));

// 更新导入设置
router.put('/import', asyncHandler(settingsController.updateImportSettings));

// 获取备份文件列表
router.get('/backup-files', asyncHandler(settingsController.getBackupFiles));

// 重置设置为默认值
router.post('/reset', asyncHandler(settingsController.resetSettings));

// 备份所有数据
router.post('/backup', asyncHandler(settingsController.backupData));


// 恢复备份数据
router.post('/restore', asyncHandler(settingsController.restoreData));

// 更改数据存储路径
router.put('/data-path', asyncHandler(settingsController.updateDataPath));

module.exports = router;