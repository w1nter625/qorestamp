#!/usr/bin/env python3
"""Build QoreStamp logo, 16:9 cover, and a narrated demo (slides + English TTS + captions)."""
from __future__ import annotations

import hashlib
import subprocess
import time
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path("/workspace/competitions-2/qorechain-qorestamp")
OUT_MP4 = ROOT / "demo.mp4"
OUT_SRT = ROOT / "demo.srt"
LOGO = ROOT / "logo.png"
COVER = ROOT / "cover.png"
WORK = Path("/tmp/qorestamp-demo")
AUDIO = WORK / "audio"
FRAMES = WORK / "frames"
EDGE_TTS = "/workspace/codegeist/.venv-video/bin/edge-tts"
VOICE = "en-US-AndrewNeural"
W, H = 1920, 1080

BG = (9, 9, 23)
PANEL = (20, 20, 44)
LINE = (42, 42, 74)
TEAL = (46, 233, 198)
TEAL_DIM = (26, 120, 104)
PURPLE = (123, 108, 255)
WHITE = (232, 234, 246)
DIM = (154, 160, 195)
SUBTLE = (109, 115, 152)
OK = (62, 224, 160)

MEMO = "Received 20 SGD from Alex for lunch, 24 Nov 2026, Maxwell Food Centre."
DIGEST = "0x" + hashlib.sha256(MEMO.encode("utf-8")).hexdigest()

INTER = "/usr/share/fonts/truetype/sand-box/google/Inter/Inter-VariableFont_opsz,wght.ttf"
MONO = "/usr/share/fonts/truetype/sand-box/google/IBM Plex Mono/IBMPlexMono-Regular.ttf"
MONO_B = "/usr/share/fonts/truetype/sand-box/google/IBM Plex Mono/IBMPlexMono-SemiBold.ttf"

NARRATION = [
    (
        "title",
        "title",
        "QoreStamp is a post-quantum receipt you can stamp and verify on the QoreChain testnet.",
    ),
    (
        "problem",
        "problem",
        "A lunch I.O.U. in a chat can be denied later. After Q-Day, a classical signature alone may not be enough either.",
    ),
    (
        "compose",
        "compose",
        "Write the memo. QoreStamp shows its SHA two fifty six digest. The chain stores only that hash. Anyone with the original text can check it.",
    ),
    (
        "hybrid",
        "hybrid",
        "On QoreChain, opening the EVM window is signed twice: once with secp two five six k one, and once with ML-DSA eighty seven, the FIPS two zero four post-quantum key.",
    ),
    (
        "registry",
        "registry",
        "Stamp Registry then records the digest, the stamper, and the time. Six local tests cover the contract, including a zero digest rejection.",
    ),
    (
        "verify",
        "verify",
        "Paste the transaction hash. The public testnet A.P.I. must show success, a P.Q.C. Hybrid Signature, and a pqc hybrid verify event with status verified.",
    ),
    (
        "close",
        "close",
        "QoreStamp. Built for Build Before Q-Day, Quantum Pass. Testnet only. No camera, no mainnet funds.",
    ),
]


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    if Path(INTER).exists():
        return ImageFont.truetype(INTER, size=size)
    path = (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    )
    return ImageFont.truetype(path, size=size) if Path(path).exists() else ImageFont.load_default()


def font_mono(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    p = MONO_B if bold and Path(MONO_B).exists() else MONO
    if Path(p).exists():
        return ImageFont.truetype(p, size=size)
    return font(size, bold)


def new_canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    im = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 8, H], fill=TEAL)
    return im, d


def header(d: ImageDraw.ImageDraw, right: str) -> None:
    d.text((48, 22), "QORESTAMP", fill=TEAL, font=font(26, bold=True))
    d.text((260, 28), "Build Before Q-Day  ·  Quantum Pass  ·  testnet diana", fill=DIM, font=font(18))
    bbox = d.textbbox((0, 0), right, font=font(18))
    d.text((W - 48 - (bbox[2] - bbox[0]), 28), right, fill=DIM, font=font(18))


