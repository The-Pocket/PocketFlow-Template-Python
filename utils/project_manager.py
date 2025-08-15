"""
Project Management Utilities

Helper functions for managing novel projects, chapters, and scenes.
"""

import os
import json
import sys
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data_models import ProjectMetadata, ChapterData, SceneData

def list_projects(projects_dir: str = "projects") -> List[Dict[str, Any]]:
    """
    List all available projects in the projects directory.
    
    Args:
        projects_dir: Directory containing project folders
    
    Returns:
        List of project summaries with basic metadata
    """
    projects = []
    
    if not os.path.exists(projects_dir):
        return projects
    
    for project_folder in os.listdir(projects_dir):
        project_path = os.path.join(projects_dir, project_folder)
        if os.path.isdir(project_path):
            project_file = os.path.join(project_path, "project.json")
            if os.path.exists(project_file):
                try:
                    with open(project_file, 'r', encoding='utf-8') as f:
                        project_data = json.load(f)
                    
                    # Count chapters
                    chapters_dir = os.path.join(project_path, "chapters")
                    chapter_count = 0
                    if os.path.exists(chapters_dir):
                        chapter_count = len([f for f in os.listdir(chapters_dir) if f.endswith('.json')])
                    
                    projects.append({
                        "id": project_data["id"],
                        "title": project_data["title"],
                        "author": project_data["author"],
                        "genre": project_data["genre"],
                        "word_count": project_data["word_count"],
                        "target_word_count": project_data["target_word_count"],
                        "chapter_count": chapter_count,
                        "last_modified": project_data["last_modified"],
                        "status": project_data["status"]
                    })
                except Exception as e:
                    print(f"Warning: Could not read project {project_folder}: {e}")
    
    # Sort by last modified (most recent first)
    projects.sort(key=lambda x: x["last_modified"], reverse=True)
    return projects

def get_project_structure(project_id: str, projects_dir: str = "projects") -> Dict[str, Any]:
    """
    Get the complete structure of a project including all chapters and scenes.
    
    Args:
        project_id: ID of the project
        projects_dir: Directory containing project folders
    
    Returns:
        Dictionary containing project structure
    """
    project_path = os.path.join(projects_dir, project_id)
    
    if not os.path.exists(project_path):
        return {"error": f"Project {project_id} not found"}
    
    try:
        # Load project metadata
        project_file = os.path.join(project_path, "project.json")
        with open(project_file, 'r', encoding='utf-8') as f:
            project_data = json.load(f)
        
        # Load chapters
        chapters = []
        chapters_dir = os.path.join(project_path, "chapters")
        if os.path.exists(chapters_dir):
            for filename in sorted(os.listdir(chapters_dir)):
                if filename.endswith('.json'):
                    chapter_file = os.path.join(chapters_dir, filename)
                    with open(chapter_file, 'r', encoding='utf-8') as f:
                        chapter_data = json.load(f)
                    chapters.append(chapter_data)
        
        return {
            "project": project_data,
            "chapters": chapters,
            "total_chapters": len(chapters),
            "total_word_count": sum(ch.get("word_count", 0) for ch in chapters)
        }
        
    except Exception as e:
        return {"error": f"Failed to load project structure: {str(e)}"}

def create_project_template(title: str, author: str, genre: str = "Fiction", 
                          description: str = "", target_word_count: int = 80000,
                          initial_chapters: int = 1) -> Dict[str, Any]:
    """
    Create a template for a new project with specified parameters.
    
    Args:
        title: Project title
        author: Author name
        genre: Genre of the novel
        description: Project description
        target_word_count: Target word count for the novel
        initial_chapters: Number of initial chapters to create
    
    Returns:
        Dictionary containing project creation data
    """
    return {
        "title": title,
        "author": author,
        "genre": genre,
        "description": description,
        "target_word_count": target_word_count,
        "initial_chapters": initial_chapters
    }

