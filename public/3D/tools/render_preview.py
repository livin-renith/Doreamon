#!/usr/bin/env python3
"""Offline preview renderer: rasterizes the same meshes used for the GLB.

Produces renders/views.png  — a 2x2 contact sheet (front, 3/4, side, back).
No GPU / GL required, so geometry can be checked deterministically.
"""

import math
import os
import sys
import zlib

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_doraemon import PARTS, MATERIALS, hex_lin, build  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def write_png(path, img):
    img = np.clip(img, 0, 255).astype(np.uint8)
    h, w, _ = img.shape
    raw = b"".join(b"\x00" + img[y].tobytes() for y in range(h))

    def chunk(tag, data):
        c = struct_pack(tag, data)
        return c

    def struct_pack(tag, data):
        return (len(data).to_bytes(4, "big") + tag + data +
                (zlib.crc32(tag + data) & 0xFFFFFFFF).to_bytes(4, "big"))

    png = b"\x89PNG\r\n\x1a\n"
    png += chunk(b"IHDR", w.to_bytes(4, "big") + h.to_bytes(4, "big") + bytes([8, 2, 0, 0, 0]))
    png += chunk(b"IDAT", zlib.compress(raw, 6))
    png += chunk(b"IEND", b"")
    with open(path, "wb") as fh:
        fh.write(png)


def aces(x):
    return np.clip((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0, 1)


def srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)


def render(parts, az_deg, el_deg, W, H, dist=4.55, target=(0.0, 0.90, 0.0), ss=2):
    W2, H2 = W * ss, H * ss
    bg = np.array([0.925, 0.950, 0.968], dtype=np.float32)
    color = np.tile(bg, (H2, W2, 1))
    zbuf = np.full((H2, W2), np.inf, dtype=np.float32)

    az, el = math.radians(az_deg), math.radians(el_deg)
    tgt = np.array(target, dtype=np.float64)
    eye = tgt + dist * np.array([math.sin(az) * math.cos(el),
                                 math.sin(el),
                                 math.cos(az) * math.cos(el)])
    fwd = tgt - eye
    fwd /= np.linalg.norm(fwd)
    right = np.cross(fwd, np.array([0.0, 1.0, 0.0]))
    right /= np.linalg.norm(right)
    up = np.cross(right, fwd)

    focal = (H2 / 2.0) / math.tan(math.radians(31.0) / 2.0)

    L1 = np.array([-0.42, 0.72, 0.55]); L1 /= np.linalg.norm(L1)
    L2 = np.array([0.70, 0.20, 0.55]); L2 /= np.linalg.norm(L2)
    HV = (L1 + np.array([0, 0, 1.0])); HV /= np.linalg.norm(HV)

    for part in parts:
        v = part["v"]
        n = part["n"]
        f = part["f"]
        alb = np.array(hex_lin(MATERIALS[part["mat"]]["color"]), dtype=np.float32)
        metal = MATERIALS[part["mat"]]["metal"]
        rough = MATERIALS[part["mat"]]["rough"]

        rel = v - eye
        cz = rel @ fwd
        cx = rel @ right
        cy = rel @ up
        ok = cz > 0.15
        sx = W2 / 2.0 + cx / np.maximum(cz, 1e-6) * focal
        sy = H2 / 2.0 - cy / np.maximum(cz, 1e-6) * focal

        # view-space normals for lighting (fixed key light)
        nz = n @ fwd
        nx = n @ right
        ny = n @ up

        for tri in f:
            if not (ok[tri[0]] and ok[tri[1]] and ok[tri[2]]):
                continue
            a, b, c = tri
            x0, y0 = sx[a], sy[a]
            x1, y1 = sx[b], sy[b]
            x2, y2 = sx[c], sy[c]
            minx = max(0, int(math.floor(min(x0, x1, x2))))
            maxx = min(W2 - 1, int(math.ceil(max(x0, x1, x2))))
            miny = max(0, int(math.floor(min(y0, y1, y2))))
            maxy = min(H2 - 1, int(math.ceil(max(y0, y1, y2))))
            if minx > maxx or miny > maxy:
                continue
            area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)
            if abs(area) < 1e-12:
                continue
            px = np.arange(minx, maxx + 1) + 0.5
            py = np.arange(miny, maxy + 1) + 0.5
            gx, gy = np.meshgrid(px, py)
            w0 = ((x1 - gx) * (y2 - gy) - (x2 - gx) * (y1 - gy)) / area
            w1 = ((x2 - gx) * (y0 - gy) - (x0 - gx) * (y2 - gy)) / area
            w2 = 1.0 - w0 - w1
            inside = (w0 >= -1e-6) & (w1 >= -1e-6) & (w2 >= -1e-6)
            if not inside.any():
                continue
            iz = w0 / cz[a] + w1 / cz[b] + w2 / cz[c]
            zz = 1.0 / np.maximum(iz, 1e-9)
            sub = zbuf[miny:maxy + 1, minx:maxx + 1]
            mask = inside & (zz < sub)
            if not mask.any():
                continue
            nn = (w0[..., None] * n[a] + w1[..., None] * n[b] + w2[..., None] * n[c])
            nn /= np.linalg.norm(nn, axis=-1, keepdims=True) + 1e-9
            nz_ = nn @ fwd
            nx_ = nn @ right
            ny_ = nn @ up
            lam = np.clip(nx_ * L1[0] + ny_ * L1[1] + nz_ * L1[2], 0, 1)
            lam2 = np.clip(nx_ * L2[0] + ny_ * L2[1] + nz_ * L2[2], 0, 1)
            shade = 0.34 + 0.86 * lam + 0.30 * lam2
            spec = np.power(np.clip(nz_, 0, 1), 8.0) * (0.30 + 0.55 * (1.0 - rough))
            base = alb[None, None, :] * shade[..., None] + spec[..., None] * 0.9
            base = base * (1.0 - 0.25 * metal) + (0.75 * metal) * np.power(
                np.clip(nz_, 0, 1), 4.0)[..., None] * alb[None, None, :]
            sub[mask] = zz[mask]
            block = color[miny:maxy + 1, minx:maxx + 1]
            block[mask] = base[mask]

    out = aces(color)
    out = srgb(out)
    out = (out * 255).astype(np.uint8)
    # box downsample
    out = out.reshape(H, ss, W, ss, 3).astype(np.float32).mean(axis=(1, 3))
    return np.clip(out, 0, 255).astype(np.uint8)