def rounded_rect(d: ImageDraw.ImageDraw, box, fill, outline=None, width=1, radius=16) -> None:
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def paste_logo(im: Image.Image, xy: tuple[int, int], size: int) -> None:
    if LOGO.exists():
        mark = Image.open(LOGO).convert("RGB").resize((size, size), Image.Resampling.LANCZOS)
        im.paste(mark, xy)


def make_logo() -> None:
    size = 1024
    im = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(im)
    cx, cy = size // 2, size // 2 - 30
    d.ellipse([cx - 390, cy - 390, cx + 390, cy + 390], outline=TEAL_DIM, width=3)
    d.ellipse([cx - 330, cy - 330, cx + 330, cy + 330], outline=PURPLE, width=6)
    # seal / stamp
    d.ellipse([cx - 250, cy - 250, cx + 250, cy + 250], outline=TEAL, width=14)
    d.ellipse([cx - 220, cy - 220, cx + 220, cy + 220], outline=TEAL_DIM, width=3)
    # two signature marks: classical + PQC
    d.rounded_rectangle([cx - 140, cy - 70, cx - 20, cy + 70], radius=18, outline=WHITE, width=8)
    d.rounded_rectangle([cx + 20, cy - 70, cx + 140, cy + 70], radius=18, fill=TEAL)
    d.text((64, 860), "QORESTAMP", fill=TEAL, font=font(84, bold=True))
    d.text((68, 960), "POST-QUANTUM RECEIPTS", fill=DIM, font=font(28))
    im.save(LOGO, optimize=True)
    print("logo", LOGO, LOGO.stat().st_size)


def make_cover() -> None:
    im, d = new_canvas()
    paste_logo(im, (80, 80), 160)
    d.text((270, 100), "QORESTAMP", fill=TEAL, font=font(92, bold=True))
    d.text((274, 220), "Post-quantum receipts on the QoreChain testnet.", fill=WHITE, font=font(34))
    d.text((274, 280), "Build Before Q-Day  ·  Quantum Pass  ·  qorechain-diana", fill=DIM, font=font(24))
    cards = [
        ("01", "COMPOSE", "Write a memo.\nSHA-256 digest only."),
        ("02", "HYBRID SIGN", "secp256k1 +\nML-DSA-87 (FIPS 204)."),
        ("03", "VERIFY", "pqc_hybrid_verify\nstatus = verified."),
    ]
    x = 80
    for num, title, body in cards:
        rounded_rect(d, [x, 420, x + 560, 860], PANEL, outline=LINE, width=2, radius=22)
        d.text((x + 36, 450), num, fill=PURPLE, font=font(24, bold=True))
        d.text((x + 36, 500), title, fill=TEAL, font=font(32, bold=True))
        yy = 580
        for line in body.split("\n"):
            d.text((x + 36, yy), line, fill=WHITE, font=font(28))
            yy += 50
        x += 600
    d.text((84, 960), "github.com/w1nter625/qorestamp", fill=DIM, font=font(26))
    im.save(COVER, optimize=True)
    print("cover", COVER, COVER.stat().st_size)


def frame_title() -> Image.Image:
    im, d = new_canvas()
    paste_logo(im, (160, 260), 200)
    d.text((400, 280), "QORESTAMP", fill=TEAL, font=font(120, bold=True))
    d.text((408, 430), "Post-quantum receipts", fill=WHITE, font=font(44))
    d.text((408, 500), "you can stamp and verify on testnet.", fill=WHITE, font=font(44))
    d.text((408, 640), "Build Before Q-Day  ·  Quantum Pass  ·  MIT license", fill=DIM, font=font(28))
    return im


def frame_problem() -> Image.Image:
    im, d = new_canvas()
    header(d, "THE GAP")
    cards = [
        ("Today", "A lunch I.O.U. lives in a chat.\nIt can be edited, lost, or denied.\nA screenshot is not a receipt."),
        ("After Q-Day", "A classical key can be forged.\nQoreChain requires a second key:\nML-DSA-87, checked on chain."),
    ]
    x = 80
    for i, (title, body) in enumerate(cards):
        outline = TEAL if i == 1 else LINE
        rounded_rect(d, [x, 160, x + 860, 860], PANEL, outline=outline, width=3, radius=24)
        d.text((x + 48, 200), title, fill=TEAL if i == 1 else DIM, font=font(40, bold=True))
        yy = 320
        for line in body.split("\n"):
            d.text((x + 48, yy), line, fill=WHITE, font=font(32))
            yy += 80
        x += 900
    return im


