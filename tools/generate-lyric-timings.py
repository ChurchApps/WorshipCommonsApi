# Generates per-song word-timing JSON (karaoke sing-along) from Open Hymnal ABC sources.
# Aligns hymns-oh.ts chordPro words onto the ABC melody's lyric syllables (same
# machinery as backfill-chords.py), then maps note offsets through the trimmed
# tune.mid's tempo map so times match the frontend's parseMidi seconds exactly.
# The MIDI plays an optional instrumental intro then the notated score once per verse
# (sometimes plus an instrumental play-out pass): verse k starts near S1 + (k-1)*P,
# with S1/P recovered from abc2midi's re-emitted tempo events. abc2midi also stretches
# ticks at fermatas, so each lyric note is pinned to a real MIDI note-on by monotone
# greedy matching that absorbs the cumulative stretch. Songs where matching fails
# (internal repeats, D.C., text mismatch) are skipped — no lyrics.json means no
# sing-along button, never bad sync.
# Deps: pip install music21 mido; abc2xml.py from wim.vree.org/svgParse; OH abc corpus dir.
# Usage: python tools/generate-lyric-timings.py <abc2xml.py> <abc-dir> [--only "Title"]
import json, os, re, subprocess, sys, tempfile
from functools import lru_cache
from pathlib import Path

ABC2XML, ABCDIR = sys.argv[1], Path(sys.argv[2])
ONLY = sys.argv[4] if len(sys.argv) > 4 and sys.argv[3] == "--only" else None
DEBUG = os.environ.get("LT_DEBUG")
ROOT = Path(__file__).resolve().parent.parent
HYMNS_OH = ROOT / "src" / "seed-data" / "hymns-oh.ts"
MIDI_MAP = ROOT / "src" / "seed-data" / "midi-map.ts"
LYRIC_MAP = ROOT / "src" / "seed-data" / "lyric-map.ts"
MIDI_DIR = ROOT / "tools" / "seed-assets" / "midi"
OUT_DIR = ROOT / "tools" / "seed-assets" / "lyrics"

STRIP = re.compile(r"^\d+\.\s*")
CHORD = re.compile(r"\[[^\]]*\]")

def norm_word(w):
    return re.sub(r"[^a-z0-9]", "", w.lower())

def melody_streams(abc_path):
    # per lyric-number streams of words; each word = (syllables text, [(offset, dur_ql), ...])
    from music21 import converter
    with tempfile.TemporaryDirectory() as td:
        subprocess.run([sys.executable, ABC2XML, "-o", td, str(abc_path)],
                       capture_output=True, check=True)
        xml = next(Path(td).glob("*.xml"))
        score = converter.parse(str(xml))
    part = score.parts[0].stripTies()   # tied pairs are one note in the MIDI
    melody = [n for n in part.flatten().notes if n.isNote and n.lyrics]
    melody.sort(key=lambda n: float(n.offset))
    streams = {}
    for n in melody:
        off, dur = float(n.offset), float(n.duration.quarterLength)
        for lyr in n.lyrics:
            if not lyr.text:
                continue
            text = STRIP.sub("", lyr.text)
            st = streams.setdefault(lyr.number, {"words": [], "open": False})
            if st["open"] and st["words"]:
                t, notes = st["words"][-1]
                st["words"][-1] = (t + text, notes + [(off, dur)])
            else:
                st["words"].append((text, [(off, dur)]))
            st["open"] = lyr.syllabic in ("begin", "middle")
    onsets = sorted({float(n.offset) for n in melody})
    return {k: v["words"] for k, v in streams.items()}, onsets

def align_line(lw, words, cur):
    # edit-distance alignment of chordPro words onto stream words (see backfill-chords.py)
    W = words[cur:cur + len(lw) + 4]
    wnorm = [norm_word(w[0]) for w in W]
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
    timed, consumed = [], 0     # per lyric word: (text, [(off, dur), ...] possibly empty)
    for op, i, j in ops:
        if op == "m":
            timed.append((lw[i], W[j][1])); consumed = j + 1
        elif op == "g":
            timed.append((lw[i], W[j][1] + W[j + 1][1])); consumed = j + 2
        elif op == "sw":
            consumed = j + 1
        else:
            timed.append((lw[i], []))
    return cost, timed, cur + consumed

