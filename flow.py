"""
Flow Definitions for AI Novel Writer

This module contains all the flow definitions that orchestrate the various nodes
using Pocket Flow's flow composition patterns.
"""

from pocketflow import Flow
from nodes import (
    ProjectManagerNode, 
    TextEditorNode,
    WritingAssistantNode,
    KnowledgeBaseNode,
    TimelineManagerNode
)

def create_project_setup_flow():
    """Create a flow for setting up a new novel project"""
    project_manager = ProjectManagerNode()
    
    # Simple flow for project creation
    return Flow(start=project_manager)

def create_project_creation_flow():
    """Create a flow specifically for creating new projects with user input"""
    project_manager = ProjectManagerNode()
    
    return Flow(start=project_manager)

def create_project_loading_flow():
    """Create a flow for loading existing projects"""
    project_manager = ProjectManagerNode()
    
    return Flow(start=project_manager)

def create_writing_flow():
    """Create the main writing assistance flow"""
    text_editor = TextEditorNode()
    writing_assistant = WritingAssistantNode()
    knowledge_base = KnowledgeBaseNode()
    timeline_manager = TimelineManagerNode()
    
    # Chain the nodes: text editing -> writing assistance -> knowledge update -> timeline tracking
    flow = text_editor >> writing_assistant >> knowledge_base >> timeline_manager
    
    return Flow(start=text_editor)

def create_analysis_flow():
    """Create a background analysis flow for knowledge base updates"""
    knowledge_base = KnowledgeBaseNode()
    timeline_manager = TimelineManagerNode()
    
    # Background processing flow
    flow = knowledge_base >> timeline_manager
    
    return Flow(start=knowledge_base)

def create_export_flow():
    """Create a flow for exporting manuscripts"""
    # Will be implemented in later tasks
    pass

def create_sync_flow():
    """Create a flow for Google Docs synchronization"""
    # Will be implemented in later tasks
    pass