def validate_project_data(project_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate project creation data.
    
    Args:
        project_data: Dictionary containing project data
    
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []
    
    # Required fields
    if not project_data.get("title", "").strip():
        errors.append("Project title is required")
    
    if not project_data.get("author", "").strip():
        errors.append("Author name is required")
    
    # Validate target word count
    target_wc = project_data.get("target_word_count", 0)
    if not isinstance(target_wc, int) or target_wc <= 0:
        errors.append("Target word count must be a positive integer")
    
    # Validate initial chapters
    initial_chapters = project_data.get("initial_chapters", 1)
    if not isinstance(initial_chapters, int) or initial_chapters < 1 or initial_chapters > 50:
        errors.append("Initial chapters must be between 1 and 50")
    
    return len(errors) == 0, errors

def get_chapter_outline(project_id: str, projects_dir: str = "projects") -> List[Dict[str, Any]]:
    """
    Get a chapter outline for a project showing titles and word counts.
    
    Args:
        project_id: ID of the project
        projects_dir: Directory containing project folders
    
    Returns:
        List of chapter summaries
    """
    project_structure = get_project_structure(project_id, projects_dir)
    
    if "error" in project_structure:
        return []
    
    outline = []
    for chapter in project_structure["chapters"]:
        outline.append({
            "chapter_number": chapter["chapter_number"],
            "title": chapter["title"],
            "word_count": chapter["word_count"],
            "scene_count": len(chapter.get("scenes", [])),
            "last_modified": chapter["last_modified"]
        })
    
    return outline

def calculate_project_stats(project_id: str, projects_dir: str = "projects") -> Dict[str, Any]:
    """
    Calculate comprehensive statistics for a project.
    
    Args:
        project_id: ID of the project
        projects_dir: Directory containing project folders
    
    Returns:
        Dictionary containing project statistics
    """
    project_structure = get_project_structure(project_id, projects_dir)
    
    if "error" in project_structure:
        return {"error": project_structure["error"]}
    
    project_data = project_structure["project"]
    chapters = project_structure["chapters"]
    
    # Calculate statistics
    total_words = sum(ch.get("word_count", 0) for ch in chapters)
    target_words = project_data.get("target_word_count", 80000)
    progress_percentage = (total_words / target_words * 100) if target_words > 0 else 0
    
    # Chapter statistics
    chapter_word_counts = [ch.get("word_count", 0) for ch in chapters]
    avg_chapter_length = sum(chapter_word_counts) / len(chapter_word_counts) if chapter_word_counts else 0
    
    # Find longest and shortest chapters
    longest_chapter = max(chapters, key=lambda x: x.get("word_count", 0)) if chapters else None
    shortest_chapter = min(chapters, key=lambda x: x.get("word_count", 0)) if chapters else None
    
    return {
        "total_words": total_words,
        "target_words": target_words,
        "progress_percentage": round(progress_percentage, 1),
        "total_chapters": len(chapters),
        "average_chapter_length": round(avg_chapter_length),
        "longest_chapter": {
            "title": longest_chapter["title"],
            "word_count": longest_chapter["word_count"]
        } if longest_chapter else None,
        "shortest_chapter": {
            "title": shortest_chapter["title"],
            "word_count": shortest_chapter["word_count"]
        } if shortest_chapter else None,
        "created_at": project_data["created_at"],
        "last_modified": project_data["last_modified"]
    }

if __name__ == "__main__":
    print("Testing project management utilities...")
    print("=" * 50)
    
    # Test 1: List projects
    print("Test 1: List projects")
    try:
        projects = list_projects()
        print(f"Found {len(projects)} projects")
        for project in projects:
            print(f"  - {project['title']} by {project['author']} ({project['word_count']} words)")
        print("✓ List projects successful")
    except Exception as e:
        print(f"✗ List projects failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 2: Create project template
    print("Test 2: Create project template")
    try:
        template = create_project_template(
            title="Test Novel",
            author="Test Author",
            genre="Fantasy",
            description="A test novel for validation",
            target_word_count=100000,
            initial_chapters=3
        )
        print(f"Template created: {template['title']}")
        print(f"Initial chapters: {template['initial_chapters']}")
        print("✓ Project template creation successful")
    except Exception as e:
        print(f"✗ Project template creation failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 3: Validate project data
    print("Test 3: Validate project data")
    try:
        # Valid data
        valid_data = {
            "title": "Valid Novel",
            "author": "Valid Author",
            "target_word_count": 80000,
            "initial_chapters": 5
        }
        is_valid, errors = validate_project_data(valid_data)
        print(f"Valid data check: {is_valid} (errors: {errors})")
        
        # Invalid data
        invalid_data = {
            "title": "",
            "author": "Author",
            "target_word_count": -1000,
            "initial_chapters": 100
        }
        is_valid, errors = validate_project_data(invalid_data)
        print(f"Invalid data check: {is_valid} (errors: {len(errors)} found)")
        print("✓ Project data validation successful")
    except Exception as e:
        print(f"✗ Project data validation failed: {e}")
    
    print("\n" + "=" * 50)
    
    # Test 4: Get project structure (if demo project exists)
    print("Test 4: Get project structure")
    try:
        structure = get_project_structure("demo_novel_001")
        if "error" in structure:
            print(f"No demo project found: {structure['error']}")
        else:
            print(f"Project: {structure['project']['title']}")
            print(f"Chapters: {structure['total_chapters']}")
            print(f"Total words: {structure['total_word_count']}")
        print("✓ Project structure retrieval successful")
    except Exception as e:
        print(f"✗ Project structure retrieval failed: {e}")
    
    print("\nAll project management utility tests completed!")