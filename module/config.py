import os
import platform

from PySide6.QtCore import QFileInfo, QSettings


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

    # 是否存在该路径，否则创建
    if not os.path.exists(config_path):
        os.makedirs(config_path)

    return config_path









# 读取配置
def readConfig(self):
    config_file = QFileInfo("config.ini")
    settings = QSettings("config.ini", QSettings.IniFormat)

    # 如果不存在配置文件，则创建
    if not config_file.exists():
        open(config_file.filePath(), "w").write("")  # 创建配置文件，并写入空内容
        name_type = "{b_initial_name}/[{b_typecode}] [{b_release_date}] {b_jp_name}"  # 默认格式
        settings.setValue("type", name_type)

    input_text = settings.value("type", "")
    self.type_input.setText(str(input_text))







def save_config(self):
    input_text = self.type_input.text()

    # 花括号内容是否合规模块
    work_type = ["b_id", "romaji_name", "b_jp_name", "b_cn_name", "b_initial_name", "b_type", "b_typecode",
                 "b_release_date", "b_episodes"]
    pattern = r"\{(.*?)\}"
    matches = re.findall(pattern, input_text)
    for match in matches:
        if match not in work_type:
            self.warning_dialog("不支持的格式变量，请检查花括号内容")
            return

    # 花括号是否成对
    if not function.check_braces(input_text):
        self.warning_dialog("花括号结构有误，请检查")
        return

    # 是否有多个斜杠
    if input_text.count("/") > 1:
        self.warning_dialog("最多支持一个父文件夹嵌套")
        return

    # 写入配置
    settings = QtCore.QSettings("config.ini", QtCore.QSettings.IniFormat)
    settings.setValue("type", input_text)
    self.success_dialog("配置已保存<br>请重新分析后再开始重命名")

