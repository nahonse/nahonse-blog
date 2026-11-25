# 새 그림(흰 배경) 하나의 털색을 기준 그림 털색 평균에 맞춘다(채널별 곱하기). 갈색·회색 털 모두.
# 사용: python _tools/toon-furtone.py <바꿀 그림.png> <기준 그림.png> <출력.png> [dog|cat]
# 털 픽셀: 흰 배경·검은 선·넥타이(파랑)·앞치마 등을 빼려고 종류별 색 범위로 고른다. 원본은 덮어쓰지 않는다.
import subprocess, sys
import numpy as np

def load(p):
    w, h = map(int, subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", p]).decode().strip().split(","))
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    return np.frombuffer(raw, np.uint8).reshape(h, w, 3).astype(np.float32), w, h

def fur_mask(a, kind):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1)
    if kind == "dog":  # 갈색: r>g>b, 너무 밝거나 어둡지 않음
        return (r > g) & (g > b) & (r - b > 55) & (mx > 150) & (mx < 232)  # 몸통 중간 톤만(밝은 주둥이·어두운 귀 제외)
    return (mx - mn < 22) & (mx > 110) & (mx < 215) & (b >= r - 4)  # 회색 털(살짝 푸른 회색)

src, ref, out = sys.argv[1:4]
kind = sys.argv[4] if len(sys.argv) > 4 else "dog"
a, w, h = load(src)
r_, _, _ = load(ref)
ms, mr = fur_mask(a, kind), fur_mask(r_, kind)
gain = r_[mr].mean(0) / a[ms].mean(0)
print("평균 털색 바꿀 그림", a[ms].mean(0).round(1), "기준", r_[mr].mean(0).round(1), "배율", gain.round(3))
a[ms] = np.clip(a[ms] * gain, 0, 255)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{w}x{h}", "-i", "-", out], input=a.astype(np.uint8).tobytes(), check=True)
assert abs(fur_mask(load(out)[0], kind).sum() - ms.sum()) < ms.sum() * 0.1  # 바꾼 뒤에도 털 영역이 크게 달라지지 않았는지
print("저장:", out)
