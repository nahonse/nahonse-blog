// 만화용 그림(캐릭터 자세·배경·소품)을 Azure FLUX.2-pro로 만든다(CLAUDE.md 8절, 2026-11-25 사용자: 그림 작업은 여기서, 기존 캐릭터는 교체).
// 한 장: node _tools/toon-gen.mjs <이름> "<프롬프트>" [기준그림 이름(assets/toon/*.png) ...] [--w 1024 --h 1024]
// 여러 장: node _tools/toon-gen.mjs --spec _tools/toon-gen-spec.json [--out v1] [이름...]  (이름을 주면 그것만, 없으면 아직 없는 것만)
// 결과: _captures/toon-gen/<out>/<이름>.png (gitignore). 고른 것만 털색·테두리·배경 투명 처리를 거쳐 assets/toon/에 넣는다.
// 주소는 ~/.tax-blog/azure_image_endpoint.txt, 키는 사용자 환경 변수 AZURE_IMAGE_KEY(저장소에 넣지 않음).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const userEnv = name => {
  if (process.env[name]) return process.env[name];
  try {
    const out = execFileSync("reg", ["query", "HKCU\\Environment", "/v", name], { stdio: ["ignore", "pipe", "ignore"] }).toString();
    return out.match(new RegExp(`${name}\\s+REG_\\w+\\s+(.+)`))?.[1].trim();
  } catch { return undefined; }
};
const ENDPOINT = fs.readFileSync(path.join(os.homedir(), ".tax-blog", "azure_image_endpoint.txt"), "utf8").trim();
const KEY = userEnv("AZURE_IMAGE_KEY");
if (!KEY) throw new Error("AZURE_IMAGE_KEY 없음");
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generate(file, { prompt, refs = [], w = 1024, h = 1024 }) {
  const body = { prompt, model: "FLUX.2-pro", width: w, height: h, n: 1 };
  // 기준 그림은 FLUX.2 참조 이미지 칸(input_image, input_image_2 …)에 base64로
  refs.forEach((r, i) => { body[i ? `input_image_${i + 1}` : "input_image"] = fs.readFileSync(r.includes("/") ? r : path.join("assets/toon", `${r}.png`)).toString("base64"); });
  for (let attempt = 1; ; attempt++) {
    let res, json = {};
    try {
      res = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` }, body: JSON.stringify(body) });
      json = await res.json().catch(() => ({}));
    } catch (e) { res = { ok: false, status: `network ${e.cause?.code || e.message}` }; }
    const b64 = json?.data?.[0]?.b64_json;
    if (res.ok && b64) { fs.writeFileSync(file, Buffer.from(b64, "base64")); console.log(`저장: ${path.basename(file)}`); return true; }
    const msg = `HTTP ${res.status} ${JSON.stringify(json).slice(0, 300)}`;
    if (attempt >= 4 || res.status === 401 || res.status === 400) { console.error(`${path.basename(file)} 실패: ${msg}`); return false; }
    console.log(`${path.basename(file)} 다시 시도 ${attempt}: ${msg}`); await sleep(10000 * attempt); // 분당 15회 제한
  }
}

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const specFile = opt("--spec"), outName = opt("--out") || "", w = Number(opt("--w") || 1024), h = Number(opt("--h") || 1024);
const outDir = path.resolve("_captures/toon-gen", outName);
fs.mkdirSync(outDir, { recursive: true });

if (specFile) {
  // spec: { base: { cat: "...{pose}...", dog: "...", bg: "...", prop: "..." }, refs: { cat: [...], dog: [...] }, items: { 이름: { kind, pose, w?, h? } } }
  const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  const names = args.length ? args : Object.keys(spec.items).filter(n => !fs.existsSync(path.join(outDir, `${n}.png`)));
  let fail = 0;
  for (let i = 0; i < names.length; i += 2) { // 두 장씩 동시에
    await Promise.all(names.slice(i, i + 2).map(async n => {
      const it = spec.items[n];
      if (!it) { console.error(`${n}: spec에 없음`); fail++; return; }
      const prompt = spec.base[it.kind].replace("{pose}", it.pose);
      const ok = await generate(path.join(outDir, `${n}.png`), { prompt, refs: it.refs || spec.refs[it.kind] || [], w: it.w || 1024, h: it.h || 1024 });
      if (!ok) fail++;
    }));
    await sleep(8000);
  }
  console.log(`끝: ${names.length - fail}장 성공, ${fail}장 실패`);
} else {
  const [name, prompt, ...refs] = args;
  if (!name || !prompt) { console.error("사용: node _tools/toon-gen.mjs <이름> \"<프롬프트>\" [기준그림...]"); process.exit(1); }
  if (!await generate(path.join(outDir, `${name}.png`), { prompt, refs, w, h })) process.exit(1);
}
