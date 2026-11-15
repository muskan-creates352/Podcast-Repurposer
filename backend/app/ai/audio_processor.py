import os
import shutil
import subprocess
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

CONFIDENCE_THRESHOLD = 0.75  # Segments with confidence below this are flagged low_confidence = True


def is_ffmpeg_available() -> bool:
    """Checks whether ffmpeg executable is available on the system PATH."""
    return shutil.which("ffmpeg") is not None


def format_timestamp(seconds: float) -> str:
    """Converts seconds into MM:SS format for citations."""
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins:02d}:{secs:02d}"


def extract_audio_if_needed(file_path: str, output_dir: str = "uploads") -> str:
    """
    If the file is a video format, extracts the audio track using ffmpeg.
    If ffmpeg is not available or file is already audio, returns original path.
    """
    if not os.path.exists(file_path):
        return file_path

    _, ext = os.path.splitext(file_path)
    video_extensions = {".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv"}

    if ext.lower() not in video_extensions:
        return file_path

    if not is_ffmpeg_available():
        logger.warning("ffmpeg not detected on system; skipping audio track extraction.")
        return file_path

    base_name = os.path.splitext(os.path.basename(file_path))[0]
    extracted_audio_path = os.path.join(output_dir, f"{base_name}_extracted.mp3")

    try:
        cmd = [
            "ffmpeg",
            "-y",
            "-i", file_path,
            "-vn",
            "-acodec", "libmp3lame",
            "-ar", "16000",
            "-ac", "1",
            extracted_audio_path,
        ]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=60)
        if result.returncode == 0 and os.path.exists(extracted_audio_path):
            logger.info(f"Extracted audio track to {extracted_audio_path}")
            return extracted_audio_path
    except Exception as e:
        logger.warning(f"ffmpeg extraction failed ({e}), using original file.")

    return file_path


def split_audio_into_chunks(
    file_path: str,
    chunk_duration_sec: int = 300,
    output_dir: str = "uploads/chunks",
) -> List[Dict[str, Any]]:
    """
    Splits large audio files into sequential chunks if ffmpeg is available.
    Returns a list of chunk items: [{"path": chunk_path, "offset": start_seconds}].
    If file is small or ffmpeg is missing, returns single item with offset 0.0.
    """
    if not os.path.exists(file_path):
        return [{"path": file_path, "offset": 0.0}]

    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)

    # If small file (< 20MB) or ffmpeg is not present, process as single chunk
    if file_size_mb < 20.0 or not is_ffmpeg_available():
        return [{"path": file_path, "offset": 0.0}]

    os.makedirs(output_dir, exist_ok=True)
    base_name = os.path.splitext(os.path.basename(file_path))[0]
    chunk_pattern = os.path.join(output_dir, f"{base_name}_chunk_%03d.mp3")

    try:
        cmd = [
            "ffmpeg",
            "-y",
            "-i", file_path,
            "-f", "segment",
            "-segment_time", str(chunk_duration_sec),
            "-c", "copy",
            chunk_pattern,
        ]
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=120)

        # Locate created chunk files
        chunk_files = sorted(
            [os.path.join(output_dir, f) for f in os.listdir(output_dir) if f.startswith(f"{base_name}_chunk_")]
        )

        if chunk_files:
            return [
                {"path": f, "offset": float(i * chunk_duration_sec)}
                for i, f in enumerate(chunk_files)
            ]
    except Exception as e:
        logger.warning(f"Audio splitting failed: {e}. Falling back to single file processing.")

    return [{"path": file_path, "offset": 0.0}]


def merge_chunk_segments(
    chunks_results: List[Tuple[List[Dict[str, Any]], float]],
    confidence_threshold: float = CONFIDENCE_THRESHOLD,
) -> Tuple[List[Dict[str, Any]], bool]:
    """
    Merges segmented transcripts from multiple sequential chunks.
    Adjusts start and end timestamps by chunk offset:
      merged_start = offset + seg['start']
      merged_end = offset + seg['end']
    Sets low_confidence = True when segment confidence < threshold.
    Returns (merged_segments, overall_low_confidence).
    """
    merged: List[Dict[str, Any]] = []
    overall_low_confidence = False

    for segments, offset in chunks_results:
        for seg in segments:
            start_val = round(float(seg.get("start", 0.0)) + offset, 2)
            end_val = round(float(seg.get("end", 0.0)) + offset, 2)
            confidence_val = round(float(seg.get("confidence", 0.95)), 2)
            is_low = confidence_val < confidence_threshold

            if is_low:
                overall_low_confidence = True

            merged.append({
                "start": start_val,
                "end": end_val,
                "speaker": str(seg.get("speaker", "Speaker")),
                "text": str(seg.get("text", "")).strip(),
                "confidence": confidence_val,
                "low_confidence": is_low,
            })

    return merged, overall_low_confidence
