# Backfills inline chord symbols into hymns-oh.ts chordPro from Open Hymnal ABC sources.
# Chords are detected from the PD four-part harmony (chordify) and placed at the exact
# syllable via the ABC lyric alignment; output stays PD.
# Deps: pip install music21; abc2xml.py from wim.vree.org/svgParse.
# Usage: python tools/backfill-chords.py <abc2xml.py> tools/seed-assets/abc [--only "Title"]
import re, subprocess, sys, tempfile
from pathlib import Path

ABC2XML, ABCDIR = sys.argv[1], Path(sys.argv[2])
ONLY = sys.argv[4] if len(sys.argv) > 4 and sys.argv[3] == "--only" else None
ROOT = Path(__file__).resolve().parent.parent
HYMNS_OH = ROOT / "src" / "seed-data" / "hymns-oh.ts"
MIDI_MAP = ROOT / "src" / "seed-data" / "midi-map.ts"

SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
FLAT_KEYS = {"F", "Bb", "Eb", "Ab", "Db", "Gb", "Dm", "Gm", "Cm", "Fm", "Bbm"}
QUALITIES = [  # (intervals from root, suffix) — first full match wins
    ((0, 4, 7, 10), "7"), ((0, 3, 7, 10), "m7"), ((0, 4, 7, 11), "maj7"),
    ((0, 4, 7), ""), ((0, 3, 7), "m"), ((0, 3, 6), "dim"), ((0, 4, 8), "aug"),
]

def chord_name(pcs, bass_pc, flats):
    names = FLAT if flats else SHARP
    best = None
    for root in sorted(pcs):
        rel = frozenset((p - root) % 12 for p in pcs)
        for ivs, suffix in QUALITIES:
            covered = rel & set(ivs)
            if 0 not in covered or rel - set(ivs):
                continue
            score = (len(covered), root == bass_pc, -len(ivs))
            if best is None or score > best[0]:
                best = (score, names[root] + suffix)
    return best[1] if best else None

def analyze(abc_path):
    from music21 import converter, stream, meter
    with tempfile.TemporaryDirectory() as td:
        subprocess.run([sys.executable, ABC2XML, "-o", td, str(abc_path)],
                       capture_output=True, check=True)
        xml = next(Path(td).glob("*.xml"))
        score = converter.parse(str(xml))
    slices = []
    for c in score.chordify().flatten().notes:
        slices.append((float(c.offset), {p.pitch.pitchClass for p in c.notes} if hasattr(c, "notes") else {p.pitchClass for p in c.pitches},
                       min(p.midi for p in c.pitches) % 12))
    slices.sort()
    bars, beats = [], []
    for m in score.parts[0].getElementsByClass(stream.Measure):
        ts = m.getContextByClass(meter.TimeSignature)
        bar = float(ts.barDuration.quarterLength) if ts else 4.0
        step = float(ts.beatDuration.quarterLength) if ts else 1.0
        off = float(m.offset)
        bars.append(off)
        b = 0.0
        while b < bar - 1e-6:
            beats.append(off + b)
            b += step
    bars.sort(); beats.sort()
    melody = [n for n in score.parts[0].flatten().notes if n.isNote and n.lyrics]
    melody.sort(key=lambda n: float(n.offset))
    return slices, bars, beats, melody

def chord_at(slices, offset):
    active = None
    for off, pcs, bass in slices:
        if off > offset + 1e-6:
            break
        active = (pcs, bass)
    return active

STRIP = re.compile(r"^\d+\.\s*")
def norm_word(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())

PASSING = ("dim", "aug")

def build_streams(slices, bars, beats, melody, flats):
    # per lyric-number streams of words; each word = [(chord|None, syllable), ...]
    import bisect
    bar_set = set(bars)
    streams = {}
    for n in melody:
        off = float(n.offset)
        i = bisect.bisect_right(beats, off + 1e-6) - 1
        sample = beats[i] if i >= 0 else off
        active = chord_at(slices, sample)
        sym = chord_name(active[0], active[1], flats) if active else None
        # passing chords (dim/aug) off the bar line: fall back to the bar's harmony
        if sym and sym.endswith(PASSING) and sample not in bar_set:
            j = bisect.bisect_right(bars, off + 1e-6) - 1
            active = chord_at(slices, bars[j]) if j >= 0 else active
            sym = chord_name(active[0], active[1], flats) if active else None
        for lyr in n.lyrics:
            if not lyr.text:
                continue
            text = STRIP.sub("", lyr.text)
            st = streams.setdefault(lyr.number, {"words": [], "last": None, "open": False})
            chord = sym if sym and sym != st["last"] else None
            if chord:
                st["last"] = sym
            if st["open"] and st["words"]:
                st["words"][-1].append((chord, text))
            else:
                st["words"].append([(chord, text)])
            st["open"] = lyr.syllabic in ("begin", "middle")
    return {k: v["words"] for k, v in streams.items()}

def render_line(words):
    out = []
    for word in words:
        out.append("".join((f"[{c}]" if c else "") + s for c, s in word))
    return " ".join(out)

import os
from functools import lru_cache
DEBUG = os.environ.get("BF_DEBUG")

