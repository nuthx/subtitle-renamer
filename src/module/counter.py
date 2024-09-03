def addOpenTimes(config, config_path):
    open_times = int(config.get("Counter", "open_times")) + 1
    config.set("Counter", "open_times", str(open_times))

    with open(config_path[1], "w", encoding="utf-8") as content:
        config.write(content)


def addRenameTimes(config, config_path):
    rename_times = int(config.get("Counter", "rename_times")) + 1
    config.set("Counter", "rename_times", str(rename_times))

    with open(config_path[1], "w", encoding="utf-8") as content:
        config.write(content)


def addRenameNum(config, config_path, rename_num):
    rename_num = int(config.get("Counter", "rename_num")) + rename_num
    config.set("Counter", "rename_num", str(rename_num))

    with open(config_path[1], "w", encoding="utf-8") as content:
        config.write(content)
