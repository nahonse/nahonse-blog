# Azure로 만든 캐릭터 그림(흰 배경)을 배경 투명 PNG로 바꾸고 캐릭터 둘레로 잘라 assets/toon/ 형식으로 만든다.
# 사용: python -I _tools/toon-alpha.py <입력 폴더> <출력 폴더> [이름 ...]   (이름이 없으면 폴더의 cat-*·dog-* 전부)
# 배경 지우기: 가장자리에서 이어진 흰색만 지운다(눈 흰자·하이라이트는 테두리 안이라 남음). 선 바깥 옅은 테는 밝기만큼 반투명.
import os, subprocess, sys
from collections import deque
import numpy as np

def load(p):
    w, h = map(int, subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", p]).decode().strip().split(","))
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).copy()

def background(rgb, thr=236):
    h, w, _ = rgb.shape
    light = rgb.min(-1) >= thr
    bg = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if light[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if light[y, x] and not bg[y, x]: bg[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and light[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True; q.append((ny, nx))
    return bg

def convert(src, dst):
    rgb = load(src)
    bg = background(rgb)
    alpha = np.where(bg, 0, 255).astype(np.float32)
    # 배경에 닿은 옅은 테(안티에일리어싱): 밝을수록 투명하게
    near = np.zeros_like(bg)
    near[1:] |= bg[:-1]; near[:-1] |= bg[1:]; near[:, 1:] |= bg[:, :-1]; near[:, :-1] |= bg[:, 1:]
    edge = near & ~bg
    mn = rgb.min(-1).astype(np.float32)
    alpha[edge] = np.clip((255 - mn[edge]) / (255 - 150) * 255, 0, 255)
    ys, xs = np.where(alpha > 0)
    m = 8
    y0, y1, x0, x1 = max(ys.min() - m, 0), min(ys.max() + m + 1, rgb.shape[0]), max(xs.min() - m, 0), min(xs.max() + m + 1, rgb.shape[1])
    rgba = np.dstack([rgb, alpha.astype(np.uint8)])[y0:y1, x0:x1]
    hh, ww = rgba.shape[:2]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{ww}x{hh}", "-i", "-", dst], input=rgba.tobytes(), check=True)
    # 검사: 눈 흰자가 남았는지(캐릭터 안쪽 흰 픽셀이 0이면 배경 지우기가 안쪽까지 샌 것)
    inner_white = ((rgb.min(-1) >= 236) & ~bg)[y0:y1, x0:x1].sum()
    assert inner_white > 50, f"{src}: 안쪽 흰색이 거의 없음({inner_white}) — 테두리가 끊겨 배경 지우기가 샜는지 확인"
    return ww, hh, int(inner_white)

src_dir, out_dir, *names = sys.argv[1:]
os.makedirs(out_dir, exist_ok=True)
names = names or sorted(f[:-4] for f in os.listdir(src_dir) if f.endswith(".png") and f.startswith(("cat-", "dog-")))
for n in names:
    ww, hh, iw = convert(os.path.join(src_dir, n + ".png"), os.path.join(out_dir, n + ".png"))
    print(f"{n}: {ww}x{hh}, 안쪽 흰색 {iw}px")
