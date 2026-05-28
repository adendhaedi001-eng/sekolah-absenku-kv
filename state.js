const STATE_KEY = 'sekolah_absenku_state_v1';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function getKV(env) {
  // Nama utama yang disarankan: SEKOLAH_ABSENKU_KV
  // Nama cadangan disediakan agar tetap jalan jika binding terlanjur dibuat dengan nama lain.
  return env.SEKOLAH_ABSENKU_KV || env.DATA_KV || env.APP_KV || env.KV || null;
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return json({ ok: true });
  }

  const kv = getKV(env);
  if (!kv) {
    return json({
      ok: false,
      error: 'Binding Worker KV belum terpasang. Buat KV binding dengan nama SEKOLAH_ABSENKU_KV di Cloudflare Pages.'
    }, 500);
  }

  if (request.method === 'GET') {
    try {
      const result = await kv.getWithMetadata(STATE_KEY, { type: 'json' });
      const db = result && result.value ? result.value : null;
      const updatedAt = result && result.metadata && result.metadata.updatedAt
        ? result.metadata.updatedAt
        : null;

      return json({ ok: true, db, updatedAt });
    } catch (error) {
      return json({
        ok: false,
        error: 'Data di Worker KV rusak/tidak bisa dibaca.',
        detail: String(error && error.message ? error.message : error)
      }, 500);
    }
  }

  if (request.method === 'PUT') {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return json({ ok: false, error: 'Body JSON tidak valid.' }, 400);
    }

    if (!body || typeof body.db !== 'object' || body.db === null) {
      return json({ ok: false, error: 'Format wajib: { db: {...} }' }, 400);
    }

    const updatedAt = new Date().toISOString();
    try {
      await kv.put(STATE_KEY, JSON.stringify(body.db), {
        metadata: { updatedAt }
      });

      return json({ ok: true, updatedAt });
    } catch (error) {
      return json({
        ok: false,
        error: 'Gagal menyimpan data ke Worker KV.',
        detail: String(error && error.message ? error.message : error)
      }, 500);
    }
  }

  return json({ ok: false, error: 'Method tidak diizinkan. Gunakan GET atau PUT.' }, 405);
}
