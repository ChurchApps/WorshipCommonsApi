import OpenAI from "openai";
import { Environment } from "./Environment";
import { Song } from "../models";

export class QualityHelper {
  private static client: OpenAI | null = null;

  public static heuristicScore(song: Song): number {
    let pts = 0;
    if (song.demoAudioUrl) pts += 8;
    if (song.sheetPdfUrl) pts += 6;
    if (song.stemsZipUrl) pts += 6;
    if (song.scripture) pts += 4;
    if (song.themes) pts += 4;
    if (song.bpm) pts += 3;
    if (song.songKey) pts += 3;
    pts += this.chordProScore(song.chordPro || "");
    return pts;
  }

  // ponytail: naive text stats — real chordpro parser if this misjudges songs
  private static chordProScore(cp: string): number {
    const lyrics = cp.replace(/\[[^\]]*\]/g, "").replace(/\{[^}]*\}/g, "");
    const lines = lyrics.split("\n").map((l) => l.trim()).filter(Boolean);
    let pts = 0;
    if (lyrics.length > 300) pts += 2;
    if (lines.length > 0 && (cp.match(/\[[A-G][#b]?[^\]]*\]/g) || []).length >= lines.length * 0.5) pts += 2;
    if (lines.length > 4 && new Set(lines).size / lines.length >= 0.4) pts += 2;
    return pts;
  }

  public static async llmScore(song: Song): Promise<{ llm: number; detail: any }> {
    if (!this.client) this.client = new OpenAI({ apiKey: Environment.openAiApiKey });
    const lyrics = (song.chordPro || "").replace(/\[[^\]]*\]/g, "").slice(0, 6000);
    const res = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You review worship song lyrics submitted to a shared church song library. Score each dimension 0-15 (15 best):\n" +
            "coherence: lyrics make sense, consistent imagery and viewpoint\n" +
            "depth: theological/emotional substance, not just stock phrases\n" +
            "craft: intentional structure and repetition; penalize filler or endless copy-paste\n" +
            "authenticity: penalize AI-generated tells (generic vocabulary, rhyme-forced nonsense, buzzword mashups)\n" +
            'Reply ONLY JSON: {"coherence":n,"depth":n,"craft":n,"authenticity":n,"notes":"one sentence for a human reviewer"}'
        },
        { role: "user", content: `Title: ${song.title}\nWriter: ${song.writer || "unknown"}\n\n${lyrics}` }
      ]
    });
    const d = JSON.parse(res.choices[0]?.message?.content || "{}");
    const clamp = (n: any) => Math.max(0, Math.min(15, Number(n) || 0));
    const llm = Math.round(clamp(d.coherence) + clamp(d.depth) + clamp(d.craft) + clamp(d.authenticity));
    return { llm, detail: d };
  }

  public static async score(song: Song): Promise<Partial<Song>> {
    try {
      const heuristic = this.heuristicScore(song);
      const { llm, detail } = await this.llmScore(song);
      return { qualityScore: heuristic + llm, qualityDetail: JSON.stringify({ heuristic, llm, ...detail }) };
    } catch (e) {
      console.error("Quality scoring failed", song.id, e);
      return {};
    }
  }
}
