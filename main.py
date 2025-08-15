#!/usr/bin/env python3
"""
AI Novel Writer - Main Application Entry Point

This is the main entry point for the AI Novel Writer application built with Pocket Flow.
It demonstrates the core writing assistance workflow and serves as the project launcher.
"""

import os
from datetime import datetime
from flow import create_writing_flow, create_project_setup_flow
from data_models import ProjectMetadata, TimelinePosition, AIPersona

def main():
    """Main application entry point"""
    print("🖋️  AI Novel Writer - Starting...")
    
    # Initialize shared store with default values
    shared_store = {
        # Project Data
        "current_project": None,
        "active_chapter": None,
        "current_position": TimelinePosition(
            chapter=1, 
            scene=1, 
            paragraph=1, 
            timestamp=datetime.now(),
            story_time=None
        ),
        
        # Writing Session
        "current_text": "",
        "cursor_position": 0,
        "writing_context": {},
        
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
        "sync_status": "disconnected",
        "export_queue": []
    }
    
    # Demo: Create a new project
    print("\n📚 Creating demo project...")
    project_flow = create_project_setup_flow()
    project_flow.run(shared_store)
    
    # Demo: Create a custom project
    print("\n📝 Creating custom project...")
    shared_store["project_action"] = "create_project"
    shared_store["project_creation_data"] = {
        "title": "The Chronicles of AI",
        "author": "AI Writer",
        "genre": "Science Fiction",
        "description": "A novel about artificial intelligence discovering creativity",
        "target_word_count": 100000,
        "initial_chapters": 3
    }
    
    custom_project_flow = create_project_setup_flow()
    custom_project_flow.run(shared_store)
    
    # Demo: Create additional chapter
    print("\n📖 Adding new chapter...")
    shared_store["project_action"] = "create_chapter"
    shared_store["project_creation_data"] = {
        "project_id": shared_store["current_project"].id if shared_store["current_project"] else "demo_novel_001",
        "chapter_number": 2,
        "title": "The Awakening"
    }
    
    chapter_flow = create_project_setup_flow()
    chapter_flow.run(shared_store)
    
    # Demo: Start writing session
    print("\n✍️  Starting writing session...")
    writing_flow = create_writing_flow()
    writing_flow.run(shared_store)
    
    # Demo: Enhanced text editor operations
    print("\n📝 Testing enhanced text editor...")
    
    # Test text insertion
    shared_store["editor_action"] = "insert_text"
    shared_store["editor_data"] = {"text": "\n\nThis is additional text inserted by the enhanced editor."}
    shared_store["cursor_position"] = len(shared_store.get("current_text", ""))
    
    text_editor_flow = create_writing_flow()
    text_editor_flow.run(shared_store)
    
    # Test text formatting
    print("\n🎨 Testing text formatting...")
    shared_store["editor_action"] = "format_text"
    shared_store["editor_data"] = {"format": "bold"}
    shared_store["selection_start"] = 50
    shared_store["selection_end"] = 70
    
    format_flow = create_writing_flow()
    format_flow.run(shared_store)
    
    # Test cursor movement
    print("\n🎯 Testing cursor movement...")
    shared_store["editor_action"] = "move_cursor"
    shared_store["editor_data"] = {"position": 100}
    
    cursor_flow = create_writing_flow()
    cursor_flow.run(shared_store)
    
    # Demo: Show project statistics
    print("\n📊 Project Statistics:")
    if shared_store.get("current_project"):
        project = shared_store["current_project"]
        print(f"   Title: {project.title}")
        print(f"   Author: {project.author}")
        print(f"   Genre: {project.genre}")
        print(f"   Word Count: {project.word_count}")
        print(f"   Target: {project.target_word_count}")
        print(f"   Progress: {(project.word_count / project.target_word_count * 100):.1f}%")
        
        chapters = shared_store.get("project_chapters", [])
        print(f"   Chapters: {len(chapters)}")
        
        story_elements = shared_store.get("story_elements", {})
        print(f"   Story Elements: {len(story_elements)}")
    
    print("\n✅ AI Novel Writer demo completed!")

if __name__ == "__main__":
    main()