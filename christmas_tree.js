// ================== 全局参数 ==================
let WIDTH = window.innerWidth;          // 窗口宽度
let HEIGHT = window.innerHeight;        // 窗口高度
const BLACK = [0, 0, 0];                // 黑色数组 [r, g, b]

// 粒子数量配置
const TREE_POINTS = 50000;              // 圣诞树粒子数量（越多越"毛茸茸"）
const GROUND_POINTS = 4000;              // 地面粒子数量
const STAR_POINTS = 1200;               // 空中小亮点粒子数量
const HEART_POINTS = 1000;               // 树顶爱心粒子数量
const SNOW2D_POINTS = 10;                // 前景大雪花数量

// 相机参数 - 俯视视角
const CAM_DIST = 13;                    // 相机离原点的前后距离
const CAM_HEIGHT = 6.0;                 // 相机高度
const PITCH = -0.25;                    // 俯仰角（负角度表示俯视）

const TREE_HEIGHT = 12.0;               // 圣诞树高度

// ================== 数学工具函数 ==================
// 生成指定范围的随机浮点数
function random(min, max) {
    if (max === undefined) {            // 如果只提供一个参数，默认从0开始
        max = min;
        min = 0;
    }
    return Math.random() * (max - min) + min;  // 生成[min, max)范围的随机数
}

// 生成指定范围的随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;  // 生成[min, max]范围的随机整数
}

// 生成符合高斯分布的随机数
function gauss(mean, stddev) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random();   // 避免u为0
    while(v === 0) v = Math.random();   // 避免v为0
    // 应用Box-Muller变换生成高斯分布随机数
    let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stddev + mean;           // 调整到指定均值和标准差
}

// ================== 生成圣诞树粒子 ==================
function genTreePoints() {
    const pts = [];                      // 存储树粒子的数组
    const loops = 9;                     // 螺旋的圈数
    const spiralN = Math.floor(TREE_POINTS * 0.7);   // 70%的粒子用于螺旋灯带

    // 生成螺旋灯带粒子（70%的粒子）
    for (let i = 0; i < spiralN; i++) {
        const u = Math.random();          // 螺旋参数 [0,1]
        const h = Math.pow(u, 1.6);       // 高度分布（底部密集，顶部稀疏）
        const y = TREE_HEIGHT * h + 0.2;  // 粒子的y坐标（高度）

        // 计算基础半径（树从底部到顶部逐渐变细）
        let baseR = Math.pow(1 - h, 1.1) * 3.2;
        // 使用正弦函数创建树枝层次效果
        const branchWave = Math.max(0.0, Math.sin((h * 5.8 + 0.15) * 2 * Math.PI));
        const branchFactor = 1.0 + 0.65 * branchWave;  // 树枝膨胀因子
        baseR *= branchFactor;            // 应用树枝层次效果

        const t = u * loops * 2 * Math.PI;  // 螺旋角度
        const angle = t + random(-0.22, 0.22);  // 添加随机扰动
        const r = baseR * random(0.85, 1.08);   // 半径的随机变化

        // 计算3D坐标
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;

        // 树的中段更亮
        const midBoost = 1.0 - Math.abs(h - 0.55) * 1.5;
        const midBoostClamped = Math.max(0.15, midBoost);  // 确保亮度不低于最小值
        const baseG = 155 + Math.floor(90 * midBoostClamped);
        const baseB = 185 + Math.floor(70 * midBoostClamped);

        // 设置粒子颜色
        const color = [
            255,                          // 红色通道固定为255
            Math.min(255, baseG + randomInt(-15, 20)),  // 绿色通道随机变化
            Math.min(255, baseB + randomInt(-15, 35))   // 蓝色通道随机变化
        ];
        // 8%的概率生成更亮的粒子，作为点缀
        if (Math.random() < 0.08) {
            color[0] = 255;
            color[1] = Math.min(255, color[1] + 20);
            color[2] = Math.min(255, color[2] + 30);
        }

        pts.push([x, y, z, color]);       // 将粒子添加到数组
    }

    // 生成随机填充粒子（30%的粒子）
    const fillN = TREE_POINTS - spiralN;  // 填充粒子数量
    for (let i = 0; i < fillN; i++) {
        const h = Math.pow(Math.random(), 1.9);  // 更偏向底部的高度分布
        const y = TREE_HEIGHT * h + 0.2 + random(-0.08, 0.08);  // 高度随机抖动

        // 计算基础半径
        let baseR = Math.pow(1 - h, 1.1) * 4.3;
        // 应用树枝层次效果
        const branchWave = Math.max(0.0, Math.sin((h * 5.8 + 0.15) * 2 * Math.PI));
        const branchFactor = 1.0 + 0.65 * branchWave;
        baseR *= branchFactor;

        // 半径更偏向外圈，营造蓬松效果
        const r = baseR * Math.sqrt(Math.random());
        const angle = Math.random() * 2 * Math.PI;

        // 计算3D坐标并添加随机抖动
        const x = Math.cos(angle) * r + random(-0.08, 0.08);
        const z = Math.sin(angle) * r + random(-0.08, 0.08);

        // 设置粒子颜色
        const g = randomInt(165, 225);
        const b = randomInt(190, 250);
        const color = [255, g, b];
        pts.push([x, y, z, color]);
    }

    return pts;                           // 返回所有树粒子
}

