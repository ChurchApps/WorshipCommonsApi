# Trims dead air from MIDI files whose end_of_track sits far past the last note
# (an Open Hymnal export artifact). Rerun after any new MIDI import.
# Usage: pip install mido && python tools/trim-midi-tails.py <dir> [<dir>...]
import sys
from pathlib import Path
import mido

TAIL_BEATS = 2

def trim(path):
    m = mido.MidiFile(path)
    last_note = 0
    for tr in m.tracks:
        t = 0
        for msg in tr:
            t += msg.time
            if msg.type in ("note_on", "note_off"):
                last_note = max(last_note, t)
    if last_note == 0:
        return False
    limit = last_note + TAIL_BEATS * m.ticks_per_beat
    changed = False
    for tr in m.tracks:
        t = 0
        events = []
        for msg in tr:
            t += msg.time
            capped = min(t, limit)
            if capped != t:
                changed = True
            events.append((capped, msg))
        prev = 0
        for at, msg in events:
            msg.time = at - prev
            prev = at
    if changed:
        m.save(path)
    return changed

if __name__ == "__main__":
    dirs = [Path(d) for d in sys.argv[1:]]
    assert dirs, "pass one or more directories to scan"
    files = [f for d in dirs for f in d.rglob("*.mid")]
    trimmed = [f for f in files if trim(f)]
    print(f"trimmed {len(trimmed)} of {len(files)} files")
