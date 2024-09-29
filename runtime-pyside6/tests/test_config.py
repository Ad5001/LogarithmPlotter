import pytest
from LogarithmPlotter.util import config
from tempfile import TemporaryDirectory
from os.path import join


@pytest.fixture()
def resource():
    directory = TemporaryDirectory()
    config.CONFIG_FILE = join(directory.name, "config.json")
    config.init()
    yield config.CONFIG_FILE
    directory.cleanup()


class TestConfig:

    def test_init(self, resource):
        assert config.current_config == config.DEFAULT_SETTINGS

    def test_get(self, resource):
        assert config.getSetting("expression_editor.autoclose") == True
        with pytest.raises(config.UnknownNamespaceError):
            config.getSetting("unknown_setting")

    def test_set(self, resource):
        assert config.setSetting("expression_editor.autoclose", False) is None
        assert config.getSetting("expression_editor.autoclose") == False # Ensure set is working.
        with pytest.raises(config.UnknownNamespaceError):
            config.setSetting("unknown_dict.unknown_setting", False)

    def test_reinit(self, resource):
        default_value = config.getSetting("expression_editor.autoclose")
        config.setSetting("expression_editor.autoclose", not default_value)
        config.init()
        assert config.getSetting("expression_editor.autoclose") != default_value # Ensure setting has been reset.

    def test_save(self, resource):
        config.setSetting("expression_editor.autoclose", False)
        config.save(resource)
        config.init()
        assert config.getSetting("expression_editor.autoclose") == False # Ensure setting has been saved.
