import { Song } from "../models";

// chordPro format: stanzas separated by blank lines; first line of each stanza is its label; chords inline as [D]
export class ChordProHelper {
  static slug(title: string) {
    return (title || "song").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  static toCho(song: Song) {
    const lines = [`{title: ${song.title}}`, `{artist: ${song.writer}}`, `{key: ${song.songKey}}`];
    if (song.bpm) lines.push(`{tempo: ${song.bpm}}`);
    lines.push("");
    for (const stanza of (song.chordPro || "").split(/\r?\n\s*\r?\n/)) {
      const stanzaLines = stanza.split(/\r?\n/).filter(l => l.trim() !== "");
      if (stanzaLines.length === 0) continue;
      lines.push(`{comment: ${stanzaLines[0].trim()}}`);
      lines.push(...stanzaLines.slice(1));
      lines.push("");
    }
    return lines.join("\n");
  }

  static toLyrics(song: Song) {
    const lines = [song.title || "", song.writer ? `Words and music by ${song.writer}` : "", ""];
    for (const stanza of (song.chordPro || "").split(/\r?\n\s*\r?\n/)) {
      const stanzaLines = stanza.split(/\r?\n/).filter(l => l.trim() !== "");
      if (stanzaLines.length === 0) continue;
      lines.push(stanzaLines[0].trim());
      lines.push(...stanzaLines.slice(1).map(l => l.replace(/\[[^\]]*\]/g, "")));
      lines.push("");
    }
    return lines.join("\n");
  }
}
