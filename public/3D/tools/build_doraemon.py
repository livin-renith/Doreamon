#!/usr/bin/env python3
"""
Procedural, cartoon-styled Doraemon model built from clean parametric
surfaces and exported as a single self-contained GLB (PBR materials,
smooth normals, no external textures, identity transforms).

Run:  python tools/build_doraemon.py
Out:  doraemon.glb  (project root)
"""

import json
import math
import os
import struct

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "doraemon.glb")

# --------------------------------------------------------------------------
# materials
# --------------------------------------------------------------------------


def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_lin(h):
    h = h.lstrip("#")
    return [srgb_to_linear(int(h[i:i + 2], 16)) for i in (0, 2, 4)]


MATERIALS = {
    "Blue":        dict(color="#0AA3EA", metal=0.0, rough=0.38),
    "White":       dict(color="#FBFDFE", metal=0.0, rough=0.34),
    "Black":       dict(color="#15171D", metal=0.0, rough=0.22),
    "Red":         dict(color="#E1241B", metal=0.0, rough=0.34),
    "RedTail":     dict(color="#DE2A22", metal=0.0, rough=0.32),
    "Tongue":      dict(color="#E9666C", metal=0.0, rough=0.30),
    "MouthDark":   dict(color="#4B0F14", metal=0.0, rough=0.45),
    "Gold":        dict(color="#F7BC12", metal=0.85, rough=0.24),
    "GoldDark":    dict(color="#B47F06", metal=0.70, rough=0.34),
    "Pocket":      dict(color="#F5C33A", metal=0.0, rough=0.42),
    "PocketRim":   dict(color="#D9A01E", metal=0.0, rough=0.46),
    "EyeLine":     dict(color="#B7CBD9", metal=0.0, rough=0.50),
    "FaceSeam":    dict(color="#D5E5F0", metal=0.0, rough=0.45),
    "Glint":       dict(color="#FFFFFF", metal=0.0, rough=0.06),
}


# --------------------------------------------------------------------------
# mesh helpers
# --------------------------------------------------------------------------

PARTS = []


def add(mesh, mat):
    PARTS.append({"v": mesh["v"], "f": mesh["f"], "n": mesh["n"], "mat": mat})


def orient_faces(verts, faces, normals):
    """Make every triangle wind consistently with the supplied vertex normals."""
    p0 = verts[faces[:, 0]]
    p1 = verts[faces[:, 1]]
    p2 = verts[faces[:, 2]]
    fn = np.cross(p1 - p0, p2 - p0)
    vn = normals[faces].sum(axis=1)
    agree = np.einsum("ij,ij->i", fn, vn)
    if (agree < 0).mean() > 0.5:
        faces = faces[:, ::-1].copy()
    return faces


def mesh(verts, faces, normals):
    verts = np.asarray(verts, dtype=np.float64)
    normals = np.asarray(normals, dtype=np.float64)
    faces = np.asarray(faces, dtype=np.int64)
    # drop degenerate triangles (zero area)
    p0, p1, p2 = verts[faces[:, 0]], verts[faces[:, 1]], verts[faces[:, 2]]
    area = np.linalg.norm(np.cross(p1 - p0, p2 - p0), axis=1)
    faces = faces[area > 1e-12]
    faces = orient_faces(verts, faces, normals)
    # drop vertices that no triangle references
    used = np.unique(faces)
    if len(used) != len(verts):
        remap = np.full(len(verts), -1, dtype=np.int64)
        remap[used] = np.arange(len(used))
        verts = verts[used]
        normals = normals[used]
        faces = remap[faces]
    # unit-length normals
    ln = np.linalg.norm(normals, axis=1, keepdims=True)
    ok = ln[:, 0] > 1e-9
    normals[ok] = normals[ok] / ln[ok]
    return {"v": verts, "f": faces, "n": normals}