def main():
    build()
    allv = np.concatenate([p["v"] for p in PARTS])
    lo = allv.min(0)
    s = 1.80 / (allv[:, 1].max() - allv[:, 1].min())
    for p in PARTS:
        p["v"] = (p["v"] - np.array([0.0, lo[1], 0.0])) * s

    target = (0.0, 0.90, 0.0)
    if "face" in sys.argv:
        W, H, ss = 640, 640, 2
        views = [(0, 0), (26, 6)]
        name = "face.png"
        target = (0.0, 1.33, 0.0)
    elif "quick" in sys.argv:
        W, H, ss = 520, 640, 1
        views = [(0, 0), (34, 7)]
        name = "quick.png"
    else:
        W, H, ss = 620, 760, 2
        views = [(0, 0), (34, 7), (90, 0), (180, 0)]
        name = "views.png"

    cols = 2
    rows = (len(views) + cols - 1) // cols
    sheet = np.zeros((H * rows, W * cols, 3), dtype=np.uint8)
    for i, (az, el) in enumerate(views):
        dist = 2.05 if target[1] > 1.0 else 4.35
        img = render(PARTS, az, el, W, H, dist=dist, target=target, ss=ss)
        r, c = divmod(i, cols)
        sheet[r * H:(r + 1) * H, c * W:(c + 1) * W] = img
        print("rendered", az, el)
    os.makedirs(os.path.join(ROOT, "renders"), exist_ok=True)
    path = os.path.join(ROOT, "renders", name)
    write_png(path, sheet)
    print("wrote", path)


if __name__ == "__main__":
    main()
