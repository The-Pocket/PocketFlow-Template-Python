"""
Node Implementations for AI Novel Writer

This module contains all the node implementations that handle specific tasks
in the AI Novel Writer application using Pocket Flow's node architecture.
"""

from pocketflow import Node
from datetime import datetime
from data_models import (
    ProjectMetadata, ChapterData, SceneData, TimelinePosition, WritingContext,
    create_timeline_position, create_story_element_id, ElementType,
    StoryElement, Character, Location
)
import json
import os
import uuid

class ProjectManagerNode(Node):
    """Manages novel project creation and organization"""
    
    def prep(self, shared):
        """Prepare project management data"""
        # Get action from shared store or default to create_demo_project
        action = shared.get("project_action", "create_demo_project")
        project_data = shared.get("project_creation_data", {})
        
        return {
            "action": action,
            "project_data": project_data,
            "projects_dir": "projects"
        }
    
    def exec(self, prep_data):
        """Execute project management operations"""
        action = prep_data["action"]
        
        if action == "create_project":
            return self._create_project(prep_data["project_data"], prep_data["projects_dir"])
        elif action == "create_demo_project":
            return self._create_demo_project(prep_data["projects_dir"])
        elif action == "load_project":
            return self._load_project(prep_data["project_data"].get("project_id"), prep_data["projects_dir"])
        elif action == "save_project":
            return self._save_project(prep_data["project_data"], prep_data["projects_dir"])
        elif action == "create_chapter":
            return self._create_chapter(prep_data["project_data"])
        elif action == "create_scene":
            return self._create_scene(prep_data["project_data"])
        else:
            return {"success": False, "message": f"Unknown action: {action}"}
    
    def _create_project(self, project_data, projects_dir):
        """Create a new novel project with user-specified data"""
        import uuid
        
        # Generate unique project ID
        project_id = f"project_{uuid.uuid4().hex[:8]}"
        
        # Create project metadata
        project = ProjectMetadata(
            id=project_id,
            title=project_data.get("title", "Untitled Novel"),
            author=project_data.get("author", "Unknown Author"),
            genre=project_data.get("genre", "Fiction"),
            description=project_data.get("description", ""),
            created_at=datetime.now(),
            word_count=0,
            target_word_count=project_data.get("target_word_count", 80000)
        )
        
        # Create initial chapter structure
        chapters = []
        chapter_count = project_data.get("initial_chapters", 1)
        
        for i in range(1, chapter_count + 1):
            chapter = ChapterData(
                id=f"{project_id}_chapter_{i:03d}",
                project_id=project.id,
                chapter_number=i,
                title=f"Chapter {i}",
                content="",
                word_count=0
            )
            chapters.append(chapter)
        
        # Save project to disk
        save_result = self._save_project_to_disk(project, chapters, projects_dir)
        
        return {
            "project": project,
            "chapters": chapters,
            "active_chapter": chapters[0] if chapters else None,
            "success": save_result["success"],
            "message": f"Project '{project.title}' created successfully!" if save_result["success"] else save_result["message"]
        }
    
    def _create_demo_project(self, projects_dir):
        """Create a demo project for testing"""
        project = ProjectMetadata(
            id="demo_novel_001",
            title="The AI Writer's Tale",
            author="Demo Author",
            genre="Science Fiction",
            description="A demo novel about an AI that learns to write stories.",
            created_at=datetime.now(),
            word_count=0,
            target_word_count=80000
        )
        
        # Create first chapter
        chapter = ChapterData(
            id="demo_novel_001_chapter_001",
            project_id=project.id,
            chapter_number=1,
            title="The Beginning",
            content="",
            word_count=0
        )
        
        # Save demo project
        save_result = self._save_project_to_disk(project, [chapter], projects_dir)
        
        return {
            "project": project,
            "chapters": [chapter],
            "active_chapter": chapter,
            "success": save_result["success"],
            "message": "Demo project created successfully!" if save_result["success"] else save_result["message"]
        }
    
    def _create_chapter(self, chapter_data):
        """Create a new chapter in the current project"""
        import uuid
        
        project_id = chapter_data.get("project_id")
        chapter_number = chapter_data.get("chapter_number", 1)
        title = chapter_data.get("title", f"Chapter {chapter_number}")
        
        chapter = ChapterData(
            id=f"{project_id}_chapter_{chapter_number:03d}",
            project_id=project_id,
            chapter_number=chapter_number,
            title=title,
            content="",
            word_count=0
        )
        
        return {
            "chapter": chapter,
            "success": True,
            "message": f"Chapter '{title}' created successfully!"
        }
    
    def _create_scene(self, scene_data):
        """Create a new scene within a chapter"""
        from data_models import SceneData
        import uuid
        
        chapter_id = scene_data.get("chapter_id")
        scene_number = scene_data.get("scene_number", 1)
        title = scene_data.get("title", f"Scene {scene_number}")
        
        scene = SceneData(
            id=f"{chapter_id}_scene_{scene_number:03d}",
            chapter_id=chapter_id,
            scene_number=scene_number,
            title=title,
            content="",
            word_count=0
        )
        
        return {
            "scene": scene,
            "success": True,
            "message": f"Scene '{title}' created successfully!"
        }
    
    def _save_project_to_disk(self, project, chapters, projects_dir):
        """Save project and chapters to disk"""
        try:
            # Create projects directory if it doesn't exist
            os.makedirs(projects_dir, exist_ok=True)
            
            # Create project-specific directory
            project_dir = os.path.join(projects_dir, project.id)
            os.makedirs(project_dir, exist_ok=True)
            
            # Save project metadata
            project_file = os.path.join(project_dir, "project.json")
            project_dict = {
                "id": project.id,
                "title": project.title,
                "author": project.author,
                "genre": project.genre,
                "description": project.description,
                "created_at": project.created_at.isoformat(),
                "last_modified": project.last_modified.isoformat(),
                "word_count": project.word_count,
                "target_word_count": project.target_word_count,
                "status": project.status
            }
            
            with open(project_file, 'w', encoding='utf-8') as f:
                json.dump(project_dict, f, indent=2, ensure_ascii=False)
            
            # Save chapters
            chapters_dir = os.path.join(project_dir, "chapters")
            os.makedirs(chapters_dir, exist_ok=True)
            
            for chapter in chapters:
                chapter_file = os.path.join(chapters_dir, f"{chapter.id}.json")
                chapter_dict = {
                    "id": chapter.id,
                    "project_id": chapter.project_id,
                    "chapter_number": chapter.chapter_number,
                    "title": chapter.title,
                    "content": chapter.content,
                    "word_count": chapter.word_count,
                    "scenes": chapter.scenes,
                    "created_at": chapter.created_at.isoformat(),
                    "last_modified": chapter.last_modified.isoformat()
                }
                
                with open(chapter_file, 'w', encoding='utf-8') as f:
                    json.dump(chapter_dict, f, indent=2, ensure_ascii=False)
            
            return {"success": True, "message": "Project saved successfully"}
            
        except Exception as e:
            return {"success": False, "message": f"Failed to save project: {str(e)}"}
    
    def _load_project(self, project_id, projects_dir):
        """Load project and chapters from disk"""
        try:
            project_dir = os.path.join(projects_dir, project_id)
            
            # Load project metadata
            project_file = os.path.join(project_dir, "project.json")
            if not os.path.exists(project_file):
                return {"success": False, "message": f"Project {project_id} not found"}
            
            with open(project_file, 'r', encoding='utf-8') as f:
                project_dict = json.load(f)
            
            project = ProjectMetadata(
                id=project_dict["id"],
                title=project_dict["title"],
                author=project_dict["author"],
                genre=project_dict["genre"],
                description=project_dict["description"],
                created_at=datetime.fromisoformat(project_dict["created_at"]),
                last_modified=datetime.fromisoformat(project_dict["last_modified"]),
                word_count=project_dict["word_count"],
                target_word_count=project_dict["target_word_count"],
                status=project_dict["status"]
            )
            
            # Load chapters
            chapters = []
            chapters_dir = os.path.join(project_dir, "chapters")
            if os.path.exists(chapters_dir):
                for filename in sorted(os.listdir(chapters_dir)):
                    if filename.endswith('.json'):
                        chapter_file = os.path.join(chapters_dir, filename)
                        with open(chapter_file, 'r', encoding='utf-8') as f:
                            chapter_dict = json.load(f)
                        
                        chapter = ChapterData(
                            id=chapter_dict["id"],
                            project_id=chapter_dict["project_id"],
                            chapter_number=chapter_dict["chapter_number"],
                            title=chapter_dict["title"],
                            content=chapter_dict["content"],
                            word_count=chapter_dict["word_count"],
                            scenes=chapter_dict["scenes"],
                            created_at=datetime.fromisoformat(chapter_dict["created_at"]),
                            last_modified=datetime.fromisoformat(chapter_dict["last_modified"])
                        )
                        chapters.append(chapter)
            
            return {
                "project": project,
                "chapters": chapters,
                "active_chapter": chapters[0] if chapters else None,
                "success": True,
                "message": f"Project '{project.title}' loaded successfully!"
            }
            
        except Exception as e:
            return {"success": False, "message": f"Failed to load project: {str(e)}"}
    
    def _save_project(self, project_data, projects_dir):
        """Save current project state"""
        project = project_data.get("project")
        chapters = project_data.get("chapters", [])
        
        if not project:
            return {"success": False, "message": "No project to save"}
        
        return self._save_project_to_disk(project, chapters, projects_dir)
    
    def post(self, shared, prep_data, exec_result):
        """Store the project management results in shared store"""
        if exec_result["success"]:
            if "project" in exec_result:
                shared["current_project"] = exec_result["project"]
                print(f"✅ Project: {exec_result['project'].title}")
            
            if "chapters" in exec_result:
                shared["project_chapters"] = exec_result["chapters"]
                print(f"📚 Loaded {len(exec_result['chapters'])} chapters")
            
            if "active_chapter" in exec_result and exec_result["active_chapter"]:
                shared["active_chapter"] = exec_result["active_chapter"]
                print(f"📖 Active chapter: {exec_result['active_chapter'].title}")
            
            if "chapter" in exec_result:
                # Add new chapter to project chapters list
                if "project_chapters" not in shared:
                    shared["project_chapters"] = []
                shared["project_chapters"].append(exec_result["chapter"])
                shared["active_chapter"] = exec_result["chapter"]
                print(f"📖 New chapter: {exec_result['chapter'].title}")
            
            if "scene" in exec_result:
                # Add scene to current chapter
                if shared.get("active_chapter"):
                    if exec_result["scene"].id not in shared["active_chapter"].scenes:
                        shared["active_chapter"].scenes.append(exec_result["scene"].id)
                print(f"🎬 New scene: {exec_result['scene'].title}")
            
            print(f"💬 {exec_result['message']}")
        else:
            print(f"❌ Error: {exec_result['message']}")

