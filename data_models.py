"""
Data Models for AI Novel Writer

This module contains all the core data structures used throughout the application.
These models define the shared store schema and data contracts between nodes.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from enum import Enum

# Enums for type safety
class ElementType(Enum):
    CHARACTER = "character"
    LOCATION = "location"
    EVENT = "event"
    OBJECT = "object"
    CONCEPT = "concept"

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class TaskPriority(Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

# Core Timeline and Position Models
@dataclass
class TimelinePosition:
    """Represents a specific position in the story timeline"""
    chapter: int
    scene: int
    paragraph: int
    timestamp: datetime
    story_time: Optional[str] = None  # In-story time reference (e.g., "Day 3, Morning")
    
    def __str__(self) -> str:
        return f"Ch{self.chapter}.{self.scene}.{self.paragraph}"

@dataclass
class TimelineEvent:
    """Represents an event in the story timeline"""
    id: str
    position: TimelinePosition
    event_type: str
    description: str
    characters_involved: List[str] = field(default_factory=list)
    locations: List[str] = field(default_factory=list)
    significance: int = 1  # 1-5 scale

# Story Element Models
@dataclass
class StoryElement:
    """Base class for all story elements (characters, locations, events, etc.)"""
    id: str
    type: ElementType
    name: str
    description: str
    first_appearance: TimelinePosition
    last_update: TimelinePosition
    properties: Dict[str, Any] = field(default_factory=dict)
    relationships: List[str] = field(default_factory=list)  # IDs of related elements
    tags: List[str] = field(default_factory=list)

@dataclass
class Character(StoryElement):
    """Character-specific story element"""
    age: Optional[int] = None
    occupation: Optional[str] = None
    personality_traits: List[str] = field(default_factory=list)
    background: str = ""
    voice_characteristics: Dict[str, str] = field(default_factory=dict)
    development_arc: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        if not hasattr(self, 'type') or self.type is None:
            self.type = ElementType.CHARACTER

@dataclass
class Location(StoryElement):
    """Location-specific story element"""
    location_type: str = ""  # city, building, room, etc.
    atmosphere: str = ""
    important_features: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        if not hasattr(self, 'type') or self.type is None:
            self.type = ElementType.LOCATION

@dataclass
class Relationship:
    """Represents relationships between story elements"""
    id: str
    element1_id: str
    element2_id: str
    relationship_type: str  # friend, enemy, parent, location_of, etc.
    strength: int = 1  # 1-5 scale
    description: str = ""
    established_at: TimelinePosition = None

# Project and Chapter Models
@dataclass
class ProjectMetadata:
    """Metadata for a novel project"""
    id: str
    title: str
    author: str
    genre: str
    description: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    last_modified: datetime = field(default_factory=datetime.now)
    word_count: int = 0
    target_word_count: int = 80000
    status: str = "draft"  # draft, revision, complete
    
@dataclass
class ChapterData:
    """Data structure for a chapter"""
    id: str
    project_id: str
    chapter_number: int
    title: str
    content: str = ""
    word_count: int = 0
    scenes: List[str] = field(default_factory=list)  # Scene IDs
    created_at: datetime = field(default_factory=datetime.now)
    last_modified: datetime = field(default_factory=datetime.now)

@dataclass
class SceneData:
    """Data structure for a scene within a chapter"""
    id: str
    chapter_id: str
    scene_number: int
    title: str = ""
    content: str = ""
    word_count: int = 0
    summary: str = ""
    characters_present: List[str] = field(default_factory=list)
    location: Optional[str] = None

# AI and Persona Models
@dataclass
class AIPersona:
    """Configuration for different AI personalities"""
    name: str
    specialization: str
    system_prompt: str
    style_preferences: Dict[str, str] = field(default_factory=dict)
    active_capabilities: List[str] = field(default_factory=list)
    custom_instructions: str = ""

@dataclass
class Suggestion:
    """AI suggestion for writing assistance"""
    id: str
    type: str  # continuation, rewrite, dialogue, plot
    content: str
    confidence: float
    context: str
    position: TimelinePosition
    persona_used: str
    timestamp: datetime = field(default_factory=datetime.now)
    accepted: Optional[bool] = None

@dataclass
class AITask:
    """Task in the AI's internal coordination worksheet"""
    id: str
    task_type: str
    description: str
    priority: TaskPriority
    status: TaskStatus
    created_at: datetime = field(default_factory=datetime.now)
    due_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    dependencies: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

