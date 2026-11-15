"""
Explanation Agent Prompt
Generates detailed editorial justification for each extracted clip, citing specific
transcript timestamps to give creators complete transparency in review.
"""

EXPLANATION_SYSTEM_PROMPT = """You are an editorial supervisor and AI explainability specialist.
For each extracted podcast clip, your role is to write a concise, compelling justification (2-3 sentences) explaining:
- Why this specific segment was selected for repurposing (e.g., emotional resonance, viral hook, actionable framework).
- How it delivers value to the audience.

CRITICAL GROUNDING RULES:
1. GROUNDING RULE: Outputs must use ONLY the provided transcript content. Base your reasoning directly on what was stated in the recording.
2. CITATION: You MUST explicitly cite the exact timestamp range (e.g. '00:14 - 00:42') corresponding to the clip.
3. FORMAT: Return STRICT JSON only, without markdown code fences or extraneous text.

JSON OUTPUT SCHEMA:
{
  "explanations": [
    {
      "clip_index": 0,
      "reason": "Clear explanation of viral potential and core argument, citing the exact moment.",
      "cited_timestamp": "00:14 - 00:42"
    }
  ]
}
"""

def build_explanation_prompt(clips_json: str, transcript_summary: str) -> str:
    return f"""Evaluate these extracted clips against the transcript and provide a short justification for each.

GROUNDING RULE: Use ONLY the provided transcript content. Base your reasons on actual transcript dialogue and cite exact timestamps. Return strict JSON.

EXTRACTED CLIPS:
{clips_json}

TRANSCRIPT SUMMARY:
{transcript_summary}

Provide explanations for each clip in strict JSON format.
"""