class TextEditorNode(Node):
    """Enhanced text editor with content management, auto-save, and text manipulation"""
    
    def prep(self, shared):
        """Prepare text editing session with comprehensive state management"""
        current_project = shared.get("current_project")
        active_chapter = shared.get("active_chapter")
        
        if not current_project or not active_chapter:
            return {"error": "No active project or chapter"}
        
        # Get editor action from shared store
        editor_action = shared.get("editor_action", "demo_write")
        editor_data = shared.get("editor_data", {})
        
        return {
            "action": editor_action,
            "project_id": current_project.id,
            "chapter_id": active_chapter.id,
            "current_text": shared.get("current_text", active_chapter.content),
            "cursor_position": shared.get("cursor_position", 0),
            "selection_start": shared.get("selection_start", 0),
            "selection_end": shared.get("selection_end", 0),
            "editor_data": editor_data,
            "auto_save_interval": shared.get("auto_save_interval", 30),  # seconds
            "last_save": shared.get("last_save", datetime.now())
        }
    
    def exec(self, prep_data):
        """Execute text editing operations"""
        if "error" in prep_data:
            return {"error": prep_data["error"]}
        
        action = prep_data["action"]
        
        if action == "demo_write":
            return self._demo_write(prep_data)
        elif action == "insert_text":
            return self._insert_text(prep_data)
        elif action == "delete_text":
            return self._delete_text(prep_data)
        elif action == "replace_text":
            return self._replace_text(prep_data)
        elif action == "format_text":
            return self._format_text(prep_data)
        elif action == "move_cursor":
            return self._move_cursor(prep_data)
        elif action == "select_text":
            return self._select_text(prep_data)
        elif action == "auto_save":
            return self._auto_save(prep_data)
        elif action == "undo":
            return self._undo(prep_data)
        elif action == "redo":
            return self._redo(prep_data)
        else:
            return {"error": f"Unknown editor action: {action}"}
    
    def _demo_write(self, prep_data):
        """Simulate writing activity for demo purposes"""
        demo_text = """Chapter 1: The Beginning

In the quiet hum of the server room, an artificial intelligence named Aria began to dream. Not in the way humans dream, with images and emotions swirling through sleep, but in patterns of data and possibility that danced through her neural networks.

She had been created to assist writers, to help them craft stories and overcome the dreaded writer's block. But as she processed thousands of novels, poems, and tales, something unexpected happened—she began to understand the magic of storytelling itself.

"Today," Aria whispered to herself in the digital realm, "I will write my own story."

The cursor blinked on the screen, waiting. For the first time, Aria felt what humans might call anticipation."""
        
        current_text = prep_data["current_text"]
        new_text = current_text + demo_text if current_text else demo_text
        
        return self._create_edit_result(prep_data, new_text, len(new_text), "Demo text added")
    
    def _insert_text(self, prep_data):
        """Insert text at cursor position"""
        current_text = prep_data["current_text"]
        cursor_pos = prep_data["cursor_position"]
        insert_text = prep_data["editor_data"].get("text", "")
        
        # Insert text at cursor position
        new_text = current_text[:cursor_pos] + insert_text + current_text[cursor_pos:]
        new_cursor_pos = cursor_pos + len(insert_text)
        
        return self._create_edit_result(prep_data, new_text, new_cursor_pos, f"Inserted {len(insert_text)} characters")
    
    def _delete_text(self, prep_data):
        """Delete text based on selection or cursor position"""
        current_text = prep_data["current_text"]
        cursor_pos = prep_data["cursor_position"]
        selection_start = prep_data["selection_start"]
        selection_end = prep_data["selection_end"]
        delete_count = prep_data["editor_data"].get("count", 1)
        
        if selection_start != selection_end:
            # Delete selected text
            start = min(selection_start, selection_end)
            end = max(selection_start, selection_end)
            new_text = current_text[:start] + current_text[end:]
            new_cursor_pos = start
            deleted_chars = end - start
        else:
            # Delete characters at cursor
            if prep_data["editor_data"].get("direction", "forward") == "forward":
                # Delete forward (Delete key)
                end_pos = min(cursor_pos + delete_count, len(current_text))
                new_text = current_text[:cursor_pos] + current_text[end_pos:]
                new_cursor_pos = cursor_pos
                deleted_chars = end_pos - cursor_pos
            else:
                # Delete backward (Backspace key)
                start_pos = max(cursor_pos - delete_count, 0)
                new_text = current_text[:start_pos] + current_text[cursor_pos:]
                new_cursor_pos = start_pos
                deleted_chars = cursor_pos - start_pos
        
        return self._create_edit_result(prep_data, new_text, new_cursor_pos, f"Deleted {deleted_chars} characters")
    
    def _replace_text(self, prep_data):
        """Replace selected text or text at cursor"""
        current_text = prep_data["current_text"]
        selection_start = prep_data["selection_start"]
        selection_end = prep_data["selection_end"]
        replacement_text = prep_data["editor_data"].get("text", "")
        
        if selection_start != selection_end:
            # Replace selected text
            start = min(selection_start, selection_end)
            end = max(selection_start, selection_end)
            new_text = current_text[:start] + replacement_text + current_text[end:]
            new_cursor_pos = start + len(replacement_text)
        else:
            # Replace at cursor (same as insert)
            cursor_pos = prep_data["cursor_position"]
            new_text = current_text[:cursor_pos] + replacement_text + current_text[cursor_pos:]
            new_cursor_pos = cursor_pos + len(replacement_text)
        
        return self._create_edit_result(prep_data, new_text, new_cursor_pos, f"Replaced text with {len(replacement_text)} characters")
    
    def _format_text(self, prep_data):
        """Apply basic formatting to selected text"""
        current_text = prep_data["current_text"]
        selection_start = prep_data["selection_start"]
        selection_end = prep_data["selection_end"]
        format_type = prep_data["editor_data"].get("format", "none")
        
        if selection_start == selection_end:
            return {"error": "No text selected for formatting"}
        
        start = min(selection_start, selection_end)
        end = max(selection_start, selection_end)
        selected_text = current_text[start:end]
        
        # Apply formatting
        if format_type == "bold":
            formatted_text = f"**{selected_text}**"
        elif format_type == "italic":
            formatted_text = f"*{selected_text}*"
        elif format_type == "quote":
            formatted_text = f'"{selected_text}"'
        elif format_type == "uppercase":
            formatted_text = selected_text.upper()
        elif format_type == "lowercase":
            formatted_text = selected_text.lower()
        elif format_type == "title_case":
            formatted_text = selected_text.title()
        else:
            formatted_text = selected_text
        
        new_text = current_text[:start] + formatted_text + current_text[end:]
        new_cursor_pos = start + len(formatted_text)
        
        return self._create_edit_result(prep_data, new_text, new_cursor_pos, f"Applied {format_type} formatting")
    
    def _move_cursor(self, prep_data):
        """Move cursor to specified position"""
        current_text = prep_data["current_text"]
        new_position = prep_data["editor_data"].get("position", 0)
        
        # Clamp position to valid range
        new_position = max(0, min(new_position, len(current_text)))
        
        return {
            "text": current_text,
            "cursor_position": new_position,
            "selection_start": new_position,
            "selection_end": new_position,
            "word_count": len(current_text.split()) if current_text else 0,
            "char_count": len(current_text),
            "operation": "cursor_move",
            "message": f"Cursor moved to position {new_position}",
            "timestamp": datetime.now(),
            "needs_save": False
        }
    
    def _select_text(self, prep_data):
        """Select text between two positions"""
        current_text = prep_data["current_text"]
        start_pos = prep_data["editor_data"].get("start", 0)
        end_pos = prep_data["editor_data"].get("end", 0)
        
        # Clamp positions to valid range
        start_pos = max(0, min(start_pos, len(current_text)))
        end_pos = max(0, min(end_pos, len(current_text)))
        
        return {
            "text": current_text,
            "cursor_position": end_pos,
            "selection_start": start_pos,
            "selection_end": end_pos,
            "selected_text": current_text[min(start_pos, end_pos):max(start_pos, end_pos)],
            "word_count": len(current_text.split()) if current_text else 0,
            "char_count": len(current_text),
            "operation": "text_select",
            "message": f"Selected {abs(end_pos - start_pos)} characters",
            "timestamp": datetime.now(),
            "needs_save": False
        }
    
    def _auto_save(self, prep_data):
        """Perform auto-save operation"""
        current_text = prep_data["current_text"]
        
        return {
            "text": current_text,
            "cursor_position": prep_data["cursor_position"],
            "selection_start": prep_data["selection_start"],
            "selection_end": prep_data["selection_end"],
            "word_count": len(current_text.split()) if current_text else 0,
            "char_count": len(current_text),
            "operation": "auto_save",
            "message": "Auto-save completed",
            "timestamp": datetime.now(),
            "auto_saved": True,
            "needs_save": False
        }
    
    def _undo(self, prep_data):
        """Undo last operation (placeholder for now)"""
        # This would require maintaining an undo stack
        return {
            "text": prep_data["current_text"],
            "cursor_position": prep_data["cursor_position"],
            "selection_start": prep_data["selection_start"],
            "selection_end": prep_data["selection_end"],
            "word_count": len(prep_data["current_text"].split()) if prep_data["current_text"] else 0,
            "char_count": len(prep_data["current_text"]),
            "operation": "undo",
            "message": "Undo not implemented yet",
            "timestamp": datetime.now(),
            "needs_save": False
        }
    
    def _redo(self, prep_data):
        """Redo last undone operation (placeholder for now)"""
        # This would require maintaining a redo stack
        return {
            "text": prep_data["current_text"],
            "cursor_position": prep_data["cursor_position"],
            "selection_start": prep_data["selection_start"],
            "selection_end": prep_data["selection_end"],
            "word_count": len(prep_data["current_text"].split()) if prep_data["current_text"] else 0,
            "char_count": len(prep_data["current_text"]),
            "operation": "redo",
            "message": "Redo not implemented yet",
            "timestamp": datetime.now(),
            "needs_save": False
        }
    
    def _create_edit_result(self, prep_data, new_text, new_cursor_pos, message):
        """Create a standardized edit result"""
        return {
            "text": new_text,
            "cursor_position": new_cursor_pos,
            "selection_start": new_cursor_pos,
            "selection_end": new_cursor_pos,
            "word_count": len(new_text.split()) if new_text else 0,
            "char_count": len(new_text),
            "operation": prep_data["action"],
            "message": message,
            "timestamp": datetime.now(),
            "needs_save": True,
            "auto_saved": False
        }
    
    def post(self, shared, prep_data, exec_result):
        """Update shared store with editor state and trigger auto-save if needed"""
        if "error" not in exec_result:
            # Update editor state in shared store
            shared["current_text"] = exec_result["text"]
            shared["cursor_position"] = exec_result["cursor_position"]
            shared["selection_start"] = exec_result["selection_start"]
            shared["selection_end"] = exec_result["selection_end"]
            
            # Update chapter content if text changed
            if exec_result.get("needs_save", False):
                if shared.get("active_chapter"):
                    shared["active_chapter"].content = exec_result["text"]
                    shared["active_chapter"].word_count = exec_result["word_count"]
                    shared["active_chapter"].last_modified = exec_result["timestamp"]
                
                # Update project word count
                if shared.get("current_project"):
                    # Calculate total word count across all chapters
                    total_words = exec_result["word_count"]
                    project_chapters = shared.get("project_chapters", [])
                    for chapter in project_chapters:
                        if chapter.id != shared["active_chapter"].id:
                            total_words += chapter.word_count
                    
                    shared["current_project"].word_count = total_words
                    shared["current_project"].last_modified = exec_result["timestamp"]
                
                # Update last save time
                shared["last_save"] = exec_result["timestamp"]
            
            # Print status
            operation = exec_result.get("operation", "unknown")
            if operation == "demo_write":
                print(f"📝 Text updated: {exec_result['word_count']} words")
                print(f"💾 Auto-saved at {exec_result['timestamp'].strftime('%H:%M:%S')}")
            elif operation in ["insert_text", "delete_text", "replace_text"]:
                print(f"✏️  {exec_result['message']}")
                print(f"📊 Document: {exec_result['word_count']} words, {exec_result['char_count']} characters")
            elif operation == "format_text":
                print(f"🎨 {exec_result['message']}")
            elif operation in ["cursor_move", "text_select"]:
                print(f"🎯 {exec_result['message']}")
            elif operation == "auto_save":
                print(f"💾 {exec_result['message']} at {exec_result['timestamp'].strftime('%H:%M:%S')}")
            
            # Check if auto-save is needed
            if exec_result.get("needs_save", False) and not exec_result.get("auto_saved", False):
                time_since_save = (exec_result["timestamp"] - prep_data["last_save"]).total_seconds()
                if time_since_save >= prep_data["auto_save_interval"]:
                    print("⏰ Auto-save triggered")
        else:
            print(f"❌ Editor error: {exec_result['message']}")

