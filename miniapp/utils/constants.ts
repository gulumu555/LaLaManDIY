export const baseConfig = {
  api_encryptor: {
    rsa_public: import.meta.env.VITE_RSA_PUBLIC_KEY,
  },
  api: {
    base_url: import.meta.env.VITE_API_BASE_URL,
  },
  env: {
    mode: import.meta.env.MODE, // 当前环境: development / production
  },
};

// 适合尺寸配置
export const suitableSizeConfig = [
  {
    id: 0,
    title: "原图下载",
    width: "-",
    height: "-",
    is_strength: 0,
  },
  // {
  //   id: 1,
  //   title: "精度增强",
  //   width: 10000,
  //   height: 12000,
  //   is_strength: 1,
  // },
  // {
  // 	id: 1,
  // 	title: "适合手机",
  // 	width: 3000,
  // 	height: 6500,
  // },
  // {
  // 	id: 2,
  // 	title: "适合平板",
  // 	width: 4096,
  // 	height: 3072,
  // },
  // {
  // 	id: 3,
  // 	title: "适合电脑",
  // 	width: 5120,
  // 	height: 2880,
  // },
  // {
  // 	id: 4,
  // 	title: "适合MacBook",
  // 	width: 3840,
  // 	height: 2496,
  // },
];
