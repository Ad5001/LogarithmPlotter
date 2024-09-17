import pytest
from os.path import join
from tempfile import TemporaryDirectory
from LogarithmPlotter.util import config


@pytest.fixture()
def resource():
    directory = TemporaryDirectory()
    config.CONFIG_PATH = join(directory.name, "config.json")
    tmpfile = join(directory.name, 'graph.png')
    yield tmpfile
    directory.cleanup()