def rot_y_to(direction):
    """Rotation matrix mapping +Y onto `direction`."""
    d = np.asarray(direction, dtype=np.float64)
    d = d / (np.linalg.norm(d) + 1e-12)
    y = np.array([0.0, 1.0, 0.0])
    v = np.cross(y, d)
    c = float(np.dot(y, d))
    if np.linalg.norm(v) < 1e-9:
        if c > 0:
            return np.eye(3)
        return np.array([[1.0, 0.0, 0.0], [0.0, -1.0, 0.0], [0.0, 0.0, -1.0]])
    vx = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + vx + vx @ vx * (1.0 / (1.0 + c))


# --------------------------------------------------------------------------
# primitives
# --------------------------------------------------------------------------


def ellipsoid(center, radii, nu=64, nv=44, e=1.0, R=None):
    """Superellipsoid with analytic normals. e=1 -> ellipsoid, e<1 -> boxier."""
    c = np.asarray(center, dtype=np.float64)
    r = np.asarray(radii, dtype=np.float64)
    p_exp = 2.0 / e
    rings = []
    for j in range(1, nv):
        v = -math.pi / 2 + math.pi * j / nv
        sv, cv = math.sin(v), math.cos(v)
        sy = math.copysign(abs(sv) ** e, sv)
        cr = math.copysign(abs(cv) ** e, cv)
        ring = []
        for i in range(nu):
            u = 2 * math.pi * i / nu
            x = r[0] * cr * math.cos(u)
            y = r[1] * sy
            z = r[2] * cr * math.sin(u)
            nx = (p_exp / r[0]) * (abs(x) / r[0]) ** (p_exp - 1) * (1.0 if x >= 0 else -1.0)
            ny = (p_exp / r[1]) * (abs(y) / r[1]) ** (p_exp - 1) * (1.0 if y >= 0 else -1.0)
            nz = (p_exp / r[2]) * (abs(z) / r[2]) ** (p_exp - 1) * (1.0 if z >= 0 else -1.0)
            n = np.array([nx, ny, nz])
            ln = np.linalg.norm(n)
            n = n / ln if ln > 1e-12 else np.array([0.0, 1.0 if y >= 0 else -1.0, 0.0])
            ring.append((np.array([x, y, z]) + c, n))
        rings.append(ring)

    verts = [p for ring in rings for p, _ in ring]
    normals = [n for ring in rings for _, n in ring]
    nrings = len(rings)
    pole_bot = len(verts)
    verts.append(c + np.array([0.0, -r[1], 0.0]))
    normals.append(np.array([0.0, -1.0, 0.0]))
    pole_top = len(verts)
    verts.append(c + np.array([0.0, r[1], 0.0]))
    normals.append(np.array([0.0, 1.0, 0.0]))

    faces = []
    for j in range(nrings - 1):
        for i in range(nu):
            a = j * nu + i
            b = j * nu + (i + 1) % nu
            cc = (j + 1) * nu + (i + 1) % nu
            d = (j + 1) * nu + i
            faces.append([a, b, cc])
            faces.append([a, cc, d])
    for i in range(nu):
        faces.append([pole_bot, (i + 1) % nu, i])
        a = (nrings - 1) * nu + i
        b = (nrings - 1) * nu + (i + 1) % nu
        faces.append([pole_top, a, b])

    verts = np.array(verts)
    normals = np.array(normals)
    if R is not None:
        R = np.asarray(R, dtype=np.float64)
        verts = (R @ (verts - c).T).T + c
        normals = (R @ normals.T).T
    return mesh(verts, faces, normals)


def torus(center, major, tube, nu=96, nv=20, yscale=1.0, zscale=1.0):
    c = np.asarray(center, dtype=np.float64)
    verts = []
    normals = []
    for i in range(nu):
        u = 2 * math.pi * i / nu
        for j in range(nv):
            v = 2 * math.pi * j / nv
            sv, cv = math.sin(v), math.cos(v)
            x = (major + tube * cv) * math.cos(u)
            y = tube * sv
            z = (major + tube * cv) * math.sin(u)
            nx = cv * math.cos(u)
            ny = sv / yscale
            nz = cv * math.sin(u) / zscale
            n = np.array([nx, ny, nz])
            n /= np.linalg.norm(n)
            verts.append(np.array([x, y * yscale, z * zscale]) + c)
            normals.append(n)
    faces = []
    for i in range(nu):
        for j in range(nv):
            a = i * nv + j
            b = ((i + 1) % nu) * nv + j
            cc = ((i + 1) % nu) * nv + (j + 1) % nv
            d = i * nv + (j + 1) % nv
            faces.append([a, b, cc])
            faces.append([a, cc, d])
    return mesh(verts, faces, normals)


