// 국세청 세무일정(목록형)을 읽어 _data/tax_schedule.json 을 만든다. 홈 상단 달력이 이 파일을 쓴다.
// 사용법: node _tools/nts_schedule.js [연도 ...]   (기본: 올해와 내년)
// - 날짜는 국세청이 올린 실제 기한(토·일·공휴일이면 다음 날로 옮겨진 날짜) 그대로다.
// - g: "boss"(혼자 꾸리는 사장님·프리랜서가 볼 일정) / "etc"(법인·개별소비세 등). 분류 규칙은 아래 BOSS·ETC.
// - 국세청이 새 달 일정을 올리면 다시 돌리고 commit 한다(해마다 1월·7월에 확인).
const fs = require('fs');
const path = require('path');

const URL = (y, m) => `https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747&taxYear=${y}&taxMonth=${String(m).padStart(2, '0')}`;
const ETC = /법인|교육세|개별소비세|주세|교통|인지세|학자금|가상자산|증권거래세|종합부동산|농어촌특별세|과세유흥장소/;
const BOSS = /부가가치세|종합소득세|소득세 중간예납|원천세|지급명세서|사업장 ?현황신고|근로·자녀장려금|사업용계좌|성실신고|용역제공자|연말정산/;
const text = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

(async () => {
  const now = new Date();
  const years = process.argv.slice(2).map(Number).filter(Boolean);
  if (!years.length) years.push(now.getFullYear(), now.getFullYear() + 1);
  const items = [];
  for (const y of years) for (let m = 1; m <= 12; m++) {
    const html = await (await fetch(URL(y, m), { headers: { 'User-Agent': 'Mozilla/5.0' } })).text();
    const tbody = (html.match(/<tbody>([\s\S]*?)<\/tbody>/) || [])[1] || '';
    for (const tr of tbody.split('<tr>').slice(1)) {
      const td = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(x => text(x[1]));
      if (td.length < 3 || !/^\d+$/.test(td[0]) || !/^\d+$/.test(td[1])) continue;
      const d = `${y}-${td[0].padStart(2, '0')}-${td[1].padStart(2, '0')}`;
      const t = td[2], n = td[3] || '';
      items.push({ d, t, n, g: !ETC.test(t) && BOSS.test(t) ? 'boss' : 'etc' });
    }
  }
  items.sort((a, b) => a.d.localeCompare(b.d));
  const months = [...new Set(items.map(i => i.d.slice(0, 7)))];
  const out = { source: '국세청 세무일정', url: 'https://www.nts.go.kr/nts/ad/taxSchdul/selectList.do?mi=135747',
    checked: now.toISOString().slice(0, 10), months, items };
  const file = path.join(__dirname, '..', '_data', 'tax_schedule.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(out, null, 1));
  const boss = items.filter(i => i.g === 'boss').length;
  console.log(`저장: ${file} — ${items.length}건(사장님 일정 ${boss}건), 달: ${months[0]} ~ ${months.at(-1)} (${months.length}개월)`);
  // 자체 점검: 날짜 형식과 빈 제목이 없어야 한다
  console.assert(items.every(i => /^\d{4}-\d\d-\d\d$/.test(i.d) && i.t), '날짜 또는 제목이 이상한 항목이 있음');
})();
