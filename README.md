# 多边形重叠检测算法库（纯JS，零依赖）

## 解决什么问题
用户在地图上自己画多边形地块，判断新画的和已有的有没有重叠。
- 边相交检测
- 点在多边形内检测
- 完全包含检测

## 完整代码
```javascript
// 1. 边相交判断
function onSegment(p, q, r) {
  return q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
         q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]);
}
function orientation(p, q, r) {
  const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
  if (val === 0) return 0;
  return val > 0 ? 1 : 2;
}
function segmentsIntersect(p1, q1, p2, q2) {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);
  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}

// 2. 点在多边形内（射线法）
function pointInPoly(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if (((yi > point[1]) != (yj > point[1])) && 
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi))
      inside = !inside;
  }
  return inside;
}

// 3. 两个多边形是否重叠
function polygonsOverlap(polyA, polyB) {
  // 边相交
  for (let i = 0; i < polyA.length; i++) {
    const a1 = polyA[i], a2 = polyA[(i+1) % polyA.length];
    for (let j = 0; j < polyB.length; j++) {
      const b1 = polyB[j], b2 = polyB[(j+1) % polyB.length];
      if (segmentsIntersect(a1, a2, b1, b2)) return true;
    }
  }
  // 一个点在另一个里面（完全包含）
  for (const p of polyA) if (pointInPoly(p, polyB)) return true;
  for (const p of polyB) if (pointInPoly(p, polyA)) return true;
  return false;
}

// 使用示例
const newField = [[126.47, 43.94], [126.49, 43.94], [126.49, 43.96], [126.47, 43.96]];
const existingFields = [
  [[126.46, 43.93], [126.48, 43.93], [126.48, 43.95], [126.46, 43.95]]
];

existingFields.forEach((f, i) => {
  if (polygonsOverlap(newField, f)) {
    console.log(`和田块${i+1}重叠了！`);
  }
});
```

## 性能
- 两个n顶点多边形：O(n²)
- 10个点的多边形 vs 10个点：<0.1ms
- 几百个地块实时检测完全没问题，不用Web Worker

## 踩过的坑
1. **只判边相交不够**：一个多边形完全在另一个里面，边不相交但确实重叠，必须加点在多边形内判断
2. **共线点**：边重合的时候orientation返回0，要单独判onSegment
3. **坐标顺序**：[lng, lat]还是[x, y]要统一，别搞混

## 许可证
MIT
