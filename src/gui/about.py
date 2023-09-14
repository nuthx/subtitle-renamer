from PySide6.QtCore import Qt
from PySide6.QtWidgets import QLabel, QVBoxLayout, QHBoxLayout, QFrame
from PySide6.QtGui import QIcon, QPixmap
from qfluentwidgets import FluentIcon, ToolButton

from src.module.resource import getResource
from src.module.config import configPath
from src.module.version import currentVersion


class AboutWindow(object):
    def setupUI(self, this_window):
        # 加载 QSS
        with open(getResource("src/style/style_light.qss"), "r", encoding="UTF-8") as file:
            style_sheet = file.read()
        this_window.setStyleSheet(style_sheet)

        this_window.setWindowTitle("关于")
        this_window.setWindowIcon(QIcon(getResource("image/icon.png")))
        this_window.resize(550, -1)
        this_window.setFixedSize(self.size())  # 禁止拉伸窗口

        # LOGO

        self.logo = QLabel()
        self.logo.setFixedSize(291, 40)
        self.logo.setPixmap(QPixmap(getResource("image/logo.png")))
        self.logo.setScaledContents(True)

        self.logoLayout = QHBoxLayout()
        self.logoLayout.addWidget(self.logo)

        self.logoFrame = QFrame()
        self.logoFrame.setLayout(self.logoLayout)

        # 版本

        self.versionLabel = QLabel(f"版本 {currentVersion()}")
        self.versionLabel.setObjectName("versionLabel")
        self.versionLabel.setAlignment(Qt.AlignCenter)

        # 计数

        self.openTimesTitle = QLabel("启动次数")
        self.openTimes = QLabel("0")
        self.openTimesCard = self.usageCard(self.openTimesTitle, self.openTimes)

        self.renameTimesTitle = QLabel("重命名次数")
        self.renameTimes = QLabel("0")
        self.renameTimesCard = self.usageCard(self.renameTimesTitle, self.renameTimes)

        self.renameNumTitle = QLabel("重命名数量")
        self.renameNum = QLabel("0")
        self.renameNumcard = self.usageCard(self.renameNumTitle, self.renameNum)

        self.usageCardLayout = QHBoxLayout()
        self.usageCardLayout.setSpacing(12)
        self.usageCardLayout.setContentsMargins(0, 0, 0, 0)
        self.usageCardLayout.addWidget(self.openTimesCard)
        self.usageCardLayout.addWidget(self.renameTimesCard)
        self.usageCardLayout.addWidget(self.renameNumcard)

        # 功能

        self.configPathTitle = QLabel("配置文件")
        self.configPathInfo = QLabel(configPath()[0])

        # self.configPathButton = PushButton("打开", self)
        # self.configPathButton.setFixedWidth(80)
        self.configPathButton = ToolButton(FluentIcon.FOLDER, self)
        self.configPathCard = self.funcCard(self.configPathTitle, self.configPathInfo, self.configPathButton)

        # 叠叠乐

        layout = QVBoxLayout(this_window)
        layout.setSpacing(12)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.addWidget(self.logoFrame)
        layout.addSpacing(-14)
        layout.addWidget(self.versionLabel)
        layout.addSpacing(24)
        layout.addLayout(self.usageCardLayout)
        layout.addWidget(self.configPathCard)

    def usageCard(self, usage_title, usage_times):
        usage_title.setObjectName("cardTitleLabel")
        usage_times.setObjectName("cardTitleLabel")

        self.card1 = QHBoxLayout()
        self.card1.setContentsMargins(16, 12, 16, 12)
        self.card1.addWidget(usage_title, 0)
        self.card1.addStretch(0)
        self.card1.addWidget(usage_times)

        self.cardFrame1 = QFrame()
        self.cardFrame1.setObjectName("cardFrame")
        self.cardFrame1.setLayout(self.card1)

        return self.cardFrame1

    def funcCard(self, card_title, card_info, card_func):
        card_title.setObjectName("cardTitleLabel")
        card_info.setObjectName("cardInfoLabel")

        self.infoPart = QVBoxLayout()
        self.infoPart.setSpacing(2)
        self.infoPart.setContentsMargins(0, 0, 0, 0)
        self.infoPart.addWidget(card_title)
        self.infoPart.addWidget(card_info)

        self.card2 = QHBoxLayout()
        self.card2.setContentsMargins(16, 16, 16, 16)
        self.card2.addLayout(self.infoPart, 0)
        self.card2.addStretch(0)
        self.card2.addWidget(card_func)

        self.cardFrame2 = QFrame()
        self.cardFrame2.setObjectName("cardFrame")
        self.cardFrame2.setLayout(self.card2)

        return self.cardFrame2
