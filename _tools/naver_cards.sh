#!/usr/bin/env bash
# 네이버 전용 카드뉴스 렌더: bash _tools/naver_cards.sh <덱 이름>  → assets/insta/<덱 이름>/1.png ~ n.png
set -euo pipefail
cd "$(dirname "$0")/.."
D="$1"; CH="/c/Program Files/Google/Chrome/Application/chrome.exe"; URL="file:///$(pwd -W)/_tools/naver-card.html#$D"
n=$("$CH" --headless=new --virtual-time-budget=3000 --dump-dom "$URL/1" 2>/dev/null | sed -n 's#.*<title>\([0-9]*\)</title>.*#\1#p')
[ -n "$n" ] || { echo "덱 없음: $D" >&2; exit 1; }
mkdir -p "assets/insta/$D"
for i in $(seq 1 "$n"); do
  "$CH" --headless=new --hide-scrollbars --window-size=1080,1080 --virtual-time-budget=8000 --screenshot="$(pwd -W)/assets/insta/$D/$i.png" "$URL/$i" 2>/dev/null
done
echo "만듦: assets/insta/$D/1~$n.png"
