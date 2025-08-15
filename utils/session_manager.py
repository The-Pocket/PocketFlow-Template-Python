"""
Session Management Utilities

Handles writing sessions, auto-save, and editor state persistence.
"""

import os
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_models import WritingContext, WritingGoal

@dataclass
class EditorSession:
    """Represents an active editor session"""
    session_id: str
    project_id: str
    chapter_id: str
    start_time: datetime
    last_activity: datetime
    cursor_position: int = 0
    selection_start: int = 0
    selection_end: int = 0
    words_written: int = 0
    characters_typed: int = 0
    auto_save_enabled: bool = True
    auto_save_interval: int = 30  # seconds
    last_auto_save: Optional[datetime] = None

@dataclass
class SessionStats:
    """Statistics for a writing session"""
    session_duration: timedelta
    words_written: int
    characters_typed: int
    average_wpm: float
    breaks_taken: int
    auto_saves_performed: int

class SessionManager:
    """Manages editor sessions and auto-save functionality"""
    
    def __init__(self, sessions_dir: str = "sessions"):
        self.sessions_dir = sessions_dir
        self.active_sessions: Dict[str, EditorSession] = {}
        self._ensure_sessions_dir()
    
    def _ensure_sessions_dir(self):
        """Create sessions directory if it doesn't exist"""
        os.makedirs(self.sessions_dir, exist_ok=True)
    
    def start_session(self, project_id: str, chapter_id: str, 
                     auto_save_interval: int = 30) -> EditorSession:
        """Start a new editor session"""
        import uuid
        
        session_id = f"session_{uuid.uuid4().hex[:8]}"
        now = datetime.now()
        
        session = EditorSession(
            session_id=session_id,
            project_id=project_id,
            chapter_id=chapter_id,
            start_time=now,
            last_activity=now,
            auto_save_interval=auto_save_interval,
            last_auto_save=now
        )
        
        self.active_sessions[session_id] = session
        self._save_session(session)
        
        return session
    
    def update_session(self, session_id: str, cursor_position: int = None,
                      selection_start: int = None, selection_end: int = None,
                      words_added: int = 0, chars_added: int = 0) -> bool:
        """Update session state"""
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        session.last_activity = datetime.now()
        
        if cursor_position is not None:
            session.cursor_position = cursor_position
        if selection_start is not None:
            session.selection_start = selection_start
        if selection_end is not None:
            session.selection_end = selection_end
        
        session.words_written += words_added
        session.characters_typed += chars_added
        
        self._save_session(session)
        return True
    
    def end_session(self, session_id: str) -> Optional[SessionStats]:
        """End a session and return statistics"""
        if session_id not in self.active_sessions:
            return None
        
        session = self.active_sessions[session_id]
        end_time = datetime.now()
        
        # Calculate statistics
        duration = end_time - session.start_time
        duration_minutes = duration.total_seconds() / 60
        avg_wpm = session.words_written / duration_minutes if duration_minutes > 0 else 0
        
        stats = SessionStats(
            session_duration=duration,
            words_written=session.words_written,
            characters_typed=session.characters_typed,
            average_wpm=round(avg_wpm, 1),
            breaks_taken=0,  # Would need to track this
            auto_saves_performed=0  # Would need to track this
        )
        
        # Remove from active sessions
        del self.active_sessions[session_id]
        
        # Archive session
        self._archive_session(session, stats)
        
        return stats
    
    def should_auto_save(self, session_id: str) -> bool:
        """Check if auto-save should be triggered"""
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        if not session.auto_save_enabled:
            return False
        
        if session.last_auto_save is None:
            return True
        
        time_since_save = (datetime.now() - session.last_auto_save).total_seconds()
        return time_since_save >= session.auto_save_interval
    
    def perform_auto_save(self, session_id: str) -> bool:
        """Perform auto-save for a session"""
        if session_id not in self.active_sessions:
            return False
        
        session = self.active_sessions[session_id]
        session.last_auto_save = datetime.now()
        self._save_session(session)
        
        return True
    
    def get_session(self, session_id: str) -> Optional[EditorSession]:
        """Get session by ID"""
        return self.active_sessions.get(session_id)
    
    def list_active_sessions(self) -> List[EditorSession]:
        """List all active sessions"""
        return list(self.active_sessions.values())
    
    def _save_session(self, session: EditorSession):
        """Save session to disk"""
        try:
            session_file = os.path.join(self.sessions_dir, f"{session.session_id}.json")
            session_dict = asdict(session)
            
            # Convert datetime objects to ISO format
            session_dict["start_time"] = session.start_time.isoformat()
            session_dict["last_activity"] = session.last_activity.isoformat()
            if session.last_auto_save:
                session_dict["last_auto_save"] = session.last_auto_save.isoformat()
            
            with open(session_file, 'w', encoding='utf-8') as f:
                json.dump(session_dict, f, indent=2, ensure_ascii=False)
                
        except Exception as e:
            print(f"Warning: Failed to save session {session.session_id}: {e}")
    
    def _archive_session(self, session: EditorSession, stats: SessionStats):
        """Archive completed session"""
        try:
            archive_dir = os.path.join(self.sessions_dir, "archive")
            os.makedirs(archive_dir, exist_ok=True)
            
            archive_file = os.path.join(archive_dir, f"{session.session_id}_complete.json")
            
            archive_data = {
                "session": asdict(session),
                "stats": asdict(stats),
                "completed_at": datetime.now().isoformat()
            }
            
            # Convert datetime objects
            archive_data["session"]["start_time"] = session.start_time.isoformat()
            archive_data["session"]["last_activity"] = session.last_activity.isoformat()
            if session.last_auto_save:
                archive_data["session"]["last_auto_save"] = session.last_auto_save.isoformat()
            
            archive_data["stats"]["session_duration"] = str(stats.session_duration)
            
            with open(archive_file, 'w', encoding='utf-8') as f:
                json.dump(archive_data, f, indent=2, ensure_ascii=False)
                
            # Remove active session file
            session_file = os.path.join(self.sessions_dir, f"{session.session_id}.json")
            if os.path.exists(session_file):
                os.remove(session_file)
                
        except Exception as e:
            print(f"Warning: Failed to archive session {session.session_id}: {e}")

