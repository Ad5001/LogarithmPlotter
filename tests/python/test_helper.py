import pytest
from os import getcwd
from os.path import join
from tempfile import TemporaryDirectory
from LogarithmPlotter.util import config

pwd = getcwd()


@pytest.fixture()
def temporary():
    directory = TemporaryDirectory()
    config.CONFIG_PATH = join(directory.name, "config.json")
    tmpfile = join(directory.name, "graph.png")
    yield tmpfile
    directory.cleanup()
