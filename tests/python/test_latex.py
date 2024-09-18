import pytest
from tempfile import TemporaryDirectory
from shutil import which
from os.path import exists
from re import match
from PySide6.QtGui import QColor

from LogarithmPlotter.util import latex

latex.SHOW_GUI_MESSAGES = False


@pytest.fixture()
def latex_obj():
    directory = TemporaryDirectory()
    obj = latex.Latex(directory)
    if not obj.checkLatexInstallation():
        raise Exception("Cannot run LaTeX tests without a proper LaTeX installation. Make sure to install a LaTeX distribution, DVIPNG, and the calligra package, and run the tests again.")
    yield obj
    directory.cleanup()


class TestLatex:
    def test_check_install(self, latex_obj: latex.Latex) -> None:
        assert latex_obj.latexSupported == True
        assert latex_obj.checkLatexInstallation() == True
        bkp = [latex.DVIPNG_PATH, latex.LATEX_PATH]
        # Check what happens when one is missing.
        latex.DVIPNG_PATH = None
        assert latex_obj.latexSupported == False
        assert latex_obj.checkLatexInstallation() == False
        latex.DVIPNG_PATH = bkp[0]
        latex.LATEX_PATH = None
        assert latex_obj.latexSupported == False
        assert latex_obj.checkLatexInstallation() == False
        # Reset
        [latex.DVIPNG_PATH, latex.LATEX_PATH] = bkp

    def test_render(self, latex_obj: latex.Latex) -> None:
        result = latex_obj.render(r"\frac{d\sqrt{\mathrm{f}(x \times 2.3)}}{dx}", 14, QColor(0, 0, 0, 255))
        # Ensure result format
        assert type(result) == str
        [path, width, height] = result.split(",")
        assert exists(path)
        assert match(r"\d+", width)
        assert match(r"\d+", height)
        # Ensure it returns errors on invalid latex.
        with pytest.raises(latex.RenderError):
            latex_obj.render(r"\nonexistant", 14, QColor(0, 0, 0, 255))
        # Replace latex bin with one that returns errors
        bkp = latex.LATEX_PATH
        latex.LATEX_PATH = which("false")
        with pytest.raises(latex.RenderError):
            latex_obj.render(r"\mathrm{f}(x)", 14, QColor(0, 0, 0, 255))
        latex.LATEX_PATH = bkp

    def test_prerendered(self, latex_obj: latex.Latex) -> None:
        args = [r"\frac{d\sqrt{\mathrm{f}(x \times 2.3)}}{dx}", 14, QColor(0, 0, 0, 255)]
        latex_obj.render(*args)
        prerendered = latex_obj.findPrerendered(*args)
        assert type(prerendered) == str
        [path, width, height] = prerendered.split(",")
        assert exists(path)
        assert match(r"\d+", width)
        assert match(r"\d+", height)
        prerendered2 = latex_obj.findPrerendered(args[0], args[1]+2, args[2])
        assert prerendered2 == ""

