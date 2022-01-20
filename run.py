
def update_translations():
    """
    Updates all binary translations
    """
    from os import system, getcwd, chdir, path
    pwd = getcwd()
    chdir(path.join("LogarithmPlotter", "i18n"))
    system("./release.sh")
    chdir(pwd)

def run():
    update_translations()
    from LogarithmPlotter import logarithmplotter 
    logarithmplotter.run()

if __name__ == "__main__":
    run()
 