def grid_mesh(P, wrap_u=False, wrap_v=False, ref=None, flip=False):
    P = np.asarray(P, dtype=np.float64)
    R, C, _ = P.shape
    du = np.empty_like(P)
    if wrap_u:
        du = np.roll(P, -1, axis=1) - np.roll(P, 1, axis=1)
    else:
        du[:, 1:-1] = P[:, 2:] - P[:, :-2]
        du[:, 0] = P[:, 1] - P[:, 0]
        du[:, -1] = P[:, -1] - P[:, -2]
    dv = np.empty_like(P)
    if wrap_v:
        dv = np.roll(P, -1, axis=0) - np.roll(P, 1, axis=0)
    else:
        dv[1:-1] = P[2:] - P[:-2]
        dv[0] = P[1] - P[0]
        dv[-1] = P[-1] - P[-2]
    n = np.cross(du, dv)
    ln = np.linalg.norm(n, axis=-1, keepdims=True)
    verts = P.reshape(-1, 3)
    normals = n.reshape(-1, 3) / np.maximum(ln.reshape(-1, 1), 1e-12)
    if ref is not None:
        d = verts - np.asarray(ref, dtype=np.float64)
        if np.einsum("ij,ij->i", normals, d).sum() < 0:
            normals = -normals
    # degenerate grid corners have no cross product: fall back to the
    # outward direction from the patch centre
    bad = ~np.isfinite(normals).all(axis=1) | (np.linalg.norm(normals, axis=1) < 1e-6)
    if bad.any():
        if ref is not None:
            d = verts[bad] - np.asarray(ref, dtype=np.float64)
            nl = np.linalg.norm(d, axis=1, keepdims=True)
            normals[bad] = d / np.maximum(nl, 1e-9)
        else:
            normals[bad] = np.array([0.0, 0.0, 1.0])
    if flip:
        normals = -normals

    faces = []
    cols = range(C) if wrap_u else range(C - 1)
    rows = range(R) if wrap_v else range(R - 1)
    for r in rows:
        r2 = (r + 1) % R
        for c in cols:
            c2 = (c + 1) % C
            i0 = r * C + c
            i1 = r * C + c2
            i2 = r2 * C + c2
            i3 = r2 * C + c
            faces.append([i0, i1, i2])
            faces.append([i0, i2, i3])
    return mesh(verts, faces, normals)


def tube(points, radius, sides=12, caps=True):
    pts = np.asarray(points, dtype=np.float64)
    n = len(pts)
    tangents = np.empty_like(pts)
    tangents[0] = pts[1] - pts[0]
    tangents[-1] = pts[-1] - pts[-2]
    tangents[1:-1] = pts[2:] - pts[:-2]
    tangents /= np.linalg.norm(tangents, axis=1, keepdims=True) + 1e-12

    # parallel transport frames
    ref = np.array([0.0, 0.0, 1.0])
    if abs(np.dot(ref, tangents[0])) > 0.9:
        ref = np.array([0.0, 1.0, 0.0])
    u0 = np.cross(tangents[0], ref)
    u0 /= np.linalg.norm(u0)
    frames = [u0]
    for i in range(1, n):
        prev = frames[-1]
        t0, t1 = tangents[i - 1], tangents[i]
        axis = np.cross(t0, t1)
        s = np.linalg.norm(axis)
        if s < 1e-9:
            frames.append(prev)
        else:
            axis /= s
            ang = math.atan2(s, float(np.dot(t0, t1)))
            K = np.array([[0, -axis[2], axis[1]], [axis[2], 0, -axis[0]], [-axis[1], axis[0], 0]])
            Rm = np.eye(3) + math.sin(ang) * K + (1 - math.cos(ang)) * (K @ K)
            frames.append(Rm @ prev)

    verts = []
    normals = []
    for i in range(n):
        b = np.cross(tangents[i], frames[i])
        for k in range(sides):
            a = 2 * math.pi * k / sides
            nrm = math.cos(a) * frames[i] + math.sin(a) * b
            verts.append(pts[i] + radius * nrm)
            normals.append(nrm)
    faces = []
    for i in range(n - 1):
        for k in range(sides):
            a = i * sides + k
            b = i * sides + (k + 1) % sides
            cc = (i + 1) * sides + (k + 1) % sides
            d = (i + 1) * sides + k
            faces.append([a, b, cc])
            faces.append([a, cc, d])
    if caps:
        base = len(verts)
        verts.append(pts[0])
        normals.append(-tangents[0])
        for k in range(sides):
            faces.append([base, (k + 1) % sides, k])
        base = len(verts)
        verts.append(pts[-1])
        normals.append(tangents[-1])
        off = (n - 1) * sides
        for k in range(sides):
            faces.append([base, off + k, off + (k + 1) % sides])
    return mesh(verts, faces, normals)