def frame_compose() -> Image.Image:
    im, d = new_canvas()
    header(d, "COMPOSE")
    rounded_rect(d, [80, 140, 1840, 980], PANEL, outline=LINE, width=2, radius=24)
    d.text((120, 180), "MEMO", fill=SUBTLE, font=font(18, bold=True))
    rounded_rect(d, [120, 220, 1800, 480], BG, outline=LINE, width=1, radius=14)
    d.text((150, 260), MEMO, fill=WHITE, font=font(30))
    d.text((120, 530), "SHA-256  ·  the chain stores only this digest", fill=SUBTLE, font=font(20))
    rounded_rect(d, [120, 580, 1800, 720], BG, outline=TEAL_DIM, width=2, radius=14)
    d.text((150, 620), DIGEST, fill=TEAL, font=font_mono(26, bold=True))
    d.text((120, 800), "Keep the exact text. Anyone with it can re-hash and compare.", fill=DIM, font=font(26))
    return im


def frame_hybrid() -> Image.Image:
    im, d = new_canvas()
    header(d, "HYBRID SIGNATURE")
    cols = [
        ("CLASSICAL", "secp256k1", "64-byte signature\nThe key Ethereum tools\nalready know."),
        ("POST-QUANTUM", "ML-DSA-87", "4,627-byte signature\nFIPS 204. A stolen\nclassical key is not enough."),
        ("ON CHAIN", "pqc_hybrid_verify", "Validators check both.\nEvent status must be\nverified."),
    ]
    x = 80
    for i, (kicker, title, body) in enumerate(cols):
        outline = TEAL if i == 1 else LINE
        rounded_rect(d, [x, 160, x + 560, 900], PANEL, outline=outline, width=3, radius=24)
        d.text((x + 36, 200), kicker, fill=PURPLE, font=font(20, bold=True))
        d.text((x + 36, 260), title, fill=TEAL, font=font(34, bold=True))
        yy = 380
        for line in body.split("\n"):
            d.text((x + 36, yy), line, fill=WHITE, font=font(28))
            yy += 64
        if i < 2:
            d.polygon([(x + 580, 500), (x + 620, 530), (x + 580, 560)], fill=TEAL)
        x += 610
    return im


def frame_registry() -> Image.Image:
    im, d = new_canvas()
    header(d, "STAMP REGISTRY")
    rounded_rect(d, [80, 160, 1840, 900], PANEL, outline=LINE, width=2, radius=24)
    rows = [
        ("Contract", "StampRegistry.sol  ·  MIT  ·  QoreChain EVM, chain id 9800"),
        ("What is stored", "digest  ·  stamper  ·  timestamp  ·  first id of that digest"),
        ("How you get there", "pnpm window register  →  pnpm window open  →  pnpm deploy:testnet"),
        ("Window open", "The hybrid-signed Quantum Pass transaction. Save the opened: hash."),
        ("Local tests", "6 passing  ·  empty start, event, zero digest, two stampers, unknown id, SHA-256 ≠ keccak"),
        ("Faucet", "Free test QOR, no value  ·  dashboard.qorechain.io/faucet"),
    ]
    yy = 200
    for label, value in rows:
        d.text((120, yy), label, fill=DIM, font=font(24))
        d.text((500, yy), value, fill=WHITE, font=font(26))
        yy += 110
    return im


