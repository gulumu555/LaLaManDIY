function generateImage(id, options) {
  const { callback, scale = 10 } = options || {};
  html2canvas(document.querySelector(id), {
    backgroundColor: null,
    scale, // 或更大
  }).then((canvas) => {
    const base64 = canvas.toDataURL("image/png");
    const message = { base64Image: base64 };
    uni.postMessage({
      data: message,
    });
    setTimeout(() => {
      callback?.(base64);
    }, 2000);
  });
}

function getUrlParams(name) {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return params.get(name);
}


function getWeek(dateStr) {
  const date = new Date(dateStr);
  const weeks = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  return weeks[date.getDay()];
}