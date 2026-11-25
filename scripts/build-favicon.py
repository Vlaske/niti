"""Rasterize the brand-style N. favicon SVG into PNG / ICO sizes."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SVG = ROOT / "public" / "brand" / "niti-favicon.svg"


def main() -> None:
    node = r"""
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const svg = fs.readFileSync(path.join('public','brand','niti-favicon.svg'));
async function render(size, out) {
  await sharp(svg, { density: Math.max(400, size * 8) })
    .resize(size, size, { fit: 'contain', background: { r: 28, g: 58, b: 46, alpha: 1 } })
    .png()
    .toFile(out);
  console.log('wrote', out, size);
}
(async () => {
  await render(512, path.join('public','brand','niti-icon-512.png'));
  await render(192, path.join('public','brand','niti-icon-192.png'));
  await render(180, path.join('public','brand','niti-apple.png'));
  await render(180, path.join('public','apple-touch-icon.png'));
  await render(180, path.join('src','app','apple-icon.png'));
  await render(64, path.join('public','brand','niti-favicon.png'));
  await render(64, path.join('src','app','icon.png'));
  await render(48, path.join('public','brand','niti-favicon-48.png'));
  await render(48, path.join('public','favicon.png'));
  await render(32, path.join('public','brand','niti-favicon-32.png'));
})().catch((e) => { console.error(e); process.exit(1); });
"""
    if not SVG.exists():
        raise SystemExit(f"missing {SVG}")

    subprocess.run(["node", "-e", node], cwd=ROOT, check=True)

    im16 = Image.open(ROOT / "public" / "brand" / "niti-favicon-32.png").convert("RGBA").resize(
        (16, 16), Image.Resampling.LANCZOS
    )
    im32 = Image.open(ROOT / "public" / "brand" / "niti-favicon-32.png").convert("RGBA")
    im48 = Image.open(ROOT / "public" / "favicon.png").convert("RGBA")
    ico = ROOT / "public" / "favicon.ico"
    im48.save(
        ico,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=[im16, im32],
    )
    (ROOT / "src" / "app" / "favicon.ico").write_bytes(ico.read_bytes())
    (ROOT / "public" / "brand" / "niti-favicon.ico").write_bytes(ico.read_bytes())
    print("ico ok", ico.stat().st_size)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        print(exc, file=sys.stderr)
        raise SystemExit(1)
