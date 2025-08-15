"""
Text Editor Utilities

Helper functions for text manipulation, formatting, and editor operations.
"""

import re
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime

class TextPosition:
    """Represents a position in text with line and column information"""
    
    def __init__(self, offset: int, text: str):
        self.offset = offset
        self.line, self.column = self._offset_to_line_col(offset, text)
    
    def _offset_to_line_col(self, offset: int, text: str) -> Tuple[int, int]:
        """Convert character offset to line and column numbers"""
        if offset > len(text):
            offset = len(text)
        
        lines = text[:offset].split('\n')
        line = len(lines)
        column = len(lines[-1]) + 1 if lines else 1
        
        return line, column
    
    def __str__(self) -> str:
        return f"Line {self.line}, Column {self.column}"

class TextSelection:
    """Represents a text selection with start and end positions"""
    
    def __init__(self, start: int, end: int, text: str):
        self.start = min(start, end)
        self.end = max(start, end)
        self.text = text
        self.selected_text = text[self.start:self.end]
        self.start_pos = TextPosition(self.start, text)
        self.end_pos = TextPosition(self.end, text)
    
    @property
    def length(self) -> int:
        return self.end - self.start
    
    @property
    def is_empty(self) -> bool:
        return self.start == self.end
    
    def __str__(self) -> str:
        if self.is_empty:
            return f"Cursor at {self.start_pos}"
        return f"Selection: {self.start_pos} to {self.end_pos} ({self.length} chars)"

def count_words(text: str) -> int:
    """Count words in text, handling various edge cases"""
    if not text or not text.strip():
        return 0
    
    # Remove extra whitespace and split
    words = text.strip().split()
    return len(words)

def count_characters(text: str, include_spaces: bool = True) -> int:
    """Count characters in text"""
    if not text:
        return 0
    
    if include_spaces:
        return len(text)
    else:
        return len(text.replace(' ', '').replace('\t', '').replace('\n', ''))

def count_paragraphs(text: str) -> int:
    """Count paragraphs in text (separated by double newlines)"""
    if not text or not text.strip():
        return 0
    
    # Split by double newlines and filter empty paragraphs
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    return len(paragraphs)

def count_sentences(text: str) -> int:
    """Count sentences in text using basic punctuation rules"""
    if not text or not text.strip():
        return 0
    
    # Simple sentence counting using punctuation
    sentence_endings = re.findall(r'[.!?]+', text)
    return len(sentence_endings)

def find_word_boundaries(text: str, position: int) -> Tuple[int, int]:
    """Find the start and end of the word at the given position"""
    if not text or position < 0 or position > len(text):
        return position, position
    
    # Find word start
    start = position
    while start > 0 and text[start - 1].isalnum():
        start -= 1
    
    # Find word end
    end = position
    while end < len(text) and text[end].isalnum():
        end += 1
    
    return start, end

def select_word_at_position(text: str, position: int) -> TextSelection:
    """Select the entire word at the given position"""
    start, end = find_word_boundaries(text, position)
    return TextSelection(start, end, text)

def select_line_at_position(text: str, position: int) -> TextSelection:
    """Select the entire line at the given position"""
    if not text or position < 0 or position > len(text):
        return TextSelection(position, position, text)
    
    # Find line start
    start = position
    while start > 0 and text[start - 1] != '\n':
        start -= 1
    
    # Find line end
    end = position
    while end < len(text) and text[end] != '\n':
        end += 1
    
    return TextSelection(start, end, text)

def select_paragraph_at_position(text: str, position: int) -> TextSelection:
    """Select the entire paragraph at the given position"""
    if not text or position < 0 or position > len(text):
        return TextSelection(position, position, text)
    
    # Find paragraph start (double newline or start of text)
    start = position
    while start > 0:
        if start >= 2 and text[start-2:start] == '\n\n':
            break
        start -= 1
    
    # Find paragraph end (double newline or end of text)
    end = position
    while end < len(text) - 1:
        if text[end:end+2] == '\n\n':
            break
        end += 1
    
    if end < len(text):
        end += 1  # Include the last character
    
    return TextSelection(start, end, text)

def format_text_basic(text: str, format_type: str) -> str:
    """Apply basic formatting to text"""
    if not text:
        return text
    
    if format_type == "bold":
        return f"**{text}**"
    elif format_type == "italic":
        return f"*{text}*"
    elif format_type == "underline":
        return f"_{text}_"
    elif format_type == "quote":
        return f'"{text}"'
    elif format_type == "code":
        return f"`{text}`"
    elif format_type == "uppercase":
        return text.upper()
    elif format_type == "lowercase":
        return text.lower()
    elif format_type == "title_case":
        return text.title()
    elif format_type == "sentence_case":
        return text.capitalize()
    else:
        return text

def clean_text(text: str, options: Dict[str, bool] = None) -> str:
    """Clean text based on specified options"""
    if not text:
        return text
    
    if options is None:
        options = {}
    
    cleaned = text
    
    # Remove extra whitespace
    if options.get("remove_extra_spaces", False):
        cleaned = re.sub(r' +', ' ', cleaned)
    
    # Remove extra newlines
    if options.get("remove_extra_newlines", False):
        cleaned = re.sub(r'\n\n+', '\n\n', cleaned)
    
    # Remove trailing whitespace from lines
    if options.get("remove_trailing_spaces", False):
        lines = cleaned.split('\n')
        cleaned = '\n'.join(line.rstrip() for line in lines)
    
    # Fix common punctuation issues
    if options.get("fix_punctuation", False):
        # Fix spaces before punctuation
        cleaned = re.sub(r' +([.!?,:;])', r'\1', cleaned)
        # Fix spaces after punctuation
        cleaned = re.sub(r'([.!?])([A-Z])', r'\1 \2', cleaned)
    
    return cleaned