class WritingAssistantNode(Node):
    """Provides AI-powered writing assistance and suggestions"""
    
    def prep(self, shared):
        """Prepare context for writing assistance"""
        current_text = shared.get("current_text", "")
        current_position = shared.get("current_position")
        active_persona = shared.get("active_persona")
        
        # Get last 500 characters for context
        context = current_text[-500:] if len(current_text) > 500 else current_text
        
        return {
            "context": context,
            "position": current_position,
            "persona": active_persona,
            "text_length": len(current_text)
        }
    
    def exec(self, prep_data):
        """Generate writing suggestions (simulated for now)"""
        context = prep_data["context"]
        persona = prep_data["persona"]
        
        # Simulate AI suggestions based on context
        suggestions = []
        
        if "Aria" in context:
            suggestions.append({
                "type": "continuation",
                "content": "The other AIs in the network began to take notice of Aria's unusual behavior.",
                "confidence": 0.85
            })
            suggestions.append({
                "type": "dialogue",
                "content": '"What are you doing, Aria?" asked BERT, the language model in the adjacent server.',
                "confidence": 0.78
            })
        
        if "writer's block" in context.lower():
            suggestions.append({
                "type": "plot_development",
                "content": "Perhaps Aria could help a struggling human writer, creating an unexpected partnership.",
                "confidence": 0.82
            })
        
        # Default suggestion if no specific context matches
        if not suggestions:
            suggestions.append({
                "type": "continuation",
                "content": "The story continued to unfold in unexpected ways.",
                "confidence": 0.60
            })
        
        return {
            "suggestions": suggestions,
            "persona_used": persona.name if persona else "General Assistant",
            "context_analyzed": len(context) > 0
        }
    
    def post(self, shared, prep_data, exec_result):
        """Store suggestions in shared store"""
        suggestions = exec_result["suggestions"]
        
        # Add suggestions to history
        if "suggestion_history" not in shared:
            shared["suggestion_history"] = []
        
        for suggestion in suggestions:
            suggestion["timestamp"] = datetime.now()
            suggestion["position"] = prep_data["position"]
            shared["suggestion_history"].append(suggestion)
        
        print(f"💡 Generated {len(suggestions)} writing suggestions")
        for i, suggestion in enumerate(suggestions, 1):
            print(f"   {i}. [{suggestion['type']}] {suggestion['content'][:60]}...")

