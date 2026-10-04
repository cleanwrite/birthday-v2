// Cloudflare Workers 反代脚本
// 部署：Cloudflare Dashboard → Workers → Create Worker → 粘贴此代码 → 保存
// 绑定域名：Triggers → Custom Domains → 添加你的域名

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // 查看愿望（需要密码）
    if (url.pathname === "/api/wishes") {
      const key = url.searchParams.get("key");
      if (key !== "fw2026") {
        return new Response("Not Found", { status: 404 });
      }
      const data = await BIRTHDAY_WISHES.get("all_wishes") || "[]";
      return new Response(data, {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // 提交愿望
    if (url.pathname === "/api/wish" && request.method === "POST") {
      try {
        const { wish, time } = await request.json();
        if (!wish) return new Response("OK", { status: 200 });
        const existing = await BIRTHDAY_WISHES.get("all_wishes") || "[]";
        const wishes = JSON.parse(existing);
        wishes.push({ wish, time: time || new Date().toISOString() });
        await BIRTHDAY_WISHES.put("all_wishes", JSON.stringify(wishes));
        return new Response("OK", {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      } catch (e) {
        return new Response("OK", { status: 200 });
      }
    }

    // 默认：反代到 GitHub Pages
    const targetUrl = "https://cleanwrite.github.io" + url.pathname;
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": request.headers.get("User-Agent") || "",
        "Accept": request.headers.get("Accept") || "*/*",
      },
    });

    // 修改响应头，允许跨域
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  },
};
