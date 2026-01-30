#!/usr/bin/env python3
"""
Extract and label conversation from Qwen Chat HTML file.

This script parses a Qwen Chat HTML export and extracts the conversation
with proper labeling of user and assistant messages, including timestamps.

Requirements:
    pip install beautifulsoup4
"""

import re
import json
import argparse
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional

try:
    from bs4 import BeautifulSoup, Tag, NavigableString
except ImportError:
    print("Error: beautifulsoup4 is required. Install it with:")
    print("  pip install beautifulsoup4")
    sys.exit(1)


def clean_text(text: str) -> str:
    """Clean extracted text by removing extra whitespace."""
    if not text:
        return ""
    # Replace multiple whitespace with single space
    text = re.sub(r'\s+', ' ', text)
    # Remove leading/trailing whitespace
    text = text.strip()
    return text


def extract_text_from_element(element: Tag) -> str:
    """Extract all text content from an HTML element, preserving structure."""
    if not element:
        return ""
    
    text_parts = []
    
    for content in element.descendants:
        if isinstance(content, NavigableString):
            text = str(content).strip()
            if text:
                text_parts.append(text)
        elif isinstance(content, Tag):
            # Handle specific markdown elements
            tag_name = content.name.lower()
            
            if tag_name == 'p':
                text_parts.append('\n')
            elif tag_name in ['br', 'div']:
                text_parts.append('\n')
            elif tag_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                text_parts.append('\n\n')
            elif tag_name == 'li':
                text_parts.append('\n- ')
            elif tag_name == 'blockquote':
                text_parts.append('\n> ')
            elif tag_name == 'code':
                text_parts.append('`')
            elif tag_name == 'strong':
                text_parts.append('**')
            elif tag_name == 'em':
                text_parts.append('*')
    
    result = ''.join(text_parts)
    # Clean up multiple newlines
    result = re.sub(r'\n{3,}', '\n\n', result)
    return clean_text(result)


def extract_user_message(message_div: Tag) -> Optional[Dict]:
    """Extract user message content and metadata."""
    try:
        # Find the message content
        content_elem = message_div.find(class_=re.compile(r'user-message-content'))
        if not content_elem:
            return None
        
        text = extract_text_from_element(content_elem)
        if not text:
            return None
        
        # Extract message ID if available
        message_id = message_div.get('id', '')
        
        return {
            'role': 'user',
            'content': text,
            'message_id': message_id,
            'timestamp': None  # User messages don't seem to have timestamps in this format
        }
    except Exception as e:
        print(f"Error extracting user message: {e}")
        return None


def extract_assistant_message(message_div: Tag) -> Optional[Dict]:
    """Extract assistant message content and metadata."""
    try:
        # Find the message content
        content_elem = message_div.find(class_=re.compile(r'response-message-content'))
        if not content_elem:
            return None
        
        text = extract_text_from_element(content_elem)
        if not text:
            return None
        
        # Extract timestamp
        timestamp_elem = message_div.find(class_=re.compile(r'response-message-head-time'))
        timestamp = timestamp_elem.get_text(strip=True) if timestamp_elem else None
        
        # Extract model name
        model_elem = message_div.find(class_=re.compile(r'response-message-head-model'))
        model = model_elem.get_text(strip=True) if model_elem else None
        
        # Extract message ID
        message_id = message_div.get('id', '')
        
        return {
            'role': 'assistant',
            'content': text,
            'message_id': message_id,
            'timestamp': timestamp,
            'model': model
        }
    except Exception as e:
        print(f"Error extracting assistant message: {e}")
        return None


