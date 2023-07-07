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

    config.add_section("Extension")
    config.set("Extension", "sc", "")
    config.set("Extension", "tc", "")

    config.add_section("General")
    config.set("General", "move_to_anime_folder", "true")
    config.set("General", "remove_unused_sub", "true")
    config.set("General", "encode", "不转换")

    config.add_section("Funny")
    config.set("Funny", "open_times", "0")
    config.set("Funny", "rename_times", "0")
    config.set("Funny", "rename_num", "0")

    # 写入配置内容
    with open(config_file, "w") as content:
        config.write(content)


# 检测配置文件合法性
def checkConfig(config, config_file):
    if config.get("General", "move_to_anime_folder") not in ["true", "false"]:
        config.set("General", "move_to_anime_folder", "true")

    if config.get("General", "remove_unused_sub") not in ["true", "false"]:
        config.set("General", "remove_unused_sub", "true")

    if config.get("General", "encode") not in ["不转换", "UTF-8", "UTF-8-SIG"]:
        config.set("General", "encode", "None")

    # 迁移旧版配置
    if config.has_option("Funny", "usage_times"):
        rename_times = config.get("Funny", "usage_times")
        config.set("Funny", "rename_times", rename_times)
        config.remove_option("Funny", "usage_times")

    if config.has_option("Funny", "renamed_sub"):
        rename_num = config.get("Funny", "renamed_sub")
        config.set("Funny", "rename_num", rename_num)
        config.remove_option("Funny", "renamed_sub")

    # 写入配置内容
    with open(config_file, "w") as content:
        config.write(content)


# 读取配置
def readConfig():
    config = configparser.ConfigParser()
    config_file = configPath()[1]

    # 不存在则创建新配置
    if not os.path.exists(config_file):
        initConfig(config_file)

    config.read(config_file)
    checkConfig(config, config_file)
    return config
