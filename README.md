# n8n-nodes-silubridge

Silubridge 的 n8n 社区节点第一版骨架。

## 第一版目标

- 凭证配置
  - `Base URL`
  - `API Token`
- 动态模型下拉
  - 通过 `GET /v1/models`
- 两个基础操作
  - `List Models`
  - `Chat Completion`

## 适用接口

Silubridge 当前对外是 OpenAI 兼容接口：

- `GET /v1/models`
- `POST /v1/chat/completions`

## 安装思路

后续可作为本地社区节点包使用：

1. 在本目录执行 `npm install`
2. 执行 `npm run build`
3. 将打包结果链接或复制到 n8n 的自定义节点目录

## 还建议补的版本

- Embeddings
- Responses API
- Images
- 更友好的错误提示
- 模型别名和模型分组
