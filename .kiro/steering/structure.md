# Project Structure

## Root Directory
- `main.py`: Entry point demonstrating example Q&A flow
- `flow.py`: Flow definition and node composition
- `nodes.py`: Node implementations with prep/exec/post methods
- `requirements.txt`: Python dependencies

## Key Directories

### `/utils/`
Utility functions for common operations:
- `call_llm.py`: OpenAI API integration for LLM calls
- `__init__.py`: Package initialization

### `/docs/`
Documentation and design specifications:
- `design.md`: Template for documenting flow design, requirements, and node architecture

### `/assets/`
Static resources:
- `banner.png`: Project banner image

### `/.github/`
GitHub-specific configurations including Copilot setup

## AI Assistant Configuration Files
Multiple rule files for different AI coding assistants:
- `.cursorrules`: Cursor AI configuration
- `.clinerules`: Cline configuration  
- `.windsurfrules`: Windsurf configuration
- `.goosehints`: Goose configuration
- `CLAUDE.md`: Claude Code guidance
- `GEMINI.md`: Gemini guidance

## Code Organization Patterns
- **Flows**: Define in `flow.py` using node composition with `>>` operator
- **Nodes**: Implement in `nodes.py` inheriting from `pocketflow.Node`
- **Utilities**: Place reusable functions in `/utils/` directory
- **Documentation**: Follow `/docs/design.md` template for new features

## Naming Conventions
- Node classes: PascalCase ending with "Node" (e.g., `GetQuestionNode`)
- Flow functions: snake_case starting with "create_" (e.g., `create_qa_flow`)
- Utility functions: snake_case descriptive names (e.g., `call_llm`)