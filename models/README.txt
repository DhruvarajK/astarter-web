MiniPC.glb — 仅 ABOX 区 Three.js 展示用（与官网同款模型）。
「Become a Network Operator」左侧地球为官网 Spline 场景（rebuild/index.html 内 <spline-viewer>），不是 glb。

该文件使用 Draco 压缩网格（KHR_draco_mesh_compression）与 WebP 贴图（EXT_texture_webp），
页面需加载 DRACOLoader.js 并配置解码器路径（rebuild/index.html 已接好，见 jsDelivr）。

已随仓库放入一份；若需更新可用浏览器下载（另存为）：
  https://astarter.io/rebuild/models/MiniPC.glb
  注意：该地址未对第三方网站开放 CORS，页面不能跨域用 JS 去拉取，必须把文件放到你自己服务器上。

部署时请保持路径：rebuild/models/MiniPC.glb（与 index.html 同级下的 models/）。

若服务器返回 404 或把 SPA 的 index.html 当成二进制返回，Three.js 会加载失败；
此时 ABOX 画布在模型加载前保持纯黑底，控制台会有警告。