// ================== 生成地面光环粒子 ==================
function genGroundPoints() {
    const pts = [];                      // 存储地面粒子的数组
    const rings = [4.6, 6.0, 7.4, 8.8, 10.2, 11.4];  // 光环半径列表
    
    for (let i = 0; i < GROUND_POINTS; i++) {
        // 随机选择一个光环
        const ring = rings[Math.floor(Math.random() * rings.length)];
        // 生成符合高斯分布的半径，使粒子集中在光环附近
        const r = gauss(ring, 0.3);
        const theta = Math.random() * 2 * Math.PI;  // 随机角度
        
        // 计算3D坐标
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        const y = -0.25;                  // 固定在地面高度

        // 设置粒子颜色（蓝色调）
        let c;
        if (Math.random() < 0.15) {       // 15%的概率生成更亮的粒子
            c = randomInt(235, 255);
        } else {
            c = randomInt(190, 235);      // 普通亮度粒子
        }
        const color = [c, c, 255];        // 白色偏蓝
        pts.push([x, y, z, color]);
    }
    return pts;                           // 返回所有地面粒子
}

// ================== 生成空中3D小亮点粒子 ==================
function genStarPoints() {
    const pts = [];                      // 存储星星粒子的数组
    
    for (let i = 0; i < STAR_POINTS; i++) {
        // 生成随机3D坐标（分布在树的周围）
        const x = random(-18.0, 18.0);
        const z = random(-18.0, 18.0);
        const y = random(3.0, 18.0);     // 高度在树的上方
        
        // 设置粒子颜色（白色偏蓝）
        const base = randomInt(215, 255);
        const color = [base, base, 255];
        pts.push([x, y, z, color]);
    }
    return pts;                           // 返回所有星星粒子
}

// ================== 生成树顶3D爱心粒子 ==================
function genHeartPoints() {
    /*
    使用2D心形隐式方程：
        (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
    在平面上采样点，再加一点z轴抖动，放在树顶上方。
    */
    const pts = [];                      // 存储爱心粒子的数组
    const scale = 0.9;                   // 爱心缩放比例
    const topY = TREE_HEIGHT + 0.05;     // 爱心顶部位置（树顶附近）

    // 生成指定数量的爱心粒子
    while (pts.length < HEART_POINTS) {
        // 在2D平面上随机采样点
        const x = random(-1.3, 1.3);
        const y = random(-1.4, 1.4);

        // 计算心形隐式方程值
        const f = Math.pow(x * x + y * y - 1.0, 3) - x * x * Math.pow(y, 3);

        // 如果点在心形内部
        if (f <= 0.0) {
            // 转换为3D坐标
            const wx = x * scale * 0.8;   // x轴缩放
            const wy = topY + (y + 1.0) * scale * 0.5;  // y轴缩放并定位到树顶
            const wz = random(-0.18, 0.18);  // z轴随机抖动，增加3D效果

            // 根据距离中心的距离调整颜色亮度
            const dist = Math.hypot(x, y);
            const factor = Math.max(0.35, 1.15 - 0.5 * dist);
            const r = 255;
            const g = Math.floor(130 * factor + 80);
            const b = Math.floor(190 * factor + 70);
            // 确保颜色值在有效范围内
            const clampedG = Math.max(120, Math.min(255, g));
            const clampedB = Math.max(120, Math.min(255, b));

            pts.push([wx, wy, wz, [r, clampedG, clampedB]]);
        }
    }

    return pts;                           // 返回所有爱心粒子
}