def frame_verify() -> Image.Image:
    im, d = new_canvas()
    header(d, "VERIFY")
    rounded_rect(d, [80, 160, 1840, 900], PANEL, outline=LINE, width=2, radius=24)
    d.text((120, 200), "Public testnet API  ·  api-testnet.qore.host", fill=DIM, font=font(22))
    rows = [
        ("code", "0  (success)", True),
        ("extension", "PQCHybridSignature present", True),
        ("ML-DSA-87", "4,627 bytes", True),
        ("secp256k1", "64 bytes", True),
        ("event", "pqc_hybrid_verify  status = verified", True),
        ("explorer", "explore.qore.network  ·  switch to Testnet", False),
    ]
    yy = 280
    for label, value, ok in rows:
        d.text((140, yy), label, fill=SUBTLE, font=font(24))
        d.text((500, yy), value, fill=OK if ok else WHITE, font=font_mono(28) if ok else font(26))
        if ok:
            d.text((1680, yy), "OK", fill=OK, font=font(22, bold=True))
        yy += 90
    return im


def frame_close() -> Image.Image:
    im, d = new_canvas()
    paste_logo(im, (160, 300), 180)
    d.text((380, 320), "QORESTAMP", fill=TEAL, font=font(100, bold=True))
    d.text((388, 460), "Stamp it. Verify both signatures.", fill=WHITE, font=font(40))
    d.text((388, 600), "Build Before Q-Day  ·  Quantum Pass", fill=DIM, font=font(28))
    d.text((388, 660), "github.com/w1nter625/qorestamp", fill=DIM, font=font(28))
    d.text((388, 780), "Testnet only.  No camera.  No mainnet funds.", fill=SUBTLE, font=font(24))
    return im


def frame_end() -> Image.Image:
    return frame_close()


FRAMES_FN = {
    "title": frame_title,
    "problem": frame_problem,
    "compose": frame_compose,
    "hybrid": frame_hybrid,
    "registry": frame_registry,
    "verify": frame_verify,
    "close": frame_close,
    "end": frame_end,
}


def render_still(beat: str, dest: Path) -> None:
    fn = FRAMES_FN[beat]
    fn().save(dest)


def tts(key: str, text: str) -> tuple[Path, Path, float]:
    AUDIO.mkdir(parents=True, exist_ok=True)
    mp3 = AUDIO / f"{key}.mp3"
    srt = AUDIO / f"{key}.srt"
    if mp3.exists() and mp3.stat().st_size >= 1000 and srt.exists():
        dur = float(
            subprocess.check_output(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)],
                text=True,
            ).strip()
        )
        print(f"tts {key}: {dur:.2f}s (cached)")
        return mp3, srt, dur
    last_err = None
    for attempt in range(1, 6):
        try:
            if mp3.exists():
                mp3.unlink()
            subprocess.run(
                [
                    EDGE_TTS,
                    "--voice",
                    VOICE,
                    "--rate=-5%",
                    "--text",
                    text,
                    "--write-media",
                    str(mp3),
                    "--write-subtitles",
                    str(srt),
                    "--no-progress",
                ],
                check=True,
            )
            if mp3.exists() and mp3.stat().st_size >= 1000:
                break
            last_err = f"tiny file ({mp3.stat().st_size if mp3.exists() else 0} bytes)"
        except subprocess.CalledProcessError as e:
            last_err = e
        time.sleep(1.5 * attempt)
    else:
        raise SystemExit(f"TTS failed for {key}: {last_err}")
    dur = float(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp3)],
            text=True,
        ).strip()
    )
    print(f"tts {key}: {dur:.2f}s")
    return mp3, srt, dur