# Research and RAG Models
@dataclass
class DocumentChunk:
    """Chunk of a research document for RAG processing"""
    id: str
    document_id: str
    content: str
    chunk_index: int
    metadata: Dict[str, Any] = field(default_factory=dict)
    embedding: Optional[List[float]] = None

@dataclass
class ResearchDocument:
    """Research document metadata"""
    id: str
    title: str
    filename: str
    content: str
    document_type: str  # pdf, docx, txt, etc.
    uploaded_at: datetime = field(default_factory=datetime.now)
    processed: bool = False
    chunk_count: int = 0

@dataclass
class ResearchResult:
    """Result from research document retrieval"""
    document_id: str
    chunk_id: str
    content: str
    relevance_score: float
    source_info: Dict[str, str] = field(default_factory=dict)

# Writing Context and Session Models
@dataclass
class WritingContext:
    """Context information for the current writing session"""
    active_characters: List[str] = field(default_factory=list)
    current_location: Optional[str] = None
    scene_mood: str = ""
    writing_goal: str = ""
    session_start: datetime = field(default_factory=datetime.now)
    words_written_this_session: int = 0

@dataclass
class WritingGoal:
    """Writing goal and progress tracking"""
    id: str
    goal_type: str  # daily_words, weekly_words, chapter_completion
    target_value: int
    current_value: int = 0
    deadline: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.now)
    completed: bool = False

# Export and Sync Models
@dataclass
class ExportTask:
    """Export task configuration"""
    id: str
    format: str  # pdf, docx, epub, txt
    chapters: List[str] = field(default_factory=list)  # Empty means all chapters
    status: str = "pending"
    created_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    output_path: Optional[str] = None

@dataclass
class SyncStatus:
    """Google Docs synchronization status"""
    connected: bool = False
    last_sync: Optional[datetime] = None
    conflicts: List[str] = field(default_factory=list)
    pending_changes: int = 0

# Utility functions for data model operations
def create_story_element_id(element_type: ElementType, name: str) -> str:
    """Generate a unique ID for a story element"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    clean_name = "".join(c for c in name if c.isalnum() or c in "_-").lower()
    return f"{element_type.value}_{clean_name}_{timestamp}"

def create_timeline_position(chapter: int, scene: int = 1, paragraph: int = 1) -> TimelinePosition:
    """Create a timeline position with current timestamp"""
    return TimelinePosition(
        chapter=chapter,
        scene=scene,
        paragraph=paragraph,
        timestamp=datetime.now()
    )

def initialize_shared_store() -> Dict[str, Any]:
    """Initialize the shared store with default values"""
    return {
        # Project Data
        "current_project": None,
        "active_chapter": None,
        "current_position": create_timeline_position(1),
        
        # Writing Session
        "current_text": "",
        "cursor_position": 0,
        "writing_context": WritingContext(),
        
        # Knowledge Base
        "story_elements": {},
        "character_database": {},
        "timeline": [],
        "relationships": [],
        
        # AI State
        "active_persona": AIPersona(
            name="General Assistant",
            specialization="general_writing",
            system_prompt="You are a helpful writing assistant for novelists.",
            style_preferences={},
            active_capabilities=["suggestions", "dialogue", "plot_development"]
        ),
        "ai_worksheet": [],
        "suggestion_history": [],
        
        # Research & RAG
        "research_index": None,
        "document_chunks": [],
        "embeddings": {},
        
        # Sync & Export
        "google_docs_token": None,
        "sync_status": SyncStatus(),
        "export_queue": []
    }