// ================== 初始化前景2D大雪花 ==================
function initSnow2d() {
    const flakes = [];                   // 存储雪花的数组
    
    for (let i = 0; i < SNOW2D_POINTS; i++) {
        // 初始化雪花属性：x坐标、y坐标、半径、速度、剩余生命值、最大生命值
        const x = random(0, WIDTH);
        const y = random(-80, -10);      // 从屏幕上方开始
        const radius = random(10.0, 16.0);
        const speed = random(30.0, 45.0);
        const travel = HEIGHT + 80 - y;  // 雪花需要移动的总距离
        const life = travel / speed;     // 雪花的生命周期
        flakes.push([x, y, radius, speed, life, life]);
    }
    return flakes;                       // 返回所有雪花
}

// ================== 重置雪花位置 ==================
function respawnFlake(flake) {
    // 重置雪花属性
    const x = random(0, WIDTH);
    const y = random(-80, -10);
    const radius = random(10.0, 16.0);
    const speed = random(30.0, 45.0);
    const travel = HEIGHT + 80 - y;
    const life = travel / speed;
    
    // 更新雪花数组中的值
    flake[0] = x;                        // x坐标
    flake[1] = y;                        // y坐标
    flake[2] = radius;                   // 半径
    flake[3] = speed;                    // 速度
    flake[4] = life;                     // 剩余生命值
    flake[5] = life;                     // 最大生命值
}

// ================== 更新雪花位置 ==================
function updateSnow2d(flakes, dt) {
    for (let i = 0; i < flakes.length; i++) {
        const flake = flakes[i];
        flake[1] += flake[3] * dt;       // 更新y坐标（下落）
        flake[4] -= dt;                  // 减少剩余生命值
        
        // 如果雪花生命周期结束或超出屏幕底部，重置雪花
        if (flake[4] <= 0 || flake[1] > HEIGHT + 50) {
            respawnFlake(flake);
        }
    }
}

// ================== 绘制雪花 ==================
function drawSnow2d(ctx, flakes) {
    for (let i = 0; i < flakes.length; i++) {
        const [x, y, r, v, life, maxLife] = flakes[i];
        if (maxLife <= 0) continue;      // 跳过无效雪花

        // 计算雪花的生命周期阶段和透明度
        const phase = life / maxLife;
        const alpha = phase > 0.3 ? 255 : Math.floor(255 * (phase / 0.3));

        // 计算雪花中心坐标
        const cx = Math.floor(x);
        const cy = Math.floor(y);

        // 计算多层雪花的半径（营造光晕效果）
        const r1 = Math.max(1, Math.floor(r * 1.3));
        const r2 = Math.max(1, Math.floor(r * 1.0));
        const r3 = Math.max(1, Math.floor(r * 0.75));
        const r4 = Math.max(1, Math.floor(r * 0.55));
        const r5 = Math.max(1, Math.floor(r * 0.45));

        // 计算每层雪花的透明度
        const a1 = Math.floor(alpha / 20);
        const a2 = Math.floor(alpha / 12);
        const a3 = Math.floor(alpha / 6);
        const a4 = Math.floor(alpha / 3);
        const a5 = alpha;

        ctx.save();                       // 保存当前绘图状态
        
        // 绘制最外层光晕
        if (a1 > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${a1 / 255})`;
            ctx.beginPath();
            ctx.arc(cx, cy, r1, 0, 2 * Math.PI);
            ctx.fill();
        }
        // 绘制第二层光晕
        if (a2 > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${a2 / 255})`;
            ctx.beginPath();
            ctx.arc(cx, cy, r2, 0, 2 * Math.PI);
            ctx.fill();
        }
        // 绘制第三层光晕
        if (a3 > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${a3 / 255})`;
            ctx.beginPath();
            ctx.arc(cx, cy, r3, 0, 2 * Math.PI);
            ctx.fill();
        }
        // 绘制第四层光晕
        if (a4 > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${a4 / 255})`;
            ctx.beginPath();
            ctx.arc(cx, cy, r4, 0, 2 * Math.PI);
            ctx.fill();
        }
        // 绘制雪花核心
        ctx.fillStyle = `rgba(255, 255, 255, ${a5 / 255})`;
        ctx.beginPath();
        ctx.arc(cx, cy, r5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();                    // 恢复绘图状态
    }
}

