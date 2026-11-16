FROM node:24-slim
WORKDIR /app
COPY . .
ENV DATA_DIR=/var/data
CMD ["node","server.js"]
