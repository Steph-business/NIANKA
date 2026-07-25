import sys
from pathlib import Path

# Auto-register workspace root and backend directory in sys.path
backend_dir = Path(__file__).resolve().parent
project_root = backend_dir.parent

for p in [str(project_root), str(backend_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)
