/**
 * 文件上传路由
 * 处理图片上传请求
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const uploadController = require('../controllers/upload.controller');

const router = express.Router();

// 配置本地存储
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function(req, file, cb) {
    // 生成唯一文件名：时间戳-随机数.扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件过滤器（只允许图片）
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型！只允许 JPG, PNG, GIF 和 WEBP 格式'), false);
  }
};

// 配置上传中间件
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制10MB
  }
});

// POST /api/upload - 上传单个图片
router.post('/', upload.single('image'), uploadController.uploadImage);

module.exports = router;
