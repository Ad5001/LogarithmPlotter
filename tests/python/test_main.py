import pytest

from LogarithmPlotter.logarithmplotter import get_linux_theme

THEMES = [
    "Basic",
    "Universal",
    "Material",
    "Fusion",
    "Windows",
    "macOS"
]

class TestMain:
    def test_themes(self):
        get_linux_theme()