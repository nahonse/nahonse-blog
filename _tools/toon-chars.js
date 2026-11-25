// 나혼세 만화 캐릭터(고양이 사장님·강아지 이웃 사장님). toon.html(네컷만화)과 insta.html(설명 장)이 같이 쓴다.
// 캐릭터 그림: assets/toon/*.png — 2026-11-25부터 Azure FLUX.2-pro로 만든 새 그림(사용자 결정, CLAUDE.md 8절). 옛 사용자 제공 시트 그림은 _captures/toon-orig/before-azure/
//   만들기: node _tools/toon-gen.mjs --spec _tools/toon-gen-spec.json --out v1 [이름] → 흰 배경 원본 _captures/toon-gen/v1/ → python -I _tools/toon-alpha.py _captures/toon-gen/v1 assets/toon [이름](배경 투명·자르기)
//   털색이 다르면 python -I _tools/toon-furtone.py <그림> <기준> <출력> dog|cat. 기준 그림: _captures/toon-gen/ref/(cat-listen·cat-cute, dog-talk·dog-cheer)
//   고양이(오른쪽 봄): listen 듣기, memo·memo-kneel 메모, present·present2 손 내밀어 말하기, point-right 가리키기, idea 전구, sit-idea 앉아 전구, excited 눈 반짝, phone 휴대폰, cashier 카드단말기, contract 서류+펜, receipt 영수증, walk-papers 서류 들고 걷기, laptop 노트북 타자, laptop-worry 노트북 고민
//   고양이(정면): happy 볼 손, hero 두 손 볼(홈), cheer 만세, wave 인사, wonder 갸웃, surprise 놀람, panic 당황, dizzy 어질(휴대폰), shock 질림, tired 지침, sit 앉기, guide 서류 가리키기, moneybags 돈주머니, papers 서류 더미, phone-relief 안도, calendar 달력(왼쪽에 달력), sleep-desk 책상에서 졸기
//   강아지(왼쪽 봄): talk 말하기, point-left 가리키기, checklist 체크리스트, rub 머리 긁기, reach 손 내밀기, cashier 카드단말기, board 화이트보드(왼쪽), handover 서류 건네기, thumbsup 엄지, laptop-point 노트북(왼쪽), coffee 커피
//   강아지(그 밖): point-right 오른쪽 가리키기, yay 만세, hero 두 팔(홈), cheer 주먹, think 생각(?), wave 인사
//   마주 보기: 왼쪽 고양이는 오른쪽 보는 그림, 오른쪽 강아지는 왼쪽 보는 그림(뒤집지 않음). 칸마다 동작·배경·소품을 바꾼다(11/25 사용자 지적).
//   캡처 설명 장 강아지 기본값은 dog-point-left(말풍선이 왼쪽). 장마다 바꾸려면 슬라이드에 guide_pic.
const L = 'stroke="#1e1e1e" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
const TOON = "../assets/toon/";
// SVG 안에 캐릭터 놓기. (x,y)=발 가운데, h=키. o.flip 좌우 반전, o.rot 기울기(도)
function pic(name, x, y, h, o = {}) {
  h *= window.PIC_SCALE || 1;
  const w = h * 0.75;
  return `<g transform="translate(${x} ${y}) rotate(${o.rot || 0}) scale(${o.flip ? -1 : 1} 1)"><image href="${TOON}${name}.png" x="${-w / 2}" y="${-h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"/></g>`;
}
// 배경·소품(2026-11-25, Azure 그림, assets/toon-bg/): bgimg("bg-shop") 칸(500x540)을 꽉 채움, prop("prop-calendar", x, y, h, {rot}) (x,y)=아래 가운데
//   배경: bg-shop 가게 계산대, bg-cafe 카페, bg-home-night 밤 책상, bg-office 사무실, bg-waiting 대기실, bg-living 거실 / 소품: prop-calendar·receipts·laptop·stamp·piggy·hourglass
const TOON_BG = "../assets/toon-bg/";
const bgimg = (name) => `<image href="${TOON_BG}${name}.png" x="0" y="0" width="500" height="540" preserveAspectRatio="xMidYMid slice"/>`;
const prop = (name, x, y, h, o = {}) => `<g transform="translate(${x} ${y}) rotate(${o.rot || 0})"><image href="${TOON_BG}${name}.png" x="${-h / 2}" y="${-h}" width="${h}" height="${h}" preserveAspectRatio="xMidYMax meet"/></g>`;
// 효과: 움직임 선, 집중선(놀람), 반짝 폭발(기쁨), 느낌표 표시
const motion = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#1e1e1e" stroke-width="5" stroke-linecap="round" fill="none">
  <path d="M0 0 q-14 10 0 20 M14 -12 q-14 12 0 26 M-20 40 h30 M-28 56 h40"/></g>`;
function focus(cx, cy, n = 28, r1 = 150, r2 = 420, color = "#1e1e1e") {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (i % 2) * 0.05, r = r1 + (i % 3) * 22;
    d += `M${cx + Math.cos(a) * r} ${cy + Math.sin(a) * r} L${cx + Math.cos(a) * r2} ${cy + Math.sin(a) * r2} `;
  }
  return `<path d="${d}" stroke="${color}" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
}
function burst(cx, cy, n = 14, r1 = 70, r2 = 400, color = "#fff") {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, w = Math.PI / n / 2;
    d += `M${cx} ${cy} L${cx + Math.cos(a - w) * r2} ${cy + Math.sin(a - w) * r2} L${cx + Math.cos(a + w) * r2} ${cy + Math.sin(a + w) * r2}z `;
  }
  return `<path d="${d}" fill="${color}" opacity=".6"/>`;
}
const marks = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#1e1e1e" stroke-width="7" stroke-linecap="round">
  <path d="M0 0 l-10 -34 M22 4 l4 -36 M40 18 l20 -26"/></g>`;
