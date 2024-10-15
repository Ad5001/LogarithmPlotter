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

from os import path, environ, makedirs
from platform import system
from json import load, dumps
from PySide6.QtCore import QLocale, QTranslator

DEFAULT_SETTINGS = {
    "check_for_updates": True,
    "reset_redo_stack": True,
    "last_install_greet": "0",
    "enable_latex": False,
    "enable_latex_async": False,
    "expression_editor": {
        "autoclose": True,
        "colorize": True,
        "color_scheme": 0,
    },
    "autocompletion": {
        "enabled": True
    },
    "default_graph": {
        "xzoom": 100,
        "yzoom": 10,
        "xmin": 5 / 10,
        "ymax": 25,
        "xaxisstep": "4",
        "yaxisstep": "4",
        "xlabel": "",
        "ylabel": "",
        "linewidth": 1,
        "textsize": 18,
        "logscalex": True,
        "showxgrad": True,
        "showygrad": True
    }
}

# Create config directory
CONFIG_PATH = {
    "Linux": path.join(environ["XDG_CONFIG_HOME"], "LogarithmPlotter")
    if "XDG_CONFIG_HOME" in environ else
    path.join(path.expanduser("~"), ".config", "LogarithmPlotter"),
    "Windows": path.join(path.expandvars('%APPDATA%'), "LogarithmPlotter", "config"),
    "Darwin": path.join(path.expanduser("~"), "Library", "Application Support", "LogarithmPlotter"),
}[system()]

CONFIG_FILE = path.join(CONFIG_PATH, "config.json")

current_config = DEFAULT_SETTINGS


class UnknownNamespaceError(Exception): pass


def init():
    """
    Initializes the config and loads all possible settings from the file if needs be.
    """
    global current_config
    current_config = DEFAULT_SETTINGS
    makedirs(CONFIG_PATH, exist_ok=True)

    if path.exists(CONFIG_FILE):
        cfg_data = load(open(CONFIG_FILE, 'r', -1, 'utf8'))
        for setting_name in cfg_data:
            if type(cfg_data[setting_name]) == dict:
                for setting_name2 in cfg_data[setting_name]:
                    setSetting(setting_name + "." + setting_name2, cfg_data[setting_name][setting_name2])
            else:
                setSetting(setting_name, cfg_data[setting_name])


def save(file=CONFIG_FILE):
    """
    Saves the config to the path.
    """
    write_file = open(file, 'w', -1, 'utf8')
    write_file.write(dumps(current_config))
    write_file.close()


def getSetting(namespace):
    """
    Returns a setting from a namespace.
    E.g: if the config is {"test": {"foo": 1}}, you can access the "foo" setting 
    by using the "test.foo" namespace.
    """
    names = namespace.split(".")
    setting = current_config
    for name in names:
        if name in setting:
            setting = setting[name]
        else:
            # return namespace # Return original name
            raise UnknownNamespaceError(f"Setting {namespace} doesn't exist. Debug: {setting}, {name}")
    return setting


def setSetting(namespace, data):
    """
    Sets a setting at a namespace with data.
    E.g: if the config is {"test": {"foo": 1}}, you can access the "foo" setting 
    by using the "test.foo" namespace.
    """
    names = namespace.split(".")
    setting = current_config
    for name in names[:-1]:
        if name in setting:
            setting = setting[name]
        else:
            raise UnknownNamespaceError(f"Setting {namespace} doesn't exist. Debug: {setting}, {name}")
    setting[names[-1]] = data