# --------------------------------------------------------------------------
# facial surface mapping (all facial features live on the white face)
# --------------------------------------------------------------------------

HEAD_C = np.array([0.0, 2.60, 0.0])
HEAD_R = np.array([0.98, 0.98, 0.92])

FACE_C = np.array([0.0, 2.60, 0.36])
FACE_R = np.array([0.86, 0.86, 0.63])


def face_pt(u, v, off=0.0):
    u = np.asarray(u, dtype=np.float64)
    v = np.asarray(v, dtype=np.float64)
    w = np.sqrt(np.maximum(0.0, 1.0 - u * u - v * v))
    p = np.stack([FACE_R[0] * u, FACE_R[1] * v, FACE_R[2] * w], axis=-1) + FACE_C
    n = np.stack([u / FACE_R[0], v / FACE_R[1], w / FACE_R[2]], axis=-1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-12
    return p + n * off, n


def ellipsoid_point(center, radii, direction):
    c = np.asarray(center, dtype=np.float64)
    r = np.asarray(radii, dtype=np.float64)
    d = np.asarray(direction, dtype=np.float64)
    d = d / np.linalg.norm(d)
    t = 1.0 / math.sqrt(float(np.sum((d / r) ** 2)))
    p = c + d * t
    n = (p - c) / (r * r)
    n /= np.linalg.norm(n)
    return p, n


def ellipse_arc(center, rx, ry, tube_r, a0_deg, a1_deg, n=56, sides=9):
    a = np.radians(np.linspace(a0_deg, a1_deg, n))
    pts = np.stack([rx * np.cos(a), ry * np.sin(a), np.zeros_like(a)], axis=-1)
    pts = pts + np.asarray(center, dtype=np.float64)
    return tube(pts, tube_r, sides=sides)


def basis_from_normal(n):
    """Local frame with +Z along n."""
    z = np.asarray(n, dtype=np.float64)
    z /= np.linalg.norm(z)
    up = np.array([0.0, 1.0, 0.0])
    if abs(np.dot(z, up)) > 0.95:
        up = np.array([1.0, 0.0, 0.0])
    x = np.cross(up, z)
    x /= np.linalg.norm(x)
    y = np.cross(z, x)
    return np.column_stack([x, y, z])


# --------------------------------------------------------------------------
# build the character
# --------------------------------------------------------------------------


def build():
    # ---------------- head ----------------
    add(ellipsoid(HEAD_C, HEAD_R, nu=80, nv=56), "Blue")

    # white face plate (protrudes slightly, giving the soft “sticker” dome)
    add(ellipsoid(FACE_C, FACE_R, nu=68, nv=48), "White")

    # ---------------- eyes ----------------
    # big vertical ovals; their tops ride over the blue forehead so the
    # white-on-white edge still reads clearly
    eye_r = np.array([0.215, 0.295, 0.220])
    for sx in (-1.0, 1.0):
        ec = np.array([sx * 0.212, 3.155, 0.780])
        add(ellipsoid(ec, eye_r, nu=44, nv=32), "White")

        # pupil sits on the eyeball surface, flattened along its normal
        p, n = ellipsoid_point(ec, eye_r, (sx * 0.02, 0.015, 1.0))
        B = basis_from_normal(n)
        R = B  # local Z -> surface normal
        pc = p - n * 0.030
        add(ellipsoid(pc, (0.098, 0.126, 0.060), nu=36, nv=26, R=R), "Black")

        # cornea glint
        g = pc + n * 0.052 + B[:, 0] * (-0.034) + B[:, 1] * 0.052
        add(ellipsoid(g, (0.027, 0.027, 0.016), nu=20, nv=14, R=R), "Glint")

    # ---------------- nose ----------------
    nose_c, nose_n = face_pt(0.0, 0.335, 0.030)
    add(ellipsoid(nose_c, (0.125, 0.114, 0.112), nu=36, nv=26), "Red")
    add(ellipsoid(nose_c + np.array([-0.042, 0.047, 0.090]), (0.028, 0.028, 0.018),
                  nu=20, nv=14), "Glint")

    # ---------------- whiskers ----------------
    whiskers = [
        ((0.335, 0.105), (0.775, 0.205)),
        ((0.315, 0.000), (0.815, 0.020)),
        ((0.335, -0.105), (0.775, -0.185)),
    ]
    for a, b in whiskers:
        s = np.linspace(0.0, 1.0, 12)
        u = a[0] + (b[0] - a[0]) * s
        v = a[1] + (b[1] - a[1]) * s
        pts, _ = face_pt(u, v, 0.011)
        for sx in (-1.0, 1.0):
            p = pts.copy()
            p[:, 0] *= sx
            add(tube(p, 0.0115, sides=8), "Black")

    # ---------------- mouth ----------------
    mw = 0.455
    m_center = -0.415
    m_depth = 0.098

    def mouth_top(s):
        e = 2.0 * s - 1.0
        return m_center - 0.095 * (1.0 - e * e)

    def mouth_bottom(s):
        return mouth_top(s) - m_depth * np.sin(np.pi * s) ** 0.55

    s = np.linspace(0.0, 1.0, 64)
    t = np.linspace(0.0, 1.0, 10)
    S, T = np.meshgrid(s, t)
    Us = mw * (2.0 * S - 1.0)
    Vs = mouth_top(S) * (1.0 - T) + mouth_bottom(S) * T
    Pmouth, _ = face_pt(Us, Vs, 0.010)
    add(grid_mesh(Pmouth, ref=FACE_C), "MouthDark")

    # tongue, sitting inside the opening
    tc, tn = face_pt(0.0, mouth_bottom(0.5) + 0.040, 0.014)
    add(ellipsoid(tc, (0.178, 0.040, 0.050), nu=32, nv=20), "Tongue")

    # ---------------- face seam ----------------
    seam_v = np.linspace(0.160, mouth_top(0.5) + 0.022, 16)
    seam_u = np.zeros_like(seam_v)
    sp, _ = face_pt(seam_u, seam_v, 0.009)
    add(tube(sp, 0.0050, sides=7), "FaceSeam")

    # ---------------- body ----------------
    BODY_C = np.array([0.0, 1.13, 0.0])
    BODY_R = np.array([0.640, 0.710, 0.470])
    add(ellipsoid(BODY_C, BODY_R, nu=72, nv=52, e=0.80), "Blue")

    BELLY_C = np.array([0.0, 1.12, 0.20])
    BELLY_R = np.array([0.495, 0.540, 0.320])
    add(ellipsoid(BELLY_C, BELLY_R, nu=56, nv=42), "White")

    # ---------------- pocket ----------------
    def belly_pt(u, v, off=0.0):
        u = np.asarray(u, dtype=np.float64)
        v = np.asarray(v, dtype=np.float64)
        w = np.sqrt(np.maximum(0.0, 1.0 - u * u - v * v))
        p = np.stack([BELLY_R[0] * u, BELLY_R[1] * v, BELLY_R[2] * w], axis=-1) + BELLY_C
        n = np.stack([u / BELLY_R[0], v / BELLY_R[1], w / BELLY_R[2]], axis=-1)
        n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-12
        return p + n * off

    top_v = 0.045
    width = 0.700
    depth_v = (top_v - (-0.425))
    ps = np.linspace(0.0, 1.0, 46)
    pt = np.linspace(0.0, 1.0, 22)
    PS, PT = np.meshgrid(ps, pt)
    e = 2.0 * PS - 1.0
    uu = width * e
    vv = top_v - depth_v * np.sqrt(np.maximum(0.0, 1.0 - e * e)) * PT
    add(grid_mesh(belly_pt(uu, vv, 0.012), ref=BELLY_C), "PocketRim")
    uu2 = width * 0.935 * e
    vv2 = top_v - 0.012 - (depth_v * 0.935) * np.sqrt(np.maximum(0.0, 1.0 - e * e)) * PT
    add(grid_mesh(belly_pt(uu2, vv2, 0.031), ref=BELLY_C), "Pocket")

    # ---------------- collar + bell ----------------
    add(torus((0.0, 1.720, 0.0), 0.470, 0.086, nu=96, nv=20, yscale=0.72), "Red")

    bell_c = np.array([0.0, 1.540, 0.505])
    bell_r = 0.175
    add(ellipsoid(bell_c, (bell_r, bell_r, bell_r), nu=44, nv=30), "Gold")
    # engraved ring
    ring_y = bell_c[1] - 0.020
    rr = math.sqrt(max(0.0, bell_r ** 2 - (ring_y - bell_c[1]) ** 2)) + 0.001
    add(torus((0.0, ring_y, bell_c[2]), rr, 0.008, nu=56, nv=10, yscale=0.9), "GoldDark")
    # front slit
    ang = np.linspace(math.pi / 2 - 0.58, math.pi / 2 + 0.58, 18)
    slit_y = bell_c[1] - 0.088
    rs = math.sqrt(max(0.0, bell_r ** 2 - (slit_y - bell_c[1]) ** 2)) - 0.002
    slit = np.stack([rs * np.cos(ang), np.full_like(ang, slit_y),
                     bell_c[2] + rs * np.sin(ang)], axis=-1)
    add(tube(slit, 0.011, sides=8), "Black")

    # ---------------- arms + hands ----------------
    for sx in (-1.0, 1.0):
        sh = np.array([sx * 0.520, 1.480, 0.020])
        hd = np.array([sx * 0.880, 0.975, 0.080])
        mid = (sh + hd) * 0.5
        d = hd - sh
        L = np.linalg.norm(d)
        R = rot_y_to(d)
        add(ellipsoid(mid, (0.152, L * 0.55 + 0.118, 0.152), nu=36, nv=26, R=R), "Blue")
        add(ellipsoid(hd + (hd - sh) / L * 0.036, (0.190, 0.190, 0.181), nu=36, nv=26), "White")

    # ---------------- legs + feet ----------------
    for sx in (-1.0, 1.0):
        lc = np.array([sx * 0.255, 0.330, 0.015])
        add(ellipsoid(lc, (0.175, 0.280, 0.170), nu=36, nv=26), "Blue")
        fc = np.array([sx * 0.270, 0.150, 0.075])
        add(ellipsoid(fc, (0.265, 0.150, 0.305), nu=44, nv=30), "White")

    # ---------------- tail ----------------
    add(ellipsoid((0.0, 1.045, -0.500), (0.138, 0.138, 0.110), nu=36, nv=26), "RedTail")


# --------------------------------------------------------------------------
# GLB writer
# --------------------------------------------------------------------------


def export_glb(parts, path, name="Doraemon"):
    order = []
    by_mat = {}
    for p in parts:
        if p["mat"] not in by_mat:
            by_mat[p["mat"]] = []
            order.append(p["mat"])
        by_mat[p["mat"]].append(p)

    binary = bytearray()
    views = []
    accessors = []
    prims = []
    materials = []

    def add_view(data, target):
        off = len(binary)
        pad = (-off) % 4
        if pad:
            binary.extend(b"\0" * pad)
            off += pad
        binary.extend(data)
        views.append({
            "buffer": 0,
            "byteOffset": off,
            "byteLength": len(data),
            "target": target,
        })
        return len(views) - 1

    def add_accessor(view, ctype, count, atype, minmax=None):
        acc = {
            "bufferView": view,
            "componentType": ctype,
            "count": int(count),
            "type": atype,
        }
        if minmax:
            acc["min"] = minmax[0]
            acc["max"] = minmax[1]
        accessors.append(acc)
        return len(accessors) - 1

    for mi, mname in enumerate(order):
        props = MATERIALS[mname]
        materials.append({
            "name": mname,
            "pbrMetallicRoughness": {
                "baseColorFactor": [round(v, 6) for v in hex_lin(props["color"])] + [1.0],
                "metallicFactor": props["metal"],
                "roughnessFactor": props["rough"],
            },
        })

        vs, ns, fs = [], [], []
        base = 0
        for p in by_mat[mname]:
            vs.append(p["v"])
            ns.append(p["n"])
            fs.append(p["f"] + base)
            base += len(p["v"])
        v = np.concatenate(vs).astype(np.float32)
        n = np.concatenate(ns).astype(np.float32)
        f = np.concatenate(fs).reshape(-1).astype(np.uint32)

        pv = add_view(v.tobytes(), 34962)
        nv = add_view(n.tobytes(), 34962)
        fi = add_view(f.tobytes(), 34963)
        a_pos = add_accessor(pv, 5126, len(v), "VEC3",
                             (v.min(0).tolist(), v.max(0).tolist()))
        a_nrm = add_accessor(nv, 5126, len(n), "VEC3")
        a_idx = add_accessor(fi, 5125, int(f.size), "SCALAR")
        prims.append({
            "attributes": {"POSITION": a_pos, "NORMAL": a_nrm},
            "indices": a_idx,
            "material": mi,
            "mode": 4,
        })

    gltf = {
        "asset": {"version": "2.0", "generator": "Doraemon procedural builder"},
        "scene": 0,
        "scenes": [{"name": "Scene", "nodes": [0]}],
        "nodes": [{"name": name, "mesh": 0}],
        "meshes": [{"name": name, "primitives": prims}],
        "materials": materials,
        "accessors": accessors,
        "bufferViews": views,
        "buffers": [{"byteLength": len(binary)}],
    }

    js = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    js += b" " * ((4 - len(js) % 4) % 4)
    bin_bytes = bytes(binary)
    bin_bytes += b"\0" * ((4 - len(bin_bytes) % 4) % 4)

    total = 12 + 8 + len(js) + 8 + len(bin_bytes)
    with open(path, "wb") as fh:
        fh.write(struct.pack("<III", 0x46546C67, 2, total))
        fh.write(struct.pack("<II", len(js), 0x4E4F534A))
        fh.write(js)
        fh.write(struct.pack("<II", len(bin_bytes), 0x004E4942))
        fh.write(bin_bytes)
    return total, prims, materials


def main():
    build()

    # uniform scale to a real-world-ish height of 1.80 units, base at y=0
    allv = np.concatenate([p["v"] for p in PARTS])
    lo, hi = allv.min(0), allv.max(0)
    height = hi[1] - lo[1]
    s = 1.80 / height
    for p in PARTS:
        p["v"] = (p["v"] - np.array([0.0, lo[1], 0.0])) * s

    total, prims, materials = export_glb(PARTS, OUT)

    allv = np.concatenate([p["v"] for p in PARTS])
    tris = sum(len(p["f"]) for p in PARTS)
    verts = sum(len(p["v"]) for p in PARTS)
    print(f"wrote {OUT}")
    print(f"  size          : {total/1024:.1f} KiB")
    print(f"  primitives    : {len(prims)} (materials: {len(materials)})")
    print(f"  triangles     : {tris}")
    print(f"  vertices      : {verts}")
    print(f"  bounds min    : {np.round(allv.min(0), 4).tolist()}")
    print(f"  bounds max    : {np.round(allv.max(0), 4).tolist()}")
    print(f"  height        : {allv[:,1].max()-allv[:,1].min():.3f}")


if __name__ == "__main__":
    main()