def extract_conversation(html_file: Path) -> List[Dict]:
    """Extract conversation from HTML file."""
    print(f"Reading HTML file: {html_file}")
    
    # Try different encodings
    encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
    html_content = None
    
    for encoding in encodings:
        try:
            with open(html_file, 'r', encoding=encoding, errors='ignore') as f:
                html_content = f.read()
            print(f"Successfully read file with {encoding} encoding")
            break
        except Exception as e:
            continue
    
    if html_content is None:
        # Last resort: read as binary and decode with errors='ignore'
        with open(html_file, 'rb') as f:
            html_content = f.read().decode('utf-8', errors='ignore')
        print("Read file with UTF-8 encoding (errors ignored)")
    
    print("Parsing HTML...")
    soup = BeautifulSoup(html_content, 'html.parser')
    
    conversation = []
    
    # Find all message containers
    user_messages = soup.find_all(class_=re.compile(r'qwen-chat-message-user'))
    assistant_messages = soup.find_all(class_=re.compile(r'qwen-chat-message-assistant'))
    
    print(f"Found {len(user_messages)} user messages and {len(assistant_messages)} assistant messages")
    
    # Create a list of all messages with their order
    all_messages = []
    
    for msg in user_messages:
        extracted = extract_user_message(msg)
        if extracted:
            all_messages.append((msg, extracted))
    
    for msg in assistant_messages:
        extracted = extract_assistant_message(msg)
        if extracted:
            all_messages.append((msg, extracted))
    
    # Sort messages by their position in the HTML (approximate order)
    # We'll use a simple approach: sort by the order they appear
    def get_message_order(item):
        msg_div = item[0]
        # Try to find a unique identifier or use position
        return str(msg_div).find(str(msg_div))
    
    # Actually, let's preserve the order as they appear in HTML
    # by finding all message divs in order
    all_message_divs = soup.find_all(class_=re.compile(r'qwen-chat-message-(user|assistant)'))
    
    for msg_div in all_message_divs:
        if 'qwen-chat-message-user' in msg_div.get('class', []):
            extracted = extract_user_message(msg_div)
            if extracted:
                conversation.append(extracted)
        elif 'qwen-chat-message-assistant' in msg_div.get('class', []):
            extracted = extract_assistant_message(msg_div)
            if extracted:
                conversation.append(extracted)
    
    print(f"Extracted {len(conversation)} messages")
    return conversation


def save_conversation(conversation: List[Dict], output_file: Path, format: str = 'json'):
    """Save conversation to file."""
    if format == 'json':
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(conversation, f, indent=2, ensure_ascii=False)
        print(f"Saved conversation to {output_file} (JSON format)")
    
    elif format == 'txt':
        with open(output_file, 'w', encoding='utf-8') as f:
            for i, msg in enumerate(conversation, 1):
                role = msg['role'].upper()
                timestamp = f" [{msg.get('timestamp', 'N/A')}]" if msg.get('timestamp') else ""
                model = f" ({msg.get('model', '')})" if msg.get('model') else ""
                
                f.write(f"\n{'='*80}\n")
                f.write(f"Message {i}: {role}{timestamp}{model}\n")
                f.write(f"{'='*80}\n")
                f.write(f"{msg['content']}\n")
        print(f"Saved conversation to {output_file} (Text format)")
    
    elif format == 'csv':
        import csv
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['message_number', 'role', 'timestamp', 'model', 'content'])
            writer.writeheader()
            for i, msg in enumerate(conversation, 1):
                writer.writerow({
                    'message_number': i,
                    'role': msg['role'],
                    'timestamp': msg.get('timestamp', ''),
                    'model': msg.get('model', ''),
                    'content': msg['content']
                })
        print(f"Saved conversation to {output_file} (CSV format)")


def main():
    parser = argparse.ArgumentParser(
        description='Extract and label conversation from Qwen Chat HTML file'
    )
    parser.add_argument(
        'input_file',
        type=Path,
        help='Path to the HTML file containing the chat session'
    )
    parser.add_argument(
        '-o', '--output',
        type=Path,
        help='Output file path (default: input_file with .json extension)'
    )
    parser.add_argument(
        '-f', '--format',
        choices=['json', 'txt', 'csv'],
        default='json',
        help='Output format (default: json)'
    )
    
    args = parser.parse_args()
    
    if not args.input_file.exists():
        print(f"Error: Input file not found: {args.input_file}")
        return 1
    
    # Determine output file
    if args.output:
        output_file = args.output
    else:
        output_file = args.input_file.with_suffix(f'.{args.format}')
    
    # Extract conversation
    conversation = extract_conversation(args.input_file)
    
    if not conversation:
        print("Warning: No conversation messages found in the HTML file")
        return 1
    
    # Save conversation
    save_conversation(conversation, output_file, args.format)
    
    # Print summary
    user_count = sum(1 for msg in conversation if msg['role'] == 'user')
    assistant_count = sum(1 for msg in conversation if msg['role'] == 'assistant')
    
    print(f"\nSummary:")
    print(f"  Total messages: {len(conversation)}")
    print(f"  User messages: {user_count}")
    print(f"  Assistant messages: {assistant_count}")
    
    return 0


if __name__ == '__main__':
    exit(main())
