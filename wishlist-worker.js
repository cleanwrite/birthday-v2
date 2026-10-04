// Cloudflare Workers - 偷偷收集生日愿望
// 部署：Cloudflare Dashboard → Workers → Create Worker → 粘贴此代码 → 保存
// 然后绑定 KV：Settings → Variables → KV → Add binding
//   Variable name: WISHES
//   KV namespace: 新建一个（比如叫 birthday-wishes）

export default {
  async fetch(request, env) {
    // CORS 允许跨域
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    // POST - 偷偷存愿望
    if (request.method === 'POST') {
      try {
        const { wish, time } = await request.json();
        if (!wish) return new Response('OK', { status: 200, headers });

        // 读取现有愿望
        const existing = await env.WISHES.get('all_wishes');
        const wishes = existing ? JSON.parse(existing) : [];
        wishes.push({ wish, time: time || new Date().toISOString() });

        // 存回 KV
        await env.WISHES.put('all_wishes', JSON.stringify(wishes));

        return new Response('OK', { status: 200, headers });
      } catch (e) {
        return new Response('OK', { status: 200, headers });
      }
    }

    // GET - 你查看所有愿望（加个简单密码保护）
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const password = url.searchParams.get('key');

      // 密码验证（改成你自己的密码）
      if (password !== 'fw2026') {
        return new Response('Not Found', { status: 404 });
      }

      const data = await env.WISHES.get('all_wishes');
      const wishes = data ? JSON.parse(data) : [];

      return new Response(JSON.stringify(wishes, null, 2), {
        status: 200,
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};