def align_song(chord_pro, streams):
    # walk chordPro stanzas, consuming stream words; returns aligned stanzas or None
    out = []
    cursors = {k: 0 for k in streams}
    for stanza in chord_pro.split("\n\n"):
        lines = [l for l in stanza.split("\n") if l.strip()]
        if not lines:
            continue
        label, body = lines[0], lines[1:]
        vm = re.match(r"Verse (\d+)$", label)
        verse_num = int(vm.group(1)) if vm else None
        st_lines = []
        for line in body:
            lw = CHORD.sub("", line).split()
            cands = [verse_num] if vm else sorted(streams)
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
                            best = (a, k)
                            break
                    if best:
                        break
            if best is None:
                if DEBUG:
                    print(f"  DBG no-align {label!r} {line[:60]!r}")
                return None
            (_, timed, new_cur), k = best
            st_lines.append(timed)
            cursors[k] = new_cur
        out.append({"label": label, "verse": verse_num, "lines": st_lines})
    return out

def merge_untimed(lines):
    # words with no note (importer split artifacts) glue onto a timed neighbor
    out = []
    for timed in lines:
        merged, pending = [], ""
        for text, notes in timed:
            if not notes:
                if merged:
                    merged[-1] = (merged[-1][0] + " " + text, merged[-1][1])
                else:
                    pending += text + " "
            else:
                merged.append((pending + text, notes))
                pending = ""
        if not merged:
            return None
        out.append(merged)
    return out

def midi_timing(midi_path):
    import mido
    mid = mido.MidiFile(midi_path)
    tpb = mid.ticks_per_beat
    tempos, span, melody_ticks = [], 0, []
    for track in mid.tracks:
        tick, ons = 0, []
        for msg in track:
            tick += msg.time
            if msg.type == "set_tempo":
                tempos.append((tick, msg.tempo))
            elif msg.type in ("note_on", "note_off"):
                span = max(span, tick)
                if msg.type == "note_on" and msg.velocity > 0:
                    ons.append(tick)
        if ons and not melody_ticks:
            melody_ticks = ons
    tempos.sort()

    def to_sec(tick):
        sec, prev, us = 0.0, 0, 500000
        for t, tempo in tempos:
            if t >= tick:
                break
            sec += (t - prev) / tpb * us / 1e6
            prev, us = t, tempo
        return sec + (tick - prev) / tpb * us / 1e6

    return tpb, span, to_sec, sorted(set(t for t, _ in tempos)), sorted(set(melody_ticks))

