"""
 *  LogarithmPlotter - 2D plotter software to make BODE plots, sequences and distribution functions.
 *  Copyright (C) 2021-2024  Ad5001
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

import pytest
from tempfile import TemporaryDirectory
from shutil import which
from os.path import exists
from re import match
from PySide6.QtGui import QColor
from PySide6.QtQml import QJSValue

from LogarithmPlotter.util import latex

latex.SHOW_GUI_MESSAGES = False


@pytest.fixture()
def latex_obj():
    directory = TemporaryDirectory()
    obj = latex.Latex(directory.name)
    if not obj.checkLatexInstallation():
        raise Exception("Cannot run LaTeX tests without a proper LaTeX installation. Make sure to install a LaTeX distribution, DVIPNG, and the calligra package, and run the tests again.")
    yield obj
    directory.cleanup()


BLACK = QColor(0, 0, 0, 255)
BLUE = QColor(128, 128, 255, 255)

def check_render_results(result):
    if isinstance(result, QJSValue):
        result = result.toVariant()
    assert type(result) == str
    [path, width, height] = result.split(",")
    assert exists(path)
    assert match(r"\d+", width)
    assert match(r"\d+", height)
    return True

class TestLatex:
    def test_check_install(self, latex_obj: latex.Latex) -> None:
        assert latex_obj.latexSupported == True
        assert latex_obj.checkLatexInstallation() == True
        assert type(latex_obj.supportsAsyncRender) is bool
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

    def test_render_sync(self, latex_obj: latex.Latex) -> None:
        result = latex_obj.renderSync("\\frac{d \\sqrt{\\mathrm{f}(x \\times 2.3)}}{dx}", 14, BLACK)
        # Ensure result format
        check_render_results(result)
        # Ensure it returns errors on invalid latex.
        with pytest.raises(latex.RenderError):
            latex_obj.renderSync("\\nonexistant", 14, BLACK)
        # Replace latex bin with one that returns errors
        bkp = latex.LATEX_PATH
        latex.LATEX_PATH = which("false")
        with pytest.raises(latex.RenderError):
            latex_obj.renderSync("\\mathrm{f}(x)", 14, BLACK)
        # Replace latex bin with one goes indefinitely
        latex.LATEX_PATH = which("import")
        with pytest.raises(latex.RenderError):
            latex_obj.renderSync("\\mathrm{f}(x)", 14, BLACK)
        latex.LATEX_PATH = bkp

    def test_prerendered(self, latex_obj: latex.Latex) -> None:
        args = ["\\frac{d \\sqrt{\\mathrm{f}(x \\times 2.3)}}{dx}", 14, BLACK]
        latex_obj.renderSync(*args)
        prerendered = latex_obj.findPrerendered(*args)
        assert type(prerendered) == str
        [path, width, height] = prerendered.split(",")
        assert exists(path)
        assert match(r"\d+", width)
        assert match(r"\d+", height)
        prerendered2 = latex_obj.findPrerendered(args[0], args[1]+2, args[2])
        assert prerendered2 == ""

    def test_render_async(self, latex_obj: latex.Latex, qtbot) -> None:
        formula = "\\int\\limits^{3x}_{-\\infty}9\\mathrm{f}(x)^3+t dx"
        og_promise = latex_obj.renderAsync(formula, 14, BLACK)
        # Ensure we get the same locked one if we try to render it again.
        assert og_promise == latex_obj.renderAsync(formula, 14, BLACK)
        # Ensure queued renders.
        promises = [
            latex_obj.renderAsync(formula, 14, BLUE),
            latex_obj.renderAsync(formula, 10, BLACK),
            latex_obj.renderAsync(formula, 10, BLUE),
        ]
        for prom in promises:
            assert og_promise.calls_upon_fulfillment(prom.start)
        # Ensure other renders get done in parallel.
        other_promise = latex_obj.renderAsync(formula+" dt", 10, BLACK)
        assert not og_promise.calls_upon_fulfillment(other_promise.start)
        # Ensure all of them render.
        proms = [og_promise, *promises, other_promise]
        with qtbot.waitSignals(
            [p.fulfilled for p in proms],
            raising=True, timeout=10000,
            check_params_cbs=[check_render_results]*len(proms)
        ):
            pass
