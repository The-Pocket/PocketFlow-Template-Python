# Technology Stack

## Framework & Dependencies
- **Pocket Flow**: Core framework for node-based LLM workflows (100-line framework)
- **OpenAI Python SDK**: For LLM integration (GPT-4o model)
- **Python 3.x**: Primary programming language

## Key Libraries
- `pocketflow>=0.0.1`: Main framework dependency
- `openai`: OpenAI API client for LLM calls

## Architecture Patterns
- **Node-based workflows**: Applications built as connected nodes with prep/exec/post lifecycle
- **Shared state management**: Data passed between nodes via shared dictionary
- **Flow composition**: Nodes connected using `>>` operator to create execution chains

## Environment Setup
- Requires `OPENAI_API_KEY` environment variable for LLM functionality
- Install dependencies: `pip install -r requirements.txt`

## Common Commands
```bash
# Install dependencies
pip install -r requirements.txt

# Run the main application
python main.py

# Test LLM utility function
python utils/call_llm.py
```

## Development Notes
- Follow the design document template in `docs/design.md` for new features
- Utility functions should be placed in the `utils/` directory
- Each node should implement prep/exec/post methods as needed