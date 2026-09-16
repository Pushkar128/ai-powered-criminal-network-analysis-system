import shutil
import os

path = r"c:\Pushkar work\SIH2026\frontend_react"
if os.path.exists(path):
    shutil.rmtree(path, ignore_errors=True)
    print("Successfully deleted frontend_react folder!")
else:
    print("Folder does not exist.")