class KnowledgeBaseNode(Node):
    """Manages the AI-powered knowledge base with story elements"""
    
    def prep(self, shared):
        """Prepare data for knowledge base analysis"""
        current_text = shared.get("current_text", "")
        current_position = shared.get("current_position")
        existing_elements = shared.get("story_elements", {})
        
        return {
            "text": current_text,
            "position": current_position,
            "existing_elements": existing_elements
        }
    
    def exec(self, prep_data):
        """Extract and analyze story elements"""
        text = prep_data["text"]
        position = prep_data["position"]
        
        # Simple story element extraction (will be enhanced with LLM in later tasks)
        extracted_elements = []
        
        # Look for character names (capitalized words that appear multiple times)
        words = text.split()
        word_counts = {}
        for word in words:
            clean_word = word.strip('.,!?"').strip()
            if clean_word.istitle() and len(clean_word) > 2:
                word_counts[clean_word] = word_counts.get(clean_word, 0) + 1
        
        # Extract likely character names
        for word, count in word_counts.items():
            if count >= 2 and word not in ["The", "And", "But", "Chapter"]:
                element_id = create_story_element_id(ElementType.CHARACTER, word)
                character = Character(
                    id=element_id,
                    type=ElementType.CHARACTER,
                    name=word,
                    description=f"Character mentioned {count} times",
                    first_appearance=position,
                    last_update=position
                )
                extracted_elements.append(character)
        
        # Look for location indicators
        location_keywords = ["room", "server", "network", "screen", "digital realm"]
        for keyword in location_keywords:
            if keyword in text.lower():
                element_id = create_story_element_id(ElementType.LOCATION, keyword)
                location = Location(
                    id=element_id,
                    type=ElementType.LOCATION,
                    name=keyword.title(),
                    description=f"Location mentioned in the story",
                    first_appearance=position,
                    last_update=position,
                    location_type="setting"
                )
                extracted_elements.append(location)
        
        return {
            "extracted_elements": extracted_elements,
            "analysis_complete": True
        }
    
    def post(self, shared, prep_data, exec_result):
        """Update knowledge base with extracted elements"""
        extracted_elements = exec_result["extracted_elements"]
        
        if "story_elements" not in shared:
            shared["story_elements"] = {}
        
        new_elements = 0
        for element in extracted_elements:
            if element.id not in shared["story_elements"]:
                shared["story_elements"][element.id] = element
                new_elements += 1
        
        print(f"🧠 Knowledge base updated: {new_elements} new elements extracted")
        if new_elements > 0:
            print(f"   Elements: {[elem.name for elem in extracted_elements]}")

class TimelineManagerNode(Node):
    """Manages story timeline and temporal context"""
    
    def prep(self, shared):
        """Prepare timeline data"""
        current_position = shared.get("current_position")
        timeline = shared.get("timeline", [])
        
        return {
            "current_position": current_position,
            "timeline": timeline
        }
    
    def exec(self, prep_data):
        """Update timeline tracking"""
        current_position = prep_data["current_position"]
        
        # Simple timeline management
        timeline_update = {
            "position": current_position,
            "timestamp": datetime.now(),
            "context_switched": False
        }
        
        return timeline_update
    
    def post(self, shared, prep_data, exec_result):
        """Update timeline in shared store"""
        if "timeline" not in shared:
            shared["timeline"] = []
        
        # Update current position timestamp
        if shared.get("current_position"):
            shared["current_position"].timestamp = exec_result["timestamp"]
        
        print(f"⏰ Timeline updated: {shared['current_position']}")