from src.module.config import readConfig, configPath


def addOpenTimes():
    config = readConfig()
    open_times = int(config.get("Funny", "open_times")) + 1
    config.set("Funny", "open_times", str(open_times))

    with open(configPath()[1], "w") as content:
        config.write(content)


def addRenameTimes():
    config = readConfig()
    rename_times = int(config.get("Funny", "rename_times")) + 1
    config.set("Funny", "rename_times", str(rename_times))

    with open(configPath()[1], "w") as content:
        config.write(content)


def addRenameNum(rename_num):
    config = readConfig()
    rename_num = int(config.get("Funny", "rename_num")) + rename_num
    config.set("Funny", "rename_num", str(rename_num))

    with open(configPath()[1], "w") as content:
        config.write(content)
