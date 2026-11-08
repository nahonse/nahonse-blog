#!/usr/bin/env bash
# 홈 글 카드용 작은 썸네일: 네컷만화(assets/insta/<슬러그>/1.png, 1080x1350)의 제목+위 2칸만 잘라 폭 600px JPG로.
# 사용: bash _tools/thumbs.sh            # 모든 세트 (이미 있으면 건너뜀)
#       bash _tools/thumbs.sh <슬러그>    # 하나만 다시 만들기
# 새 세트를 게시할 때 블로그 글과 같이 만든다(홈 카드는 thumb.jpg가 있으면 그걸 쓰고, 없으면 1.png).
set -euo pipefail
cd "$(dirname "$0")/.."
for d in assets/insta/${1:-*}/; do
  s=$(basename "$d"); [ -f "$d/1.png" ] || continue
  [ -z "${1:-}" ] && [ -f "$d/thumb.jpg" ] && continue
  ffmpeg -loglevel error -y -i "$d/1.png" -vf "crop=1080:700:0:0,scale=600:-2" -q:v 4 "$d/thumb.jpg"
  echo "만듦: $s/thumb.jpg ($(( $(stat -c %s "$d/thumb.jpg") / 1024 ))KB)"
done
