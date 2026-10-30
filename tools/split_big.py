"""Copy the math files into math/, splitting any file over GitHub's 100 MB limit into numbered parts.

    python tools/split_big.py <publish_files dir> <repo math dir>

A file under the limit is copied as it is. A bigger one becomes name.part00, name.part01, ... (95,000,000 bytes
each, the last one shorter); joined back in order they are byte-for-byte the original. The engine.io upload script
(up_tab.js) joins them in the browser and uploads the whole file under its real name."""
import hashlib, os, shutil, sys
LIMIT, PART = 99_000_000, 95_000_000
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for f in os.listdir(dst):   # start clean, so a file that shrank leaves no stale parts behind
    os.remove(os.path.join(dst, f))
for name in sorted(os.listdir(src)):
    p = os.path.join(src, name)
    if not os.path.isfile(p) or name.endswith((".orig", ".tmp")): continue
    size = os.path.getsize(p)
    if size <= LIMIT:
        shutil.copy2(p, os.path.join(dst, name)); print(f"{name:34s} {size:>12,d}  copied"); continue
    h, n = hashlib.md5(), 0
    with open(p, "rb") as fin:
        while True:
            chunk = fin.read(PART)
            if not chunk: break
            h.update(chunk)
            open(os.path.join(dst, f"{name}.part{n:02d}"), "wb").write(chunk); n += 1
    print(f"{name:34s} {size:>12,d}  split into {n} parts, md5 {h.hexdigest()}")
