// 나혼세 만화 캐릭터(고양이 사장님·강아지 이웃 사장님). toon.html(네컷만화)과 insta.html(설명 장)이 같이 쓴다.
// 캐릭터 그림: assets/toon/*.png (사용자 제공 시트 이모션1~5에서 잘라 배경 투명, 원본 jpg는 커밋 안 함)
//   공통(dog-·cat-): neutral 기본, talk 말하기, surprise 놀람, panic 당황, happy 기쁨, cry 울음,
//                    angry 화남, tired 지침, cheer 만세, laptop 노트북 작업, phone 통화 당황, slam 책상 쾅, faint 기절(몸 뒤쪽이 잘림 → 칸 아래로 자르기), yay 만세2
//   강아지만: think 궁금(전구?), smug 팔짱 으쓱, bored 턱 괴기(상반신)   고양이만: idea 떠오름(전구), shock 파랗게 질림, wink 윙크, mad 팔짱 화남
//   (이모션4·5) 공통: sly 팔짱 능청, wonder 갸웃(?), yawn 하품, tongue 메롱 윙크, sulk 팔짱 씩씩(김), sob 무릎 꿇고 펑펑, scared 파랗게 떨림, scheme 음흉한 웃음
//   강아지만: giggle 입 가리고 윙크, grin 씨익   고양이만: excited 눈 반짝, cute 두 손 모으고 방긋
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