def align_line(lw, words, cur):
    # edit-distance alignment of lyric words onto stream words; tolerates the
    # importer's glued words (merge) and stray stream words (skip)
    W = words[cur:cur + len(lw) + 4]
    wnorm = [norm_word("".join(s for _, s in w)) for w in W]
    lnorm = [norm_word(a) for a in lw]

    @lru_cache(maxsize=None)
    def dp(i, j):
        if i == len(lw):
            return 0, ()
        best = None
        if j < len(W):
            c, ops = dp(i + 1, j + 1)
            cand = (c + (0 if lnorm[i] == wnorm[j] else 1), (("m", i, j),) + ops)
            best = cand if best is None or cand < best else best
        if j + 1 < len(W) and lnorm[i] == wnorm[j] + wnorm[j + 1]:
            c, ops = dp(i + 1, j + 2)
            cand = (c, (("g", i, j),) + ops)
            best = cand if best is None or cand < best else best
        if j < len(W):
            c, ops = dp(i, j + 1)
            cand = (c + 1, (("sw", i, j),) + ops)
            best = cand if best is None or cand < best else best
        c, ops = dp(i + 1, j)
        cand = (c + 1, (("sl", i, j),) + ops)
        return cand if best is None or cand < best else best

    cost, ops = dp(0, 0)
    if cost > max(1, len(lw) // 5):
        return None
    rendered, consumed = [], 0
    for op, i, j in ops:
        if op == "m":
            rendered.append(W[j]); consumed = j + 1
        elif op == "g":
            rendered.append(W[j] + W[j + 1]); consumed = j + 2
        elif op == "sw":
            consumed = j + 1
        else:
            rendered.append([(None, lw[i])])
    return cost, rendered, cur + consumed

def annotate(chord_pro, streams):
    # walk existing stanzas, consuming words from the matching stream
    stanzas = chord_pro.split("\n\n")
    cursors = {k: 0 for k in streams}
    out_stanzas = []
    for stanza in stanzas:
        lines = stanza.split("\n")
        label, body = lines[0], lines[1:]
        vm = re.match(r"Verse (\d+)$", label)
        new_body = []
        for line in body:
            lw = line.split()
            cands = [int(vm.group(1))] if vm else sorted(streams)
            best = None
            for k in cands:
                if k not in streams:
                    continue
                a = align_line(lw, streams[k], cursors[k])
                if a and (best is None or a[0] < best[0][0]):
                    best = (a, k)
            if best is None:
                # refrain-first tunes: the line may sit elsewhere in the stream
                for k in cands:
                    if k not in streams:
                        continue
                    for start in range(len(streams[k])):
                        a = align_line(lw, streams[k], start)
                        if a and a[0] == 0:
                            if best is None or a[0] < best[0][0]:
                                best = (a, k)
                            break
            if best is None:
                if DEBUG:
                    near = {k: [" ".join(s for _, s in w) for w in streams[k][cursors[k]:cursors[k] + len(lw)]] for k in streams}
                    print(f"  DBG {label!r} line {line[:50]!r} cursors={cursors} near={near}")
                return None
            (_, rendered, new_cur), k = best
            new_body.append(render_line(rendered))
            cursors[k] = new_cur
        out_stanzas.append("\n".join([label] + new_body))
    return "\n\n".join(out_stanzas)

def main():
    map_text = MIDI_MAP.read_text(encoding="utf-8")
    title_to_file = dict(re.findall(r'"((?:[^"\\]|\\.)*)": \{ file: "([^"]+)"', map_text))
    src = HYMNS_OH.read_text(encoding="utf-8")
    entry_re = re.compile(r'(t: ("(?:[^"\\]|\\.)*"),.*?chordPro: `)((?:[^`\\]|\\.)*)(`)', re.S)
    stats = {"done": 0, "skipped": 0, "no_abc": 0, "has_chords": 0}
    failures = []

    def process(m):
        import json
        title = json.loads(m.group(2))
        body = m.group(3).replace("\\`", "`").replace("\\${", "${").replace("\\\\", "\\")
        if ONLY and title != ONLY:
            return m.group(0)
        if "[" in body:
            stats["has_chords"] += 1
            return m.group(0)
        abc = ABCDIR / title_to_file.get(title, "??").replace(".mid", ".abc")
        if not abc.exists():
            stats["no_abc"] += 1
            return m.group(0)
        try:
            slices, bars, beats, melody = analyze(abc)
            key_m = re.search(r'k: "([^"]+)"', m.group(0))
            flats = key_m.group(1) in FLAT_KEYS if key_m else False
            annotated = annotate(body, build_streams(slices, bars, beats, melody, flats))
        except Exception as e:
            failures.append(f"{title}: {type(e).__name__} {e}")
            stats["skipped"] += 1
            return m.group(0)
        if not annotated:
            failures.append(f"{title}: alignment mismatch")
            stats["skipped"] += 1
            return m.group(0)
        stats["done"] += 1
        esc = annotated.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
        return m.group(1) + esc + m.group(4)

    out = entry_re.sub(process, src)
    if not ONLY:
        HYMNS_OH.write_text(out, encoding="utf-8")
    else:
        print(entry_re.search(out) and "preview:\n" + [mm for mm in entry_re.finditer(out) if ONLY in mm.group(2)][0].group(3)[:1200])
    print(stats)
    for f in failures[:15]:
        print(" fail:", f)
    if len(failures) > 15:
        print(f" ... and {len(failures) - 15} more")

main()
