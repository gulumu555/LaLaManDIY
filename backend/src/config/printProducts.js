/**
 * 打印产品配置
 * 定义了所有可用的打印产品类型、尺寸和价格
 */
module.exports = {
  // 艺术微喷画报（根据用户提供的三种尺寸和价格）
  poster: [
    { id: 'poster-small', name: '小尺寸画报', size: '20x30cm', price: 29 },
    { id: 'poster-medium', name: '中尺寸画报', size: '40x60cm', price: 79 },
    { id: 'poster-large', name: '大尺寸画报', size: '60x90cm', price: 149 }
  ]
};
