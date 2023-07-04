from PySide6.QtWidgets import QLabel, QVBoxLayout, QHBoxLayout, QFrame
from PySide6.QtGui import QIcon
from qfluentwidgets import PushButton, SwitchButton, ComboBox, PrimaryPushButton, EditableComboBox

from src.module.resource import getResource


class IntroWindow(object):
    def setupUI(self, this_window):
        # 加载 QSS
        with open(getResource("src/style/setting_light.qss"), "r", encoding="UTF-8") as file:
            style_sheet = file.read()
        this_window.setStyleSheet(style_sheet)

        this_window.setWindowTitle("介绍")
        this_window.setWindowIcon(QIcon(getResource("image/icon.png")))
        this_window.resize(500, -1)
        this_window.setFixedSize(self.size())  # 禁止拉伸窗口

        # 标题

        self.extensionTitle = QLabel("扩展名设置")
        self.extensionTitle.setObjectName("settingTitle")
        self.extensionTitle.setIndent(22)

        # 叠叠乐

        layout = QVBoxLayout(this_window)
        layout.setSpacing(12)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.addWidget(self.extensionTitle)
