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

import setuptools
import os
import sys

current_dir = os.path.realpath(os.path.dirname(os.path.realpath(__file__)))

from LogarithmPlotter import __VERSION__ as pkg_version

CLASSIFIERS = """
Environment :: Graphic
Environment :: X11 Applications :: Qt
License :: OSI Approved :: GNU General Public License v3 (GPLv3)
Natural Language :: English
Development Status :: 4 - Beta
Operating System :: MacOS :: MacOS X
Operating System :: Microsoft :: Windows
Operating System :: POSIX
Operating System :: POSIX :: BSD
Operating System :: POSIX :: Linux
Programming Language :: Python :: 3.8
Programming Language :: Python :: 3.9
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
    pkg_data = []
    for d,folders,files in os.walk("LogarithmPlotter/qml"):
        d = d[17:]
        pkg_data += [os.path.join(d, f) for f in files]
    print("Pkgdata", pkg_data)
    return pkg_data

data_files = []
if sys.platform == 'linux':
    data_files.append(('/usr/share/applications/', ['linux/logarithmplotter.desktop']))
    data_files.append(('/usr/share/mime/packages/', ['linux/x-logarithm-plotter.xml']))
    data_files.append(('/usr/share/icons/hicolor/scalable/mimetypes/', ['linux/application-x-logarithm-plotter.svg']))
    data_files.append(('/usr/share/icons/hicolor/scalable/apps/', ['logplotter.svg']))

setuptools.setup(
    install_requires=["PySide2"],
    python_requires='>=3.8',

    name='logarithmplotter',
    version=pkg_version,

    description='Browse and use online services, free of account',
    long_description=read_file("README.md"),
    keywords='logarithm plotter graph creator bode diagram',

    author='Ad5001',
    author_email='mail@ad5001.eu',

    license=('GPLv3'),
    url='https://apps.ad5001.eu/logarithmplotter',

    classifiers=CLASSIFIERS,
    zip_safe=False,
    packages=["LogarithmPlotter"],
    
    package_data={
        'LogarithmPlotter':package_data(),
    },
    include_package_data=True,
    data_files = data_files,
    entry_points={
        'console_scripts': [
            'logarithmplotter = LogarithmPlotter:run',
        ],
    }
)

