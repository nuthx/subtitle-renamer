import re
import requests


def currentVersion():
    current_version = "1.8.1"
    return current_version


def latestVersion():
    url = "https://api.github.com/repos/nuthx/subtitle-renamer/releases/latest"
    response = requests.get(url).json()
    latest_version = response["tag_name"]

    return latest_version


def newVersion():
    current_version = currentVersion()
    latest_version = latestVersion()

    if current_version != latest_version:
        return True
    else:
        return False
