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

import setuptools
import os
import sys
from shutil import copyfile

print(sys.argv)

current_dir = os.path.realpath(os.path.dirname(os.path.realpath(__file__)))

# Check where to install by default
if "PREFIX" not in os.environ and sys.platform == 'linux':
    from getopt import getopt
    optlist, args = getopt(sys.argv, '', ['prefix=', 'root='])
    for arg,value in optlist:
        if arg == "prefix" or arg == "root":
            os.environ["PREFIX"] = value
    if "PREFIX" not in os.environ and sys.platform == 'linux':
        if "XDG_DATA_HOME" in os.environ:
            os.environ["PREFIX"] = os.environ["XDG_DATA_HOME"]
        else:
            try:
                # Checking if we have permission to write to root.
                from os import makedirs, rmdir
                makedirs("/usr/share/applications/test")
                rmdir("/usr/share/applications/test")
                os.environ["PREFIX"] = "/usr/share"
            except:
                if ".pybuild" in os.environ["HOME"]: # Launchpad building.
                    os.environ["PREFIX"] = "share"
                else:
                    os.environ["PREFIX"] = os.environ["HOME"] + "/.local/share"

from LogarithmPlotter import __VERSION__ as pkg_version

if "--remove-git-version" in sys.argv:
    pkg_version = pkg_version.split(".dev0")[0]
    sys.argv.remove("--remove-git-version")

CLASSIFIERS = """
Environment :: Graphic
Environment :: X11 Applications :: Qt
License :: OSI Approved :: GNU General Public License v3 (GPLv3)
Natural Language :: English
Development Status :: 3 - Alpha
Operating System :: MacOS :: MacOS X
Operating System :: Microsoft :: Windows
Operating System :: POSIX
Operating System :: POSIX :: BSD
Operating System :: POSIX :: Linux
Programming Language :: Python :: 3.8
Programming Language :: Python :: 3.9
Programming Language :: Python :: 3.10
Programming Language :: Python :: 3.11
Programming Language :: Python :: 3.12
Programming Language :: Python :: Implementation :: CPython
Topic :: Utilities
Topic :: Scientific/Engineering
""".strip().splitlines()

def read_file(file_name):
    f = open(file_name, 'r', -1)
    data = f.read()
    f.close()
    return data

def package_data():
    pkg_data = ["logarithmplotter.svg"]
    for d,folders,files in os.walk("LogarithmPlotter/qml"):
        d = d[17:]
        pkg_data += [os.path.join(d, f) for f in files]
    for d,folders,files in os.walk("LogarithmPlotter/i18n"):
        d = d[17:]
        pkg_data += [os.path.join(d, f) for f in files]
    if "FLATPAK_INSTALL" in os.environ:
        pkg_data += ["CHANGELOG.md"]
        
    return pkg_data

data_files = []
if sys.platform == 'linux':
    data_files.append(('share/applications/', ['linux/logarithmplotter.desktop']))
    data_files.append(('share/mime/packages/', ['linux/x-logarithm-plot.xml']))
    data_files.append(('share/icons/hicolor/scalable/mimetypes/', ['linux/application-x-logarithm-plot.svg']))
    data_files.append(('share/icons/hicolor/scalable/apps/', ['logplotter.svg']))
    data_files.append((os.environ["PREFIX"] + '/applications/', ['linux/logarithmplotter.desktop']))
    data_files.append((os.environ["PREFIX"] + '/mime/packages/', ['linux/x-logarithm-plot.xml']))
    data_files.append((os.environ["PREFIX"] + '/icons/hicolor/scalable/mimetypes/', ['linux/application-x-logarithm-plot.svg']))
    data_files.append((os.environ["PREFIX"] + '/icons/hicolor/scalable/apps/', ['logplotter.svg']))
    if len(sys.argv) > 1:
        if sys.argv[1] == "install":
            os.makedirs(os.environ["PREFIX"] + '/applications/', exist_ok=True)
            os.makedirs(os.environ["PREFIX"] + '/mime/packages/', exist_ok=True)
            os.makedirs(os.environ["PREFIX"] + '/icons/hicolor/scalable/mimetypes/', exist_ok=True)
            os.makedirs(os.environ["PREFIX"] + '/icons/hicolor/scalable/apps/', exist_ok=True)
            os.makedirs(os.environ["PREFIX"] + '/metainfo/', exist_ok=True)
            copyfile(current_dir + '/linux/x-logarithm-plot.xml', os.environ["PREFIX"] + '/mime/packages/x-logarithm-plot.xml')
            copyfile(current_dir + '/linux/application-x-logarithm-plot.svg', 
                     os.environ["PREFIX"] + '/icons/hicolor/scalable/mimetypes/application-x-logarithm-plot.svg')
            copyfile(current_dir + '/logplotter.svg', os.environ["PREFIX"] + '/icons/hicolor/scalable/apps/logplotter.svg')
        elif sys.argv[1] == "uninstall":
            os.remove(os.environ["PREFIX"] + '/applications/logarithmplotter.desktop')
            os.remove(os.environ["PREFIX"] + '/mime/packages/x-logarithm-plot.xml')
            os.remove(os.environ["PREFIX"] + '/icons/hicolor/scalable/mimetypes/application-x-logarithm-plot.svg')
            os.remove(os.environ["PREFIX"] + '/icons/hicolor/scalable/apps/logplotter.svg')

setuptools.setup(
    install_requires=([] if "FLATPAK_INSTALL" in os.environ else ["PySide6-Essentials"]),
    python_requires='>=3.8',

    name='logarithmplotter',
    version=pkg_version,

    description='2D plotter software to make BODE plots, sequences and repartition functions.',
    long_description=read_file("README.md"),
    keywords='logarithm plotter graph creator bode diagram',

    author='Ad5001',
    author_email='mail@ad5001.eu',

    license=('GPLv3'),
    url='https://apps.ad5001.eu/logarithmplotter/',

    classifiers=CLASSIFIERS,
    zip_safe=False,
    packages=["LogarithmPlotter", "LogarithmPlotter.util"],
    
    package_data={
        'LogarithmPlotter':package_data(),
    },
    include_package_data=True,
    data_files = data_files,
    entry_points={
        'console_scripts': [
            'logarithmplotter = LogarithmPlotter.logarithmplotter:run',
        ],
    }
)