def create_writing_context(project_title: str = "", chapter_title: str = "",
                          active_characters: List[str] = None,
                          current_location: str = "", scene_mood: str = "",
                          writing_goal: str = "") -> WritingContext:
    """Create a writing context for the current session"""
    return WritingContext(
        active_characters=active_characters or [],
        current_location=current_location,
        scene_mood=scene_mood,
        writing_goal=writing_goal,
        session_start=datetime.now(),
        words_written_this_session=0
    )

def create_writing_goal(goal_type: str, target_value: int, 
                       deadline: Optional[datetime] = None) -> WritingGoal:
    """Create a writing goal for tracking progress"""
    import uuid
    
    return WritingGoal(
        id=f"goal_{uuid.uuid4().hex[:8]}",
        goal_type=goal_type,
        target_value=target_value,
        current_value=0,
        deadline=deadline,
        created_at=datetime.now(),
        completed=False
    )

def calculate_writing_velocity(words_written: int, time_elapsed: timedelta) -> Dict[str, float]:
    """Calculate writing velocity metrics"""
    if time_elapsed.total_seconds() == 0:
        return {"wpm": 0.0, "wph": 0.0, "wpd": 0.0}
    
    minutes = time_elapsed.total_seconds() / 60
    hours = minutes / 60
    days = hours / 24
    
    return {
        "wpm": round(words_written / minutes, 1) if minutes > 0 else 0.0,
        "wph": round(words_written / hours, 1) if hours > 0 else 0.0,
        "wpd": round(words_written / days, 1) if days > 0 else 0.0
    }

def get_session_summary(session: EditorSession) -> Dict[str, Any]:
    """Get a summary of session information"""
    now = datetime.now()
    duration = now - session.start_time
    
    velocity = calculate_writing_velocity(session.words_written, duration)
    
    return {
        "session_id": session.session_id,
        "project_id": session.project_id,
        "chapter_id": session.chapter_id,
        "duration": str(duration),
        "duration_minutes": round(duration.total_seconds() / 60, 1),
        "words_written": session.words_written,
        "characters_typed": session.characters_typed,
        "velocity": velocity,
        "auto_save_enabled": session.auto_save_enabled,
        "last_activity": session.last_activity.isoformat(),
        "cursor_position": session.cursor_position
    }

if __name__ == "__main__":
    print("Testing session management utilities...")
    print("=" * 50)
    
    # Test 1: Create session manager
    print("Test 1: Create session manager")
    try:
        session_manager = SessionManager()
        print("✓ Session manager created successfully")
    except Exception as e:
        print(f"✗ Session manager creation failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 2: Start session
    print("Test 2: Start session")
    try:
        session = session_manager.start_session("test_project", "test_chapter")
        print(f"Session started: {session.session_id}")
        print(f"Project: {session.project_id}")
        print(f"Chapter: {session.chapter_id}")
        print("✓ Session start successful")
    except Exception as e:
        print(f"✗ Session start failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 3: Update session
    print("Test 3: Update session")
    try:
        success = session_manager.update_session(
            session.session_id,
            cursor_position=100,
            words_added=50,
            chars_added=250
        )
        print(f"Session update success: {success}")
        
        updated_session = session_manager.get_session(session.session_id)
        print(f"Words written: {updated_session.words_written}")
        print(f"Characters typed: {updated_session.characters_typed}")
        print("✓ Session update successful")
    except Exception as e:
        print(f"✗ Session update failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 4: Session summary
    print("Test 4: Session summary")
    try:
        summary = get_session_summary(session)
        print(f"Duration: {summary['duration_minutes']} minutes")
        print(f"Words per minute: {summary['velocity']['wpm']}")
        print(f"Cursor position: {summary['cursor_position']}")
        print("✓ Session summary successful")
    except Exception as e:
        print(f"✗ Session summary failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 5: Auto-save check
    print("Test 5: Auto-save check")
    try:
        should_save = session_manager.should_auto_save(session.session_id)
        print(f"Should auto-save: {should_save}")
        
        if should_save:
            save_success = session_manager.perform_auto_save(session.session_id)
            print(f"Auto-save performed: {save_success}")
        
        print("✓ Auto-save check successful")
    except Exception as e:
        print(f"✗ Auto-save check failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 6: End session
    print("Test 6: End session")
    try:
        stats = session_manager.end_session(session.session_id)
        if stats:
            print(f"Session ended successfully")
            print(f"Total words: {stats.words_written}")
            print(f"Average WPM: {stats.average_wpm}")
            print(f"Duration: {stats.session_duration}")
        print("✓ Session end successful")
    except Exception as e:
        print(f"✗ Session end failed: {e}")
    
    print("\nAll session management utility tests completed!")