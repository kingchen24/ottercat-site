FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装全部依赖（包括 devDependencies，因为需要 tsx 运行 TypeScript）
RUN npm install

# 复制源码
COPY . .

# 构建前端
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动服务
CMD ["npm", "start"]
