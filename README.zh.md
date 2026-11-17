# dsh-bot-model-switch

[English](README.md) | 中文

[![npm](https://img.shields.io/npm/v/dsh-bot-model-switch)](https://www.npmjs.com/package/dsh-bot-model-switch)

在插件设置页用一张卡片，把 **DS Bot 团队里所有 Bot 的模型一次切到同一个**，或者 **逐个 Bot 单独设置**。

为 [DS Bot](https://github.com/Fei2411/DS-Bot) 而做——它是跑在 DeepSeek Harness 上的一队长期存活的 Bot。团队一旦超过几个 Bot，再挨个进各自设置卡改模型就不再是麻烦，而是偏差的来源：一半在旧模型、一半在新模型，谁也说不清现状。这个插件把这件事收成一个决定。

## 能做什么

- **批量模式**——选一个模型，应用到全部 Bot。范围可选「全部」或「除主 Bot 外全部」，写入前预览会点明哪些 Bot 会被跳过。
- **逐个模式**——每个 Bot 一行，显示当前模型、模型选择器和可选的思考强度。只写你真正改过的行，没动的 Bot 一律不碰。
- **先预检，不是全有或全无**——接不住目标模型的 Bot 会被点名跳过，而不是让整批中断。宿主明确拒绝的算一行结果；只有网络、5xx、读不到响应这类意外才中止整批。
- **撤销**——最近 5 次记录存在 `localStorage` 的 `dsh-model-switch.undo.v1`。撤销会逐个核对 Bot 是否仍是当次写入的值，期间被别人改过的会跳过，不覆盖。
- **真回滚**——批量中途失败时，已经改过的 Bot 按反向顺序放回原值；放不回去的会被点名列出。

## 先看这条前提

**这个插件需要 DS Bot 宿主。** 它调用 `POST api/bot`，这是 DS Bot 在 DeepSeek Harness 之上为自己的团队视图增加的端点。原生 `dsh web` 不提供该路由，卡片能加载，但每次读取都返回 `unauthorized`，模型列表是空的。

这也是宿主半边（`lib/index.js`）故意留空的原因。所有写入都走宿主自己的 `update-bot` 端点，运行中的 Bot 引擎始终是它状态文件的唯一写入者。直接写 `state.json` 的插件会和引擎抢写，代价是丢消息——本插件不这么做。

## 安装

用 DS Bot 的插件管理器添加：

```
dsh-bot-model-switch
```

或在终端里，装进 DS Bot 实际在用的 profile：

```sh
dsh plugin --profile <profile> add dsh-bot-model-switch
```

从 GitHub 源码装：

```sh
dsh plugin --profile <profile> add github:DamonKoy/dsh-bot-model-switch
```

重启一次 DS Bot，让 bundle patch 生效。卡片随后出现在插件设置页的 **批量切换模型** 一栏。

## 写入方式

每次改动就是一个 `POST api/bot` 请求：`{ endpoint: "update-bot", payload: { id, model } }`。模型列表读的是 app 自己用的同一个 `state` 端点。

- **本地 CLI 路由**（`local-*/…`）涉及模型↔CLI 换引擎的，直接跳过而不硬来：宿主要求显式 `changeEngine` 确认，而这个确认属于该 Bot 自己的设置，不该由一个批量按钮代为下发。
- 渠道**没有 API Key**（`needsKey`）的模型会从选择器里滤掉，而不是先给人选、再报错。
- **切模型时不捎带旧的思考强度**，除非你自己选。不同模型支持的档位不同，发一个目标模型没有的档位会让宿主整条 patch 抛错，连模型改动一起打掉。

## 范围与限制

- 只管**当前这台机器上这个 DS Bot 团队**里各 Bot 的模型。它不是渠道管理器、不是路由，也不负责新增或配置供应商。
- 不碰 `state.json`、不碰会话存储、不碰任何凭据。
- 除同源的 `api/bot` 外不访问网络。
- 撤销记录在浏览器里，所以是按浏览器 profile 走的，清站点数据即失效。

## 不是同一个插件

目录里另有一个他人维护的 `dsh-model-switch`。那个是在单个 Harness 会话内按角色路由模型；这个是改 **DS Bot 团队里每个 Bot 的模型**。包不同、作者不同、范围不同——按你实际在跑的东西选。

## 许可

MIT