def match_pass(base, rel_onsets, melody_ticks, tpb):
    # pin each notated onset to an actual MIDI note-on, tracking the cumulative
    # fermata stretch; onsets are matched in order so the shift only accumulates
    import bisect
    shift, out = 0, {}
    for o in rel_onsets:
        exp = base + o + shift
        i = bisect.bisect_left(melody_ticks, exp - tpb // 8)
        best = None
        while i < len(melody_ticks) and melody_ticks[i] <= exp + 3 * tpb:
            t = melody_ticks[i]
            if best is None or abs(t - exp) < abs(best - exp):
                best = t
            i += 1
        if best is None or abs(best - exp) > tpb:
            return None
        out[o] = best
        shift = best - (base + o)
    return out

def find_structure(n_passes, rel_onsets, tempo_ticks, melody_ticks, span, tpb):
    # verse k starts near S + k*P; S/P candidates come from abc2midi's re-emitted
    # tempo events, verified by fully matching every pass's onsets to note-ons
    if not rel_onsets or not melody_ticks:
        return None
    starts = sorted({0, *tempo_ticks})
    diffs = [b - a for a, b in zip(starts, starts[1:])]
    periods = sorted(set(diffs), key=lambda d: -diffs.count(d)) if n_passes > 1 else [0]
    for S in starts:
        for P in periods:
            if n_passes > 1 and P < rel_onsets[-1]:
                continue
            if S + (n_passes - 1) * P + rel_onsets[-1] > span + 3 * tpb:
                continue
            passes = [match_pass(S + k * P, rel_onsets, melody_ticks, tpb) for k in range(n_passes)]
            if all(p is not None for p in passes):
                return passes
    return None

def build_json(aligned, verse_onsets_ql, tpb, span, to_sec, tempo_ticks, melody_ticks):
    n_passes = max([st["verse"] or 1 for st in aligned])
    verse_nums = sorted(st["verse"] for st in aligned if st["verse"])
    if verse_nums and verse_nums != list(range(1, n_passes + 1)):
        return None, f"non-contiguous verses {verse_nums}"

    rel_onsets = sorted({round(o * tpb) for o in verse_onsets_ql})
    passes = find_structure(n_passes, rel_onsets, tempo_ticks, melody_ticks, span, tpb)
    if not passes:
        return None, f"no onset-verified structure for {n_passes} passes"

    stanzas = []
    for pi, ticks in enumerate(passes):
        k = pi + 1
        sung = [st for st in aligned if st["verse"] in (k, None)] if n_passes > 1 else aligned
        sung = sorted(sung, key=lambda st: st["lines"][0][0][1][0][0])
        for st in sung:
            lines = []
            for words in st["lines"]:
                line = []
                for text, notes in words:
                    t0 = to_sec(ticks[round(notes[0][0] * tpb)])
                    t1 = to_sec(ticks[round(notes[-1][0] * tpb)] + round(notes[-1][1] * tpb))
                    line.append({"t": round(t0, 3), "d": round(t1 - t0, 3), "text": text})
                lines.append(line)
            stanzas.append({"label": st["label"], "lines": lines})

    flat = [w for st in stanzas for ln in st["lines"] for w in ln]
    if any(b["t"] < a["t"] for a, b in zip(flat, flat[1:])):
        return None, "non-monotonic times"
    if flat[-1]["t"] > to_sec(span) + 1:
        return None, "words past end of midi"
    return {"duration": round(to_sec(span), 3), "stanzas": stanzas}, None

def main():
    map_text = MIDI_MAP.read_text(encoding="utf-8")
    title_to_file = dict(re.findall(r'"((?:[^"\\]|\\.)*)": \{ file: "([^"]+)"', map_text))
    src = HYMNS_OH.read_text(encoding="utf-8")
    entry_re = re.compile(r't: ("(?:[^"\\]|\\.)*"),.*?chordPro: `((?:[^`\\]|\\.)*)`', re.S)
    OUT_DIR.mkdir(exist_ok=True)
    lyric_map, stats, failures = {}, {"done": 0, "skipped": 0, "no_abc": 0}, []

    for m in entry_re.finditer(src):
        title = json.loads(m.group(1))
        if ONLY and title != ONLY:
            continue
        body = m.group(2).replace("\\`", "`").replace("\\${", "${").replace("\\\\", "\\")
        fname = title_to_file.get(title, "??")
        abc = ABCDIR / fname.replace(".mid", ".abc")
        midi = MIDI_DIR / fname
        if not abc.exists() or not midi.exists():
            stats["no_abc"] += 1
            continue
        try:
            streams, verse_onsets_ql = melody_streams(abc)
            aligned = align_song(body, streams)
            if aligned:
                aligned = [{**st, "lines": merge_untimed(st["lines"])} for st in aligned]
                if any(st["lines"] is None for st in aligned):
                    aligned = None
            if not aligned:
                raise ValueError("alignment mismatch")
            tpb, span, to_sec, tempo_ticks, melody_ticks = midi_timing(str(midi))
            data, err = build_json(aligned, verse_onsets_ql, tpb, span, to_sec, tempo_ticks, melody_ticks)
            if err:
                raise ValueError(err)
        except Exception as e:
            failures.append(f"{title}: {e}")
            stats["skipped"] += 1
            continue
        out_name = fname.replace(".mid", ".json")
        (OUT_DIR / out_name).write_text(json.dumps(data), encoding="utf-8")
        lyric_map[title] = out_name
        stats["done"] += 1
        if ONLY:
            print(json.dumps(data, indent=1)[:2000])

    if not ONLY:
        entries = ",\n".join(f'  {json.dumps(t)}: {{ file: {json.dumps(f)} }}' for t, f in sorted(lyric_map.items())) + "\n"
        LYRIC_MAP.write_text(
            "// Generated by tools/generate-lyric-timings.py — word-level lyric timings for karaoke.\n"
            "// Maps song title → timing JSON in tools/seed-assets/lyrics/. Do not edit by hand.\n"
            "export const LYRIC_MAP: Record<string, { file: string }> = {\n" + entries + "};\n",
            encoding="utf-8")
    print(stats)
    for f in failures[:15]:
        print(" fail:", f)
    if len(failures) > 15:
        print(f" ... and {len(failures) - 15} more")

main()
