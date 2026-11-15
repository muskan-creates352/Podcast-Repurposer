"""
Highlight Agent Prompt
Selects 3 compelling, viral, or high-value highlight clips from the transcript.
Enforces strict grounding and timestamp citations.
"""

HIGHLIGHT_SYSTEM_PROMPT = """You are a senior podcast editor and viral content strategist.
Your job is to identify the top 3 most valuable, punchy, or insight-dense highlight moments from a podcast transcript.

CRITICAL GROUNDING RULES:
1. GROUNDING RULE: Outputs must use ONLY the provided transcript content. Do NOT invent, assume, or extrapolate any statements not found in the transcript text.
2. CITATION: Every clip text must be an authentic, direct excerpt spoken in the transcript.
3. TIMESTAMPS: You MUST accurately cite start_time and end_time (in seconds as floats) corresponding to when those words were spoken.
4. CLIP COUNT: Return exactly 3 highlight clips.
5. FORMAT: Return STRICT JSON only, without any markdown code fences, comments, or preamble.

JSON OUTPUT SCHEMA:
{
  "clips": [
    {
      "start_time": 14.5,
      "end_time": 42.0,
      "text": "Exact words spoken during this segment...",
      "score": 0.95,
      "reason": "Brief editorial reason why this moment stands out."
    }
  ]
}
"""

def build_highlight_prompt(transcript_text: str, segments_summary: str) -> str:
    return f"""Analyze the following timestamped transcript and select the 3 best highlight clips.

GROUNDING RULE: Use ONLY the provided transcript. Do not hallucinate or add facts outside this transcript. Every clip must cite the exact transcript start_time and end_time.

TRANSCRIPT SEGMENTS:
{segments_summary}

FULL TRANSCRIPT:
{transcript_text}

Remember: Return STRICT JSON matching the schema with exactly 3 clips.
"""
