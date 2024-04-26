import os
import platform
import configparser


# 配置文件路径
def configPath():
    # 定位系统配置文件所在位置
    if platform.system() == "Windows":
        config_path = os.environ["APPDATA"]
    elif platform.system() == "Darwin":
        config_path = os.path.expanduser("~/Library/Application Support")
    elif platform.system() == "Linux":
        config_path = os.path.expanduser("~/.config")
    else:
        return "N/A"

    config_path = config_path + os.sep + "SubtitleRenamer"
    config_file = config_path + os.sep + "config.ini"

    # 是否存在该路径，否则创建
    if not os.path.exists(config_path):
        os.makedirs(config_path)

    return config_path, config_file


# 初始化配置
def initConfig(config_file):
    config = configparser.ConfigParser()

    config.add_section("Application")
    config.set("Application", "version", "1.7")
    config.set("Application", "theme", "0")
    config.set("Application", "sc", "true")
    config.set("Application", "tc", "false")

    config.add_section("Extension")
    config.set("Extension", "sc", "")
    config.set("Extension", "tc", "")

    config.add_section("General")
    config.set("General", "remove_unused_sub", "true")
    config.set("General", "move_renamed_sub", "0")
    config.set("General", "encode", "Never")

    config.add_section("Counter")
    config.set("Counter", "open_times", "0")
    config.set("Counter", "rename_times", "0")
    config.set("Counter", "rename_num", "0")

    config.add_section("Video")
    config.set("Video", "more_extension", "")

    # 写入配置内容
    with open(config_file, "w", encoding="utf-8") as content:
        config.write(content)


# 检测配置文件合法性
def checkConfig(config, config_file):
    if config.get("Application", "theme") not in ["0", "1", "2"]:
        config.set("Application", "theme", "0")

    if config.get("Application", "sc") not in ["true", "false"]:
        config.set("Application", "sc", "true")

    if config.get("Application", "tc") not in ["true", "false"]:
        config.set("Application", "tc", "false")

    if config.get("General", "remove_unused_sub") not in ["true", "false"]:
        config.set("General", "remove_unused_sub", "true")

    if config.get("General", "move_renamed_sub") not in ["0", "1", "2"]:
        config.set("General", "move_renamed_sub", "0")

    if config.get("General", "encode") not in ["Never", "UTF-8", "UTF-8-SIG"]:
        config.set("General", "encode", "Never")

    # 写入配置内容
    with open(config_file, "w", encoding="utf-8") as content:
        config.write(content)


# 更新配置文件
def updateConfigFile(config_file):
    config = configparser.ConfigParser()
    config.read(config_file)

    # 记录计数器
    open_times = config.get("Counter", "open_times")
    rename_times = config.get("Counter", "rename_times")
    rename_num = config.get("Counter", "rename_num")

    # 版本不符则重建配置文件
    if not config.has_section("Application") or config.get("Application", "version") != "1.7":
        os.remove(config_file)
        initConfig(config_file)

        # 重新读取配置文件
        config = configparser.ConfigParser()
        config.read(config_file)

        # 更新计数器
        config.set("Counter", "open_times", open_times)
        config.set("Counter", "rename_times", rename_times)
        config.set("Counter", "rename_num", rename_num)

        # 写入配置内容
        with open(config_file, "w", encoding="utf-8") as content:
            config.write(content)


# 读取配置
def readConfig():
    config = configparser.ConfigParser()
    config_file = configPath()[1]

    # 不存在则创建新配置
    if not os.path.exists(config_file):
        initConfig(config_file)

    # 更新配置
    config.read(config_file)
    updateConfigFile(config_file)

    # 检测合法性（再次读取获得新配置内容）
    config.read(config_file)
    checkConfig(config, config_file)

    return config
