/**
 * 多边形重叠检测（纯 JS，零依赖）
 *
 * 判断两个多边形（顶点数组 [[x,y],...]）是否重叠，涵盖三种情况：
 *   1) 边相交        2) 一个多边形完全包含另一个（边不相交但确实重叠）  3) 顶点落在对方内部
 *
 * 浏览器：<script src="polygon-overlap.js"></script> 后 window.PolygonOverlap
 * Node  ：const { polygonsOverlap } = require('./polygon-overlap.js')
 *
 * 坐标：只要两个多边形用同一套坐标（都是 [lng,lat] 或都是 [x,y]），就能判；
 *      别一个 [lng,lat] 一个 [x,y]。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PolygonOverlap = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  /** 已知共线时，q 是否落在线段 pr 上 */
  function onSegment(p, q, r) {
    return q[0] <= Math.max(p[0], r[0]) && q[0] >= Math.min(p[0], r[0]) &&
      q[1] <= Math.max(p[1], r[1]) && q[1] >= Math.min(p[1], r[1]);
  }

  /** 三点方向：0 共线 / 1 顺时针 / 2 逆时针 */
  function orientation(p, q, r) {
    const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (val === 0) return 0;
    return val > 0 ? 1 : 2;
  }

  /** 线段 p1q1 与 p2q2 是否相交（含共线重叠） */
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

  /** 点是否在多边形内（射线法 / even-odd） */
  function pointInPoly(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      if (((yi > point[1]) !== (yj > point[1])) &&
        (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  /** 两个多边形是否重叠 */
  function polygonsOverlap(polyA, polyB) {
    if (polyA.length < 3 || polyB.length < 3) return false;
    // 边相交
    for (let i = 0; i < polyA.length; i++) {
      const a1 = polyA[i], a2 = polyA[(i + 1) % polyA.length];
      for (let j = 0; j < polyB.length; j++) {
        const b1 = polyB[j], b2 = polyB[(j + 1) % polyB.length];
        if (segmentsIntersect(a1, a2, b1, b2)) return true;
      }
    }
    // 完全包含（边不相交，但一个在另一个里面）
    if (pointInPoly(polyA[0], polyB)) return true;
    if (pointInPoly(polyB[0], polyA)) return true;
    return false;
  }

  /** 新多边形与一组已有多边形中哪些重叠，返回索引数组 */
  function findOverlaps(poly, others) {
    const hit = [];
    for (let i = 0; i < others.length; i++) if (polygonsOverlap(poly, others[i])) hit.push(i);
    return hit;
  }

  return { onSegment, orientation, segmentsIntersect, pointInPoly, polygonsOverlap, findOverlaps };
});
