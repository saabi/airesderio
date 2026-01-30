# Chat Extraction Script

## Overview

The `extract_chat.py` script extracts and labels conversations from Qwen Chat HTML export files. It parses the HTML structure to identify user and assistant messages, extracts timestamps, and outputs the conversation in structured formats.

## Requirements

```bash
pip install beautifulsoup4
```

## Usage

### Basic Usage

```bash
python3 fe/scripts/extract_chat.py "path/to/chat.html"
```

This will create a JSON file with the same name as the input file (e.g., `chat.json`).

### Specify Output File

```bash
python3 fe/scripts/extract_chat.py "path/to/chat.html" -o "output.json"
```

### Output Formats

The script supports three output formats:

1. **JSON** (default): Structured data with all metadata
   ```bash
   python3 fe/scripts/extract_chat.py "chat.html" -f json -o "conversation.json"
   ```

2. **Text**: Human-readable format with message separators
   ```bash
   python3 fe/scripts/extract_chat.py "chat.html" -f txt -o "conversation.txt"
   ```

3. **CSV**: Spreadsheet-friendly format
   ```bash
   python3 fe/scripts/extract_chat.py "chat.html" -f csv -o "conversation.csv"
   ```

## Output Structure

### JSON Format

Each message in the JSON output contains:

```json
{
  "role": "user" | "assistant",
  "content": "Message text content",
  "message_id": "Unique message identifier",
  "timestamp": "Time string (for assistant messages)",
  "model": "Model name (for assistant messages, e.g., 'Qwen3-Max')"
}
```

### Text Format

Messages are separated with clear headers showing:
- Message number
- Role (USER/ASSISTANT)
- Timestamp (if available)
- Model name (for assistant messages)
- Content

### CSV Format

Columns:
- `message_number`: Sequential message number
- `role`: "user" or "assistant"
- `timestamp`: Timestamp string (if available)
- `model`: Model name (if available)
- `content`: Message content

## Examples

### Extract conversation to JSON

```bash
python3 fe/scripts/extract_chat.py "fe/static/tmp/Qwen Chat.html" -o "conversation.json"
```

### Extract to readable text file

```bash
python3 fe/scripts/extract_chat.py "fe/static/tmp/Qwen Chat.html" -f txt -o "conversation.txt"
```

### Extract to CSV for analysis

```bash
python3 fe/scripts/extract_chat.py "fe/static/tmp/Qwen Chat.html" -f csv -o "conversation.csv"
```

## Features

- **Automatic encoding detection**: Handles various file encodings gracefully
- **HTML parsing**: Extracts text from complex HTML structures
- **Message labeling**: Automatically identifies user vs assistant messages
- **Metadata extraction**: Captures timestamps, model names, and message IDs
- **Multiple formats**: Supports JSON, text, and CSV output
- **Error handling**: Gracefully handles missing dependencies and encoding issues

## Notes

- The script handles HTML files that may contain binary data (images) by using error-tolerant encoding
- User messages typically don't have timestamps in the Qwen Chat format
- The script preserves message order as they appear in the HTML
