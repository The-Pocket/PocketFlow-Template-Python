# Project Structure

This project follows the Agentic Coding methodology from Pocket Flow, emphasizing human-AI collaboration where humans design and AI agents implement.

## Root Directory
- `main.py`: Entry point demonstrating example flows and serving as project launcher
- `flow.py`: Flow definition and node composition using `>>` operator for chaining
- `nodes.py`: Node implementations with prep/exec/post lifecycle methods
- `requirements.txt`: Python dependencies (must include `pocketflow>=0.0.1`)

## Key Directories

### `/utils/`
External utility functions that serve as the "body" for the AI system brain:
- `call_llm.py`: OpenAI API integration with test function in `if __name__ == "__main__"`
- Each utility should be in its own file (e.g., `search_web.py`, `get_embedding.py`)
- Include simple test functions for each utility
- **Important**: Avoid exception handling in utilities - let Node retry mechanisms handle failures
- `__init__.py`: Package initialization

### `/docs/`
Documentation following Agentic Coding methodology:
- `design.md`: High-level, no-code design document with specific sections:
  - Requirements (user-centric problem statements)
  - Flow Design (with mermaid diagrams and design patterns)
  - Utility Functions (input/output specs and necessity)
  - Data Design (shared store structure)
  - Node Design (prep/exec/post specifications)

### `/assets/`
Static resources:
- `banner.png`: Project banner image
- Other project assets

### `/.github/`
GitHub-specific configurations including Copilot setup

## AI Assistant Configuration Files
Multiple rule files for different AI coding assistants:
- `.cursorrules`: Cursor AI configuration
- `.clinerules`: Cline configuration  
- `.windsurfrules`: Windsurf configuration
- `.goosehints`: Goose configuration
- `CLAUDE.md`: Comprehensive Claude guidance (primary reference)
- `GEMINI.md`: Gemini guidance

## Agentic Coding Workflow Structure

### 1. Requirements Phase
- Focus on user-centric problem statements
- Balance complexity vs. impact
- Identify AI system strengths/limitations fit

### 2. Flow Design Phase
- Apply design patterns: Agent, Map-Reduce, RAG, Workflow
- Create mermaid diagrams for visual flow representation
- High-level one-line descriptions for each node
- Design before implementation principle

### 3. Utility Functions Phase
- Implement external interfaces (reading inputs, writing outputs, external tools)
- One file per API/function with test capabilities
- Document input/output and necessity for each utility

### 4. Data Design Phase
- Design shared store as data contract between nodes
- Use in-memory dict for simple systems, database for complex ones
- Avoid data redundancy with references/foreign keys

### 5. Node Design Phase
- Specify node types: Regular, Batch, or Async
- Define prep/exec/post responsibilities
- Map utility function usage per node

### 6. Implementation Phase
- Keep it simple - avoid complex features initially
- Fail fast with built-in retry mechanisms
- Add comprehensive logging for debugging

## Code Organization Patterns

### Flow Composition
- **Flows**: Define in `flow.py` using node composition with `>>` operator
- **Action-based transitions**: Use `node_a - "action" >> node_b` for conditional flows
- **Flow creation functions**: Return `Flow(start=start_node)` objects

### Node Architecture
- **Nodes**: Implement in `nodes.py` inheriting from `pocketflow.Node`
- **Lifecycle methods**: `prep()` reads shared store, `exec()` performs work, `post()` writes results
- **Node types**: Regular, BatchNode, AsyncNode for different processing patterns
- **Shared store communication**: Primary method for inter-node data exchange

### Utility Functions
- **External interfaces**: Place in `/utils/` directory with individual files
- **Testing**: Include `if __name__ == "__main__"` test blocks
- **Error handling**: Let Node retry mechanisms handle failures, not utilities
- **API abstraction**: One file per external service/API

### Documentation Standards
- **Design-first**: Always create `docs/design.md` before implementation
- **High-level focus**: Keep documentation conceptual, not code-specific
- **Iterative refinement**: Expect to iterate Steps 3-6 hundreds of times

## Naming Conventions
- **Node classes**: PascalCase ending with "Node" (e.g., `GetQuestionNode`, `SummarizeNode`)
- **Flow functions**: snake_case starting with "create_" (e.g., `create_qa_flow`, `create_rag_flow`)
- **Utility functions**: snake_case descriptive names (e.g., `call_llm`, `search_web`, `get_embedding`)
- **Shared store keys**: snake_case descriptive keys (e.g., `user_question`, `llm_response`)

## Design Patterns Integration
- **Agent**: Autonomous decision-making with context and actions
- **Map-Reduce**: Split data processing with BatchNode for mapping, regular Node for reducing
- **RAG**: Retrieval-Augmented Generation with embedding and vector search utilities
- **Workflow**: Sequential task chaining with conditional branching
- **Multi-Agent**: Coordinated agent interactions (advanced pattern)

## Best Practices
- **Start simple**: Begin with minimal viable implementation
- **Design first**: Always create design document before coding
- **Fail fast**: Leverage built-in retry and fallback mechanisms
- **Human-AI collaboration**: Humans design, AI implements
- **Iterative development**: Expect multiple refinement cycles
- **Shared store focus**: Use shared store for almost all inter-node communication
- **Utility separation**: Keep external interfaces separate from core logic