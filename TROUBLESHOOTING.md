# 故障排除指南

## 已知问题和解决方案

### 1. WebAssembly 加载问题

#### 问题描述
```
WebAssembly.instantiateStreaming failed because your server does not serve Wasm with application/wasm MIME type
```

#### 原因
Spark.js 使用 WebAssembly (WASM) 来实现高性能的 Gaussian Splatting 渲染。Vite 需要正确配置来服务 WASM 文件。

#### 解决方案
已在 `vite.config.ts` 中添加：
```typescript
export default defineConfig({
  optimizeDeps: {
    exclude: ['@sparkjsdev/spark']  // 排除 Spark.js 的预构建优化
  },
  assetsInclude: ['**/*.wasm'],      // 包含 WASM 文件作为资源
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})
```

### 2. 431 Request Header Fields Too Large

#### 问题描述
```
Server responded with status code 431
```

#### 原因
浏览器扩展（如密码管理器、广告拦截器）可能会添加大量请求头，超过服务器限制。

#### 解决方案

**选项 1：禁用浏览器扩展**
1. 在隐身/无痕模式下打开应用
2. 或临时禁用浏览器扩展

**选项 2：增加 Vite 服务器限制**
如果需要，可以在 `vite.config.ts` 中添加：
```typescript
server: {
  middlewareMode: false,
  // 其他配置...
}
```

**选项 3：使用不同的浏览器**
尝试使用另一个浏览器或配置较少的浏览器配置文件。

### 3. SPZ 文件加载失败

#### 问题描述
SPZ 文件无法加载或显示空白场景

#### 可能原因和解决方案

**1. 文件格式不正确**
- 确保文件是有效的 `.spz` 格式
- 验证文件没有损坏

**2. CORS 问题（URL 加载）**
如果从 URL 加载文件：
- 确保目标服务器允许 CORS
- 检查文件 URL 是否可访问
- 尝试使用支持 CORS 的文件托管服务

**3. 文件太大**
- SPZ 文件可能很大（几十到几百 MB）
- 等待更长时间让文件加载
- 检查浏览器控制台的网络选项卡查看下载进度

**4. WebGL 不支持**
- 确保浏览器支持 WebGL 2.0
- 访问 https://get.webgl.org/ 测试 WebGL 支持
- 更新显卡驱动程序

### 4. 性能问题

#### 问题描述
3D 场景卡顿或帧率低

#### 解决方案

**1. 降低质量设置**
- 使用较小的 SPZ 文件
- 关闭其他浏览器标签页

**2. 硬件加速**
确保浏览器启用了硬件加速：
- Chrome: `chrome://settings/` → 系统 → 使用硬件加速
- Firefox: `about:preferences` → 性能 → 使用推荐的性能设置

**3. 内存问题**
- 大型 SPZ 文件可能占用大量内存
- 监控浏览器内存使用情况
- 重新加载页面释放内存

### 5. 开发服务器问题

#### 问题描述
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

#### 解决方案
开发服务器已停止，重新启动：
```bash
npm run dev
```

### 6. TypeScript 类型错误

#### 问题描述
Spark.js 类型定义可能不完整

#### 解决方案
代码中已添加 `@ts-ignore` 注释来跳过某些类型检查：
```typescript
// @ts-ignore - Spark.js types may not be complete
import { SplatMesh } from '@sparkjsdev/spark';
```

这不会影响运行时行为，只是告诉 TypeScript 忽略某些类型警告。

## 调试技巧

### 1. 检查浏览器控制台
打开开发者工具 (F12) 查看：
- 错误消息
- 网络请求状态
- WebGL 支持信息

### 2. 网络选项卡
在开发者工具的网络选项卡中：
- 查看 SPZ 文件下载进度
- 检查 WASM 文件是否成功加载
- 验证 HTTP 状态码

### 3. 性能监控
在开发者工具的性能选项卡中：
- 监控帧率 (FPS)
- 检查内存使用
- 识别性能瓶颈

### 4. WebGL Inspector
使用 WebGL 检查器扩展来调试 3D 渲染问题。

## 获取帮助

如果问题仍然存在：

1. **检查 Spark.js 文档**
   https://sparkjs.dev/docs/

2. **Three.js 文档**
   https://threejs.org/docs/

3. **GitHub Issues**
   在项目仓库中创建 issue，提供：
   - 浏览器和版本
   - 操作系统
   - 错误消息截图
   - 控制台日志

4. **测试环境**
   - 浏览器: Chrome 120+, Firefox 120+, Safari 17+
   - WebGL: 2.0 支持
   - 内存: 至少 4GB RAM 推荐

## 常见问题 FAQ

### Q: 为什么 SPZ 文件加载这么慢？
A: SPZ 文件可能很大（50-500MB），需要时间下载和解析。这是正常的。

### Q: 支持哪些浏览器？
A: Chrome 90+, Firefox 88+, Safari 14+。需要 WebGL 2.0 支持。

### Q: 可以同时加载多个 SPZ 文件吗？
A: 当前版本一次只支持一个文件。多文件支持在未来版本计划中。

### Q: 为什么某些 SPZ 文件无法加载？
A: 确保文件格式正确且与 Spark.js v0.1.10 兼容。

### Q: 如何获取测试用的 SPZ 文件？
A: 可以从 3D Gaussian Splatting 训练工具生成，或在线搜索示例文件。

## 更新日志

### v0.0.1 (2025-11-14)
- ✅ 初始版本发布
- ✅ 基本 SPZ 文件查看功能
- ✅ URL 和本地文件加载
- ✅ 3D 交互控制
- ⚠️ 已知 WebAssembly MIME 类型警告（不影响功能）
- ⚠️ 已知 431 错误（由浏览器扩展引起）
