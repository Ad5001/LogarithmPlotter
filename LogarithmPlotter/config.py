"""
 *  LogarithmPlotter - Create graphs with logarithm scales.
 *  Copyright (C) 2021  Ad5001
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

DEFAULT_SETTINGS = {
    "check_for_updates": True,
    "last_install_greet": "0",
    "lang": "en"
}

# Create config directory
CONFIG_PATH = {
    "Linux": path.join(environ["XDG_CONFIG_HOME"], "LogarithmPlotter") if "XDG_CONFIG_HOME" in environ else path.join(path.expanduser("~"), ".config", "LogarithmPlotter"),
    "Windows": path.join(path.expandvars('%APPDATA%'), "LogarithmPlotter", "config"),
    "Darwin": path.join(path.expanduser("~"), "Library", "Application Support", "LogarithmPlotter"),
}[system()]

CONFIG_FILE = path.join(CONFIG_PATH, "config.json")
CONFIG = DEFAULT_SETTINGS

def init():
    """
    Initializes the config and loads all possible settings from the file if needs be.
    """
    makedirs(CONFIG_PATH, exist_ok=True)

    if path.exists(CONFIG_FILE):
        cfg_data = load(open(CONFIG_FILE, 'r',  -1, 'utf8'))
        for setting_name in cfg_data:
            setSetting(setting_name, cfg_data[setting_name])

def save():
    """
    Saves the config to the path.
    """
    write_file = open(CONFIG_FILE, 'w', -1, 'utf8')
    write_file.write(dumps(CONFIG))
    write_file.close()

def getSetting(namespace):
    """
    Returns a setting from a namespace.
    E.g: if the config is {"test": {"foo": 1}}, you can access the "foo" setting 
    by using the "test.foo" namespace.
    """
    names = namespace.split(".")
    setting = CONFIG
    for name in names:
        if name in setting:
            setting = setting[name]
        else:
            # return namespace # Return original name
            raise ValueError('Setting ' + namespace + ' doesn\'t exist. Debug: ', setting, name)
    return setting

def setSetting(namespace, data):
    """
    Sets a setting at a namespace with data.
    E.g: if the config is {"test": {"foo": 1}}, you can access the "foo" setting 
    by using the "test.foo" namespace.
    """
    names = namespace.split(".")
    setting = CONFIG
    for name in names:
        if name != names[-1]:
            if name in setting:
                setting = setting[name]
            else:
                raise ValueError('Setting {} doesn\'t exist. Debug: {}, {}'.format(namespace, setting, name))
        else:
            setting[name] = data