// ================== 3D坐标到2D屏幕坐标的投影 ==================
function projectPoint(x, y, z, angle) {
    // 处理Y轴旋转（场景旋转）
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const xz = x * cosA - z * sinA;
    let zz = x * sinA + z * cosA;

    // 处理俯仰角（相机俯视）
    const cosP = Math.cos(PITCH);
    const sinP = Math.sin(PITCH);
    let yp = y * cosP - zz * sinP;
    let zp = y * sinP + zz * cosP;

    // 调整相机位置
    zp += CAM_DIST;                      // 相机距离
    yp -= CAM_HEIGHT;                    // 相机高度

    // 如果点在相机后面，不投影
    if (zp <= 0.1) {
        return null;
    }

    // 计算投影缩放因子
    const f = (HEIGHT * 0.63) / zp;
    // 计算屏幕坐标
    const sx = Math.floor(WIDTH / 2 + xz * f);
    const sy = Math.floor(HEIGHT / 2 - yp * f);
    const depth = zp;                    // 记录深度值（用于排序）
    
    return [sx, sy, depth];              // 返回屏幕坐标和深度
}

// ================== 主函数 ==================
function main() {
    const canvas = document.getElementById('canvas');  // 获取canvas元素
    const ctx = canvas.getContext('2d');  // 获取2D绘图上下文
    canvas.width = WIDTH;                 // 设置canvas宽度
    canvas.height = HEIGHT;               // 设置canvas高度

    // 生成所有粒子系统
    const tree = genTreePoints();        // 圣诞树粒子
    const ground = genGroundPoints();    // 地面粒子
    const stars = genStarPoints();       // 星星粒子
    const heart = genHeartPoints();      // 爱心粒子
    const snow2d = initSnow2d();         // 雪花粒子

    let angle = 0.0;                     // 场景旋转角度
    let lastTime = performance.now();    // 上一帧时间戳

    // 主动画循环
    function animate() {
        const currentTime = performance.now();  // 当前时间戳
        const dt = (currentTime - lastTime) / 1000.0;  // 帧间隔时间（秒）
        lastTime = currentTime;          // 更新上一帧时间

        // 清空画布
        ctx.fillStyle = 'rgb(0, 0, 0)';  // 设置填充颜色为黑色
        ctx.fillRect(0, 0, WIDTH, HEIGHT);  // 填充整个画布

        // 更新雪花位置
        updateSnow2d(snow2d, dt);

        // 收集所有3D点并投影到2D
        const drawList = [];             // 存储待绘制点的列表
        const allPoints = [...tree, ...ground, ...stars, ...heart];  // 合并所有粒子
        
        for (let i = 0; i < allPoints.length; i++) {
            const [x, y, z, color] = allPoints[i];
            const proj = projectPoint(x, y, z, angle);  // 3D到2D投影
            
            if (proj) {                  // 如果投影有效
                const [sx, sy, depth] = proj;
                // 根据深度计算粒子大小（近大远小）
                const size = Math.max(1, Math.floor(3.6 - depth * 0.13));
                drawList.push([depth, sx, sy, size, color]);  // 添加到绘制列表
            }
        }

        // 按深度排序（从后到前绘制）
        drawList.sort((a, b) => b[0] - a[0]);

        // 绘制所有3D粒子
        for (let i = 0; i < drawList.length; i++) {
            const [, sx, sy, size, color] = drawList[i];
            // 确保粒子在屏幕范围内
            if (sx >= 0 && sx < WIDTH && sy >= 0 && sy < HEIGHT) {
                ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
                ctx.beginPath();
                ctx.arc(sx, sy, size, 0, 2 * Math.PI);  // 绘制圆形粒子
                ctx.fill();
            }
        }

        // 绘制文字
        ctx.font = '45px "PingFang SC", "Microsoft YaHei", sans-serif';  // 设置字体
        ctx.fillStyle = 'rgb(255, 255, 255)';  // 设置文字颜色为白色
        ctx.fillText('Merry Christmas', 40, HEIGHT / 3);  // 绘制英文祝福语
        ctx.fillText('康雅婷', 40, HEIGHT / 3 + 60);  // 绘制中文名字

        // 绘制雪花
        drawSnow2d(ctx, snow2d);

        // 更新场景旋转角度
        angle += 0.0045;

        // 请求下一帧动画
        requestAnimationFrame(animate);
    }

    // 开始动画循环
    animate();
}

// 页面加载完成后执行主函数
window.addEventListener('load', main);

// 窗口大小改变时更新canvas尺寸
window.addEventListener('resize', () => {
    WIDTH = window.innerWidth;           // 更新窗口宽度
    HEIGHT = window.innerHeight;         // 更新窗口高度
    const canvas = document.getElementById('canvas');  // 获取canvas元素
    canvas.width = WIDTH;                // 更新canvas宽度
    canvas.height = HEIGHT;              // 更新canvas高度
});