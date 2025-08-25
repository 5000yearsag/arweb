# 前端部署说明

## 已完成的修改
1. ✅ 隐藏了合集模板选择器的UI组件（使用注释包围）
2. ✅ 注释了合集模板相关的业务逻辑：
   - 注释了 `loadAllTemplateList()` 调用
   - 将 `templateId` 设置为空字符串
   - 不再从服务器加载模板ID

## 部署文件准备
- 构建文件：`dist.zip` (996KB)
- 位置：`/home/alarm/Codebase/arwechat/arweb/dist.zip`

## 部署步骤

### 方式一：手动SSH部署
1. 确保SSH配置正确：
```bash
# 添加到 ~/.ssh/config
Host ali_lanyu
    HostName 123.57.231.35
    User [用户名]  # 可能是 root, ubuntu, 或其他
    IdentityFile ~/.ssh/[密钥文件]
    Port 22
```

2. 上传文件：
```bash
scp /home/alarm/Codebase/arwechat/arweb/dist.zip ali_lanyu:/tmp/
```

3. 在服务器上解压和部署：
```bash
ssh ali_lanyu
cd /tmp
unzip -o dist.zip
# 根据服务器配置，移动到对应的web目录
# 例如：mv dist/* /var/www/html/
# 或：mv dist/* /usr/share/nginx/html/
```

### 方式二：重新构建（如需要）
如果需要重新构建：
```bash
cd /home/alarm/Codebase/arwechat/arweb
export PATH="/opt/homebrew/opt/node@18/bin:$PATH"  # 切换到Node 18
npm install --legacy-peer-deps
npm run build
```

## 注意事项
- 当前dist.zip是之前的构建文件，包含了最新的隐藏合集模板的修改
- SSH连接失败可能需要检查：
  - 服务器防火墙设置
  - SSH密钥配置
  - 正确的用户名
  - SSH端口（可能不是22）