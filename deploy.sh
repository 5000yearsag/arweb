#!/bin/bash

# 前端部署脚本
# 使用方法：./deploy.sh

set -e

echo "🚀 开始前端部署流程..."

# 检查dist.zip是否存在
if [ ! -f "dist.zip" ]; then
    echo "❌ dist.zip 文件不存在，需要先构建"
    echo "正在构建..."
    
    # 检查Node版本
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装"
        exit 1
    fi
    
    # 切换到Node 18（macOS Homebrew）
    if [ -d "/opt/homebrew/opt/node@18/bin" ]; then
        export PATH="/opt/homebrew/opt/node@18/bin:$PATH"
        echo "✅ 切换到Node 18: $(node --version)"
    fi
    
    # 安装依赖和构建
    npm install --legacy-peer-deps
    npm run build
fi

echo "✅ dist.zip 文件准备就绪 ($(ls -lh dist.zip | awk '{print $5}'))"

# 尝试SSH连接和部署
echo "📡 尝试连接服务器..."

# 方式1: 使用配置的别名
if ssh -o ConnectTimeout=5 -o BatchMode=yes ali_lanyu "echo 'SSH连接成功'" 2>/dev/null; then
    echo "✅ 使用 ali_lanyu 连接成功"
    SSH_HOST="ali_lanyu"
elif ssh -o ConnectTimeout=5 -o BatchMode=yes root@123.57.231.35 "echo 'SSH连接成功'" 2>/dev/null; then
    echo "✅ 使用 root@123.57.231.35 连接成功"
    SSH_HOST="root@123.57.231.35"
else
    echo "❌ SSH连接失败"
    echo "请检查："
    echo "1. ~/.ssh/config 中的 ali_lanyu 配置"
    echo "2. SSH密钥是否正确"
    echo "3. 服务器防火墙设置"
    echo "4. 用户名是否正确（可能是 ubuntu、centos 等）"
    echo ""
    echo "💡 您可以手动执行以下命令："
    echo "scp dist.zip [用户名]@123.57.231.35:/tmp/"
    echo "ssh [用户名]@123.57.231.35"
    echo "cd /tmp && unzip -o dist.zip"
    echo "# 然后移动到web目录，如：mv dist/* /var/www/html/"
    exit 1
fi

# 执行部署
echo "📤 上传文件到服务器..."
scp dist.zip $SSH_HOST:/tmp/

echo "🔧 在服务器上解压和部署..."
ssh $SSH_HOST << 'EOF'
cd /tmp
echo "解压文件..."
unzip -o dist.zip

# 检测Web服务器配置
if [ -d "/var/www/html" ]; then
    WEB_DIR="/var/www/html"
    echo "检测到Apache配置，使用 /var/www/html"
elif [ -d "/usr/share/nginx/html" ]; then
    WEB_DIR="/usr/share/nginx/html"
    echo "检测到Nginx配置，使用 /usr/share/nginx/html"
else
    echo "⚠️  未检测到标准Web目录，请手动移动文件"
    echo "当前解压的文件位于: /tmp/dist/"
    ls -la /tmp/dist/
    exit 0
fi

echo "📁 部署到 $WEB_DIR"
# 备份现有文件
if [ -d "$WEB_DIR" ]; then
    cp -r $WEB_DIR $WEB_DIR.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ 已备份现有文件"
fi

# 部署新文件
cp -r dist/* $WEB_DIR/
echo "✅ 文件部署完成"

# 清理临时文件
rm -rf /tmp/dist /tmp/dist.zip
echo "🧹 清理临时文件完成"
EOF

echo "🎉 部署完成！"
echo "🌐 访问地址：https://app.lanyuxr.com/"