def get_text_statistics(text: str) -> Dict[str, Any]:
    """Get comprehensive statistics about the text"""
    if not text:
        return {
            "characters": 0,
            "characters_no_spaces": 0,
            "words": 0,
            "sentences": 0,
            "paragraphs": 0,
            "lines": 0,
            "average_words_per_sentence": 0,
            "average_sentences_per_paragraph": 0,
            "reading_time_minutes": 0
        }
    
    chars = count_characters(text, include_spaces=True)
    chars_no_spaces = count_characters(text, include_spaces=False)
    words = count_words(text)
    sentences = count_sentences(text)
    paragraphs = count_paragraphs(text)
    lines = len(text.split('\n'))
    
    # Calculate averages
    avg_words_per_sentence = words / sentences if sentences > 0 else 0
    avg_sentences_per_paragraph = sentences / paragraphs if paragraphs > 0 else 0
    
    # Estimate reading time (average 200 words per minute)
    reading_time = words / 200 if words > 0 else 0
    
    return {
        "characters": chars,
        "characters_no_spaces": chars_no_spaces,
        "words": words,
        "sentences": sentences,
        "paragraphs": paragraphs,
        "lines": lines,
        "average_words_per_sentence": round(avg_words_per_sentence, 1),
        "average_sentences_per_paragraph": round(avg_sentences_per_paragraph, 1),
        "reading_time_minutes": round(reading_time, 1)
    }

def find_and_replace(text: str, find_text: str, replace_text: str, 
                    case_sensitive: bool = True, whole_words: bool = False) -> Tuple[str, int]:
    """Find and replace text with options"""
    if not text or not find_text:
        return text, 0
    
    flags = 0 if case_sensitive else re.IGNORECASE
    
    if whole_words:
        pattern = r'\b' + re.escape(find_text) + r'\b'
    else:
        pattern = re.escape(find_text)
    
    new_text, count = re.subn(pattern, replace_text, text, flags=flags)
    return new_text, count

def auto_correct_common_mistakes(text: str) -> Tuple[str, List[str]]:
    """Auto-correct common writing mistakes"""
    if not text:
        return text, []
    
    corrections = []
    corrected = text
    
    # Common corrections
    corrections_map = {
        r'\bteh\b': 'the',
        r'\badn\b': 'and',
        r'\byou\'re\b': 'your',  # This is context-dependent, just an example
        r'\bits\b': "it's",     # This is also context-dependent
        r' +': ' ',             # Multiple spaces to single space
        r'\n\n\n+': '\n\n',     # Multiple newlines to double newline
    }
    
    for pattern, replacement in corrections_map.items():
        new_text, count = re.subn(pattern, replacement, corrected, flags=re.IGNORECASE)
        if count > 0:
            corrections.append(f"Replaced '{pattern}' with '{replacement}' ({count} times)")
            corrected = new_text
    
    return corrected, corrections

if __name__ == "__main__":
    print("Testing text editor utilities...")
    print("=" * 50)
    
    # Test text
    sample_text = """This is a sample text for testing. It has multiple sentences! 
    
    And it also has multiple paragraphs. This paragraph contains some common mistakes like teh and adn.
    
    The third paragraph is here to test various text operations."""
    
    # Test 1: Text statistics
    print("Test 1: Text statistics")
    try:
        stats = get_text_statistics(sample_text)
        print(f"Words: {stats['words']}")
        print(f"Characters: {stats['characters']}")
        print(f"Sentences: {stats['sentences']}")
        print(f"Paragraphs: {stats['paragraphs']}")
        print(f"Reading time: {stats['reading_time_minutes']} minutes")
        print("✓ Text statistics successful")
    except Exception as e:
        print(f"✗ Text statistics failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 2: Text selection
    print("Test 2: Text selection")
    try:
        # Select word at position 10
        word_selection = select_word_at_position(sample_text, 10)
        print(f"Word selection: '{word_selection.selected_text}'")
        
        # Select line at position 50
        line_selection = select_line_at_position(sample_text, 50)
        print(f"Line selection: '{line_selection.selected_text[:30]}...'")
        print("✓ Text selection successful")
    except Exception as e:
        print(f"✗ Text selection failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 3: Text formatting
    print("Test 3: Text formatting")
    try:
        test_word = "important"
        bold_text = format_text_basic(test_word, "bold")
        italic_text = format_text_basic(test_word, "italic")
        upper_text = format_text_basic(test_word, "uppercase")
        
        print(f"Bold: {bold_text}")
        print(f"Italic: {italic_text}")
        print(f"Uppercase: {upper_text}")
        print("✓ Text formatting successful")
    except Exception as e:
        print(f"✗ Text formatting failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 4: Find and replace
    print("Test 4: Find and replace")
    try:
        new_text, count = find_and_replace(sample_text, "sample", "example", case_sensitive=False)
        print(f"Replaced 'sample' with 'example': {count} replacements")
        print(f"New text preview: {new_text[:50]}...")
        print("✓ Find and replace successful")
    except Exception as e:
        print(f"✗ Find and replace failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 5: Auto-correct
    print("Test 5: Auto-correct")
    try:
        corrected_text, corrections = auto_correct_common_mistakes(sample_text)
        print(f"Applied {len(corrections)} corrections:")
        for correction in corrections:
            print(f"  - {correction}")
        print("✓ Auto-correct successful")
    except Exception as e:
        print(f"✗ Auto-correct failed: {e}")
    
    print("\nAll text editor utility tests completed!")