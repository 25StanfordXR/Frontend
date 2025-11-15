# ⚠️ 重要说明

## 浏览器扩展导致的 431 错误

### 问题
如果您在浏览器控制台看到：
```
Server responded with status code 431 (Request Header Fields Too Large)
```

### 原因
这是由浏览器扩展（如 1Password、LastPass、广告拦截器等）添加的大量 HTTP 请求头导致的。

### 解决方案（推荐顺序）

#### ✅ 方案 1：使用隐身/无痕模式（最简单）
1. **Chrome/Edge**: 按 `Ctrl+Shift+N` (Windows) 或 `Cmd+Shift+N` (Mac)
2. **Firefox**: 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
3. **Safari**: 按 `Cmd+Shift+N`
4. 在无痕窗口中访问 `http://localhost:3000`

这将禁用大多数扩展，避免 431 错误。

#### ✅ 方案 2：临时禁用扩展
1. 打开浏览器扩展管理页面
   - Chrome: `chrome://extensions`
   - Firefox: `about:addons`
   - Safari: Safari → 偏好设置 → 扩展
2. 临时禁用所有扩展
3. 刷新页面

#### ✅ 方案 3：使用其他浏览器
如果您主要使用的浏览器有很多扩展，可以临时使用另一个干净的浏览器。

## Spark.js / WebAssembly 说明

### 关于 WASM 警告

您可能在控制台看到类似的警告：
```
WebAssembly.instantiateStreaming failed because your server does not serve
Wasm with application/wasm MIME type
```

**这是正常的！**

- Spark.js 会自动回退到较慢的 WASM 加载方式
- 不会影响应用功能
- SPZ 文件仍然可以正常加载和显示

### SPZ 文件加载

由于 SPZ 文件通常很大（50MB - 500MB+），加载可能需要一些时间：
- **本地文件**: 加载速度取决于文件大小
- **远程 URL**: 加载速度取决于网络连接和文件大小

**请耐心等待加载进度条！**

## 测试应用

### 没有 SPZ 文件？

如果您没有 SPZ 文件进行测试：

1. **在线搜索示例**
   - 搜索 "gaussian splatting demo" 或 "3d gaussian splatting examples"
   - 找到公开的 SPZ 文件 URL

2. **生成自己的 SPZ 文件**
   - 使用 3D Gaussian Splatting 训练工具
   - 从 NeRF 模型转换
   - 使用 Luma AI 等在线工具

3. **测试 URL**
   - 确保 URL 直接指向 `.spz` 文件
   - 检查 CORS 设置（文件服务器需要允许跨域访问）

## 开发环境

### 推荐配置

为了获得最佳开发体验：

1. **使用隐身模式开发**
   - 避免扩展干扰
   - 更快的开发速度
   - 更少的控制台噪音

2. **浏览器开发者工具**
   - 打开 Network 标签查看文件加载进度
   - 打开 Console 查看错误和警告
   - 使用 Performance 标签监控性能

3. **WebGL 检查**
   - 访问 https://get.webgl.org/ 确认 WebGL 2.0 支持
   - 确保硬件加速已启用

## 常见问题速查

| 问题 | 解决方案 |
|------|----------|
| 431 错误 | 使用隐身模式 |
| WASM 警告 | 忽略，不影响功能 |
| 加载慢 | 正常，SPZ 文件很大 |
| 空白场景 | 等待文件加载完成 |
| 无法旋转 | 检查鼠标控制说明 |

## 快速开始（避免问题）

```bash
# 1. 启动开发服务器
npm run dev

# 2. 打开隐身窗口
# Chrome/Edge: Ctrl+Shift+N (Win) / Cmd+Shift+N (Mac)
# Firefox: Ctrl+Shift+P (Win) / Cmd+Shift+P (Mac)

# 3. 访问
http://localhost:3000

# 4. 上传或输入 SPZ 文件 URL

# 5. 等待加载完成
```

## 生产环境部署

部署到生产环境时：

1. **构建应用**
   ```bash
   npm run build
   ```

2. **服务器配置**
   - 确保服务器支持大文件上传（如果需要）
   - 配置正确的 MIME 类型
   - 启用 GZIP 压缩

3. **CORS 设置**
   - 如果加载远程 SPZ 文件，确保配置 CORS

## 性能提示

- **文件大小**: 较小的 SPZ 文件（< 100MB）加载更快
- **网络**: 使用本地文件比远程 URL 更快
- **浏览器**: 最新版本的 Chrome 性能最好
- **硬件**: 需要支持 WebGL 2.0 的显卡

## 获取帮助

如果问题持续存在：

1. 检查 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. 确保使用隐身模式
3. 查看浏览器控制台的详细错误信息
4. 在 GitHub 仓库提交 issue

---

**记住**: 大多数问题都可以通过使用**隐身/无痕模式**解决！
