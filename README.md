# Prompt Manager Chrome Extension

一个用于管理AI提示词的Chrome扩展，支持LangGPT模板。

## 功能特性

- 提示词管理（增删改查）
- LangGPT模板支持
- 分类管理
- 搜索过滤
- 导入导出功能
- 一键复制

## 安装步骤

1. 下载并解压缩文件
2. 打开Chrome浏览器
3. 进入扩展管理页面：chrome://extensions/
4. 开启"开发者模式"（右上角开关）
5. 点击"加载已解压的扩展程序"
6. 选择解压后的文件夹

## 使用说明

1. 点击Chrome工具栏中的扩展图标
2. 在弹出窗口中可以：
   - 管理提示词
   - 创建新模板
   - 导入导出模板
   - 复制提示词

## 开发说明

项目结构：
- manifest.json: 扩展配置文件
- popup.html/js/css: 弹出窗口相关文件
- template.html/js/css: 模板编辑器相关文件
- images/: 图标文件