def ts(x: float) -> str:
    if x < 0:
        x = 0
    h = int(x // 3600)
    m = int(x % 3600 // 60)
    s = x % 60
    return f"{h:02}:{m:02}:{int(s):02},{int(round((s - int(s)) * 1000)):03}"


def parse_ts(s: str) -> float:
    h, m, r = s.split(":")
    sec, ms = r.split(",")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def build_video() -> float:
    FRAMES.mkdir(parents=True, exist_ok=True)
    AUDIO.mkdir(parents=True, exist_ok=True)
    segs = []
    srt_blocks = []
    n = 1
    off = 0.0
    pad_after = 0.55
    pre_roll = 0.22

    for key, beat, text in NARRATION:
        mp3, part_srt, dur = tts(key, text)
        hold = dur + pre_roll + pad_after
        frame = FRAMES / f"{key}.png"
        render_still(beat, frame)
        out = WORK / f"seg_{key}.mp4"
        fade_out_start = max(0.05, hold - 0.25)
        vf = f"fade=t=in:st=0:d=0.2,fade=t=out:st={fade_out_start:.2f}:d=0.25,format=yuv420p"
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error",
                "-loop", "1", "-framerate", "30", "-i", str(frame),
                "-i", str(mp3),
                "-af", f"adelay={int(pre_roll*1000)}|{int(pre_roll*1000)},apad",
                "-t", f"{hold:.2f}",
                "-vf", vf,
                "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
                "-pix_fmt", "yuv420p",
                str(out),
            ],
            check=True,
        )
        segs.append(out)
        raw = part_srt.read_text().strip()
        if raw:
            for blk in raw.split("\n\n"):
                lines = blk.split("\n")
                if len(lines) < 3:
                    continue
                a, b = lines[1].split(" --> ")
                txt = " ".join(lines[2:])
                srt_blocks.append(
                    f"{n}\n{ts(off + pre_roll + parse_ts(a))} --> {ts(off + pre_roll + parse_ts(b))}\n{txt}\n"
                )
                n += 1
        off += hold

    end_hold = 2.4
    end_frame = FRAMES / "end.png"
    render_still("end", end_frame)
    end_out = WORK / "seg_end.mp4"
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-loop", "1", "-framerate", "30", "-i", str(end_frame),
            "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
            "-t", f"{end_hold:.2f}",
            "-vf", "fade=t=in:st=0:d=0.3,format=yuv420p",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
            "-pix_fmt", "yuv420p", "-shortest",
            str(end_out),
        ],
        check=True,
    )
    segs.append(end_out)
    off += end_hold

    lst = WORK / "list.txt"
    lst.write_text("".join(f"file '{s}'\n" for s in segs))
    OUT_SRT.write_text("\n".join(srt_blocks) + "\n")
    raw = WORK / "raw.mp4"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(raw)],
        check=True,
    )
    style = (
        "FontName=DejaVu Sans,FontSize=28,PlayResX=1920,PlayResY=1080,"
        "PrimaryColour=&H00EAF8FF,OutlineColour=&H80000000,BackColour=&H90000000,"
        "BorderStyle=3,Outline=2,Shadow=0,MarginV=36,Alignment=2"
    )
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-i", str(raw),
            "-vf", f"subtitles={OUT_SRT}:force_style='{style}'",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20",
            "-c:a", "copy",
            "-movflags", "+faststart",
            "-pix_fmt", "yuv420p",
            str(OUT_MP4),
        ],
        check=True,
    )
    print("wrote", OUT_MP4, "duration", round(off, 2))
    return off


def main() -> None:
    make_logo()
    # copy logo into the web app (and public folder for Vite)
    web_public = ROOT / "web" / "public"
    web_public.mkdir(parents=True, exist_ok=True)
    (web_public / "logo.png").write_bytes(LOGO.read_bytes())
    make_cover()
    total = build_video()
    probe = float(
        subprocess.check_output(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUT_MP4)],
            text=True,
        ).strip()
    )
    print("FINAL", OUT_MP4, f"{probe:.2f}s", OUT_MP4.stat().st_size, "bytes")
    if probe > 180:
        raise SystemExit(f"demo is {probe:.1f}s, over the 3 minute limit")
    # keep a small copy for gh-pages; recompress if over 8 MB
    if OUT_MP4.stat().st_size > 8_000_000:
        slim = WORK / "slim.mp4"
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error",
                "-i", str(OUT_MP4),
                "-c:v", "libx264", "-preset", "medium", "-crf", "26",
                "-c:a", "aac", "-b:a", "96k",
                "-movflags", "+faststart", "-pix_fmt", "yuv420p",
                str(slim),
            ],
            check=True,
        )
        slim.replace(OUT_MP4)
        probe = float(
            subprocess.check_output(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(OUT_MP4)],
                text=True,
            ).strip()
        )
        print("SLIM", OUT_MP4, f"{probe:.2f}s", OUT_MP4.stat().st_size, "bytes")


if __name__ == "__main__":
    main()
