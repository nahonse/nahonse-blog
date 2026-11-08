// 나혼세 만화 캐릭터(고양이 사장님·강아지 이웃 사장님). toon.html(네컷만화)과 insta.html(설명 장)이 같이 쓴다.
// 캐릭터 그림: assets/toon/*.png (사용자 제공 시트 이모션1~7에서 잘라 배경 투명, 원본 jpg는 커밋 안 함)
//   잘림 주의(2026-11-08 점검, 시트에서 옆 캐릭터에 가려져 원본에도 없음 → 잘린 쪽을 칸 가장자리에 붙이거나 다른 그림을 쓴다):
//     꼬리 왼쪽 잘림 cat-happy·cat-wink·cat-dizzy·cat-moneybags(몸 왼쪽도), 꼬리 오른쪽 cat-sob, 몸 왼쪽 선 cat-mad, 오른쪽 가장자리 cat-faint·cat-panic·cat-shock,
//     서류 왼쪽 끝 cat-guide("TAX" 첫 글자)·cat-contract, 귀 오른쪽 dog-surprise·dog-think, 귀 왼쪽 dog-panic·dog-smug
//     (고침: cat-stamp 얼굴 오른쪽은 이모션9에서 다시 자름, 발 워터마크 8종·얼룩 3종 지움)
//   쓰지 않음(2026-11-08 사용자): 콩알눈 cat-neutral·cat-talk. 사용자가 지움(11-08): cat-faint·cat-wink·dog-angry·dog-bored·dog-faint·dog-neutral·dog-smug·dog-surprise·dog-wave (옛 만화 칸에 dog-smug·dog-wave가 남아 있어 그 덱은 다시 찍지 않음). dog-talk은 흰자위 있는 사용자 제공 그림으로 바꿈. 강아지 털색은 모두 dog-point-left2 기준(_tools/toon-dogtone.html)
//   공통(dog-·cat-): neutral 기본, talk 말하기, surprise 놀람, panic 당황, happy 기쁨, cry 울음,
//                    angry 화남, tired 지침, cheer 만세, laptop 노트북 작업, phone 통화 당황, slam 책상 쾅, faint 기절(몸 뒤쪽이 잘림 → 칸 아래로 자르기), yay 만세2
//   강아지만: think 궁금(전구?), smug 팔짱 으쓱, bored 턱 괴기(상반신)   고양이만: idea 떠오름(전구), shock 파랗게 질림, wink 윙크, mad 팔짱 화남
//   (이모션4·5) 공통: sly 팔짱 능청, wonder 갸웃(?), yawn 하품, tongue 메롱 윙크, sulk 팔짱 씩씩(김), sob 무릎 꿇고 펑펑, scared 파랗게 떨림, scheme 음흉한 웃음
//   강아지만: giggle 입 가리고 윙크, grin 씨익   고양이만: excited 눈 반짝, cute 두 손 모으고 방긋
//   (이모션6) 가리키기: dog-point-left·dog-point-left2(왼쪽), dog-point-right, cat-point-right, cat-point-both(양쪽)
//            그 밖: dog-rub 손 비비기, dog-wave 씨익 손 흔들기, cat-kneel 무릎 꿇고 방긋, cat-present·cat-present2 손 내밀어 소개
//   (이모션7) 강의: dog-lecture 강단 설명(말풍선 …!? 포함), dog-mic 마이크 발표 / cat-memo·cat-memo-kneel 메모, cat-listen 듣기, cat-sit 앉아 듣기, cat-sit-idea 앉아서 전구
//   (이모션8·9, `_tools/toon-cut.html`로 자름) 강아지: checklist 체크리스트 가리키기(오른쪽 봄), reach 손 내밀어 다가가기(오른쪽), cashier 금고·돈주머니, stamp 계약서 도장(오른쪽 봄), rich 돈 받고 신남, dizzy 휴대폰 보며 어질(앉음)
//            고양이: clipboard 서류철 들고 오른쪽 봄, guide 서류 내밀고 메모장(오른쪽), contract 계약서 내밀고 메모장(오른쪽), papers 서류 더미에 어질, cashier 금고·돈주머니, moneybags 돈주머니(오른쪽 봄), stamp 도장 찍기(오른쪽 봄), rich 돈 받고 신남, dizzy 휴대폰 보며 어질
//   마주 보기: 왼쪽 고양이는 오른쪽 보는 그림, 오른쪽 강아지는 dog-talk·dog-point-left·dog-point-left2(뒤집지 않음) 또는 오른쪽 보는 그림을 flip
//   캡처 설명 장 강아지 기본값은 dog-point-left(말풍선이 왼쪽). 장마다 바꾸려면 슬라이드에 guide_pic.
const L = 'stroke="#1e1e1e" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
const TOON = "../assets/toon/";
// SVG 안에 캐릭터 놓기. (x,y)=발 가운데, h=키. o.flip 좌우 반전, o.rot 기울기(도)
function pic(name, x, y, h, o = {}) {
  const w = h * 0.75;
  return `<g transform="translate(${x} ${y}) rotate(${o.rot || 0}) scale(${o.flip ? -1 : 1} 1)"><image href="${TOON}${name}.png" x="${-w / 2}" y="${-h}" width="${w}" height="${h}" preserveAspectRatio="xMidYMax meet"/></g>`;
}
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
