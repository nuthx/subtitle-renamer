from PySide6.QtWidgets import QLabel, QVBoxLayout, QHBoxLayout, QFrame
from PySide6.QtGui import QIcon
from qfluentwidgets import (Theme, setTheme, PushButton, SwitchButton, ComboBox, PrimaryPushButton, EditableComboBox,
                            LineEdit, setThemeColor, qconfig)

from src.module.resource import getResource


class SettingWindow(object):
    def setupUI(self, this_window):
        this_window.setWindowTitle("设置")
        this_window.setWindowIcon(QIcon(getResource("image/icon.png")))
        this_window.resize(800, 600)
        this_window.setFixedSize(self.size())  # 禁止拉伸窗口

        # =================================================
        # 主题设置
        self.themeTitle = QLabel("主题设置")
        self.themeTitle.setObjectName("settingTitle")
        self.themeTitle.setIndent(22)

        # 主题模式
        self.themeSelectTitle = QLabel("主题模式")
        self.themeSelectInfo = QLabel("当前主题：跟随系统")
        self.themeSelectSwitch = ComboBox(self)
        self.themeSelectSwitch.setMinimumWidth(240)
        self.themeSelectSwitch.setMaximumWidth(240)
        self.themeSelectSwitch.addItems(["跟随系统", "浅色模式", "深色模式"])
        self.themeSelectSwitch.setCurrentIndex(0)  # 默认第一个
        self.themeSelectSwitch.currentIndexChanged.connect(self.themeSelectFunction)
        self.themeSelectCard = self.settingCard(self.themeSelectTitle, self.themeSelectInfo, self.themeSelectSwitch)

        # =================================================
        # 视频格式设置
        self.videoTypeTitle = QLabel("视频格式设置")
        self.videoTypeTitle.setObjectName("settingTitle")
        self.videoTypeTitle.setIndent(22)

        # 简体字幕扩展名
        self.videoTitle = QLabel("简体字幕扩展名")
        self.videoInfo = QLabel("用于支持更多视频格式，扩展名使用英文逗号分隔，如 rm, rmvb")
        self.videoFormat = LineEdit(self)
        self.videoFormat.setMinimumWidth(240)
        self.videoFormat.setMaximumWidth(240)
        self.videoFormat.setPlaceholderText("默认已支持常见视频文件")
        self.videoCard = self.settingCard(self.videoTitle, self.videoInfo, self.videoFormat)

        # =================================================
        # 扩展名设置
        self.extensionTitle = QLabel("扩展名设置")
        self.extensionTitle.setObjectName("settingTitle")
        self.extensionTitle.setIndent(22)

        # 简体字幕扩展名
        self.scTitle = QLabel("简体字幕扩展名")
        self.scInfo = QLabel("默认为空，设置后会显示在字幕扩展名之前")
        self.scFormat = EditableComboBox(self)
        self.scFormat.setMinimumWidth(240)
        self.scFormat.setMaximumWidth(240)
        self.scFormat.addItems([".sc", ".chs", ".zh-Hans"])
        self.scFormat.setPlaceholderText("不添加简体扩展名")
        self.scCard = self.settingCard(self.scTitle, self.scInfo, self.scFormat)

        # 繁体字幕扩展名
        self.tcTitle = QLabel("繁体字幕扩展名")
        self.tcInfo = QLabel("默认为空，设置后会显示在字幕扩展名之前")
        self.tcFormat = EditableComboBox(self)
        self.tcFormat.setMinimumWidth(240)
        self.tcFormat.setMaximumWidth(240)
        self.tcFormat.addItems([".tc", ".cht", ".zh-Hant"])
        self.tcFormat.setPlaceholderText("不添加繁体扩展名")
        self.tcCard = self.settingCard(self.tcTitle, self.tcInfo, self.tcFormat)

        # =================================================
        # 其他设置
        self.otherTitle = QLabel("其他设置")
        self.otherTitle.setObjectName("settingTitle")
        self.otherTitle.setIndent(22)

        # 删除多余字幕
        self.removeSubTitle = QLabel("删除多余字幕")
        self.removeSubInfo = QLabel("当前操作：没有选择的字幕语言将在重命名后被删除")
        self.removeSubSwitch = SwitchButton()
        self.removeSubSwitch.setChecked(True)  # 默认开启
        self.removeSubSwitch.checkedChanged.connect(self.removeSubFunction)
        self.removeSubCard = self.settingCard(self.removeSubTitle, self.removeSubInfo, self.removeSubSwitch)

        # 移动字幕文件
        self.moveSubTitle = QLabel("移动字幕文件")
        self.moveSubInfo = QLabel("当前操作：重命名成功后，移动字幕到视频文件夹")
        self.moveSubSwitch = ComboBox(self)
        self.moveSubSwitch.setMinimumWidth(240)
        self.moveSubSwitch.setMaximumWidth(240)
        self.moveSubSwitch.addItems(["不移动", "复制字幕", "剪切字幕"])
        self.moveSubSwitch.setCurrentIndex(0)  # 默认第一个
        self.moveSubSwitch.currentIndexChanged.connect(self.moveSubFunction)
        self.moveSubCard = self.settingCard(self.moveSubTitle, self.moveSubInfo, self.moveSubSwitch)

        # 转换字幕编码
        self.encodeTitle = QLabel("转换字幕编码")
        self.encodeInfo = QLabel("重命名后将字幕编码转换为指定格式")
        self.encodeType = ComboBox(self)
        self.encodeType.setMinimumWidth(240)
        self.encodeType.setMaximumWidth(240)
        self.encodeType.addItems(["Never", "UTF-8", "UTF-8-SIG"])
        self.encodeType.setCurrentIndex(0)  # 默认第一个
        self.encodeCard = self.settingCard(self.encodeTitle, self.encodeInfo, self.encodeType)

        # =================================================
        # 按钮
        self.cancelButton = PushButton("取消", self)
        self.cancelButton.setFixedWidth(120)

        self.applyButton = PrimaryPushButton("保存", self)
        self.applyButton.setFixedWidth(120)

        self.buttonLayout = QHBoxLayout()
        self.buttonLayout.setSpacing(12)
        self.buttonLayout.addStretch(0)
        self.buttonLayout.addWidget(self.cancelButton)
        self.buttonLayout.addWidget(self.applyButton)
        self.buttonLayout.addStretch(0)

        # 叠叠乐

        layout = QVBoxLayout(this_window)
        layout.setSpacing(12)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.addWidget(self.themeTitle)
        layout.addWidget(self.themeSelectCard)
        layout.addSpacing(20)
        layout.addWidget(self.videoTypeTitle)
        layout.addWidget(self.videoCard)
        layout.addSpacing(20)
        layout.addWidget(self.extensionTitle)
        layout.addWidget(self.scCard)
        layout.addWidget(self.tcCard)
        layout.addSpacing(20)
        layout.addWidget(self.otherTitle)
        layout.addWidget(self.removeSubCard)
        layout.addWidget(self.moveSubCard)
        layout.addWidget(self.encodeCard)
        layout.addSpacing(12)
        layout.addLayout(self.buttonLayout)

    def settingCard(self, card_title, card_info, card_func):
        card_title.setObjectName("cardTitleLabel")
        card_info.setObjectName("cardInfoLabel")

        self.infoPart = QVBoxLayout()
        self.infoPart.setSpacing(2)
        self.infoPart.setContentsMargins(0, 0, 0, 0)
        self.infoPart.addWidget(card_title)
        self.infoPart.addWidget(card_info)

        self.card = QHBoxLayout()
        self.card.setContentsMargins(20, 20, 20, 20)
        self.card.addLayout(self.infoPart, 0)
        self.card.addStretch(0)
        self.card.addWidget(card_func)

        self.cardFrame = QFrame()
        self.cardFrame.setObjectName("cardFrame")
        self.cardFrame.setLayout(self.card)

        return self.cardFrame

    def removeSubFunction(self, state):
        if state:
            self.removeSubInfo.setText("当前操作：没有选择的字幕语言将在重命名后被删除")
        else:
            self.removeSubInfo.setText("当前操作：仅重命名字幕，不删除任何文件")

    def moveSubFunction(self):
        if self.moveSubSwitch.currentIndex() == 0:
            self.moveSubInfo.setText("当前操作：仅重命名字幕，不移动文件位置")
        elif self.moveSubSwitch.currentIndex() == 1:
            self.moveSubInfo.setText("当前操作：重命名成功后，复制字幕到视频文件夹")
        elif self.moveSubSwitch.currentIndex() == 2:
            self.moveSubInfo.setText("当前操作：重命名成功后,剪切字幕到视频文件夹")

    def themeSelectFunction(self):
        if self.themeSelectSwitch.currentIndex() == 0:
            self.themeSelectInfo.setText("当前主题：跟随系统")
            setTheme(Theme.AUTO)
            if qconfig.theme == Theme.LIGHT:
                setThemeColor("#1B96DE")
            elif qconfig.theme == Theme.DARK:
                setThemeColor("#4EC8FA")
        elif self.themeSelectSwitch.currentIndex() == 1:
            self.themeSelectInfo.setText("当前主题：浅色模式")
            setTheme(Theme.LIGHT)
            setThemeColor("#1B96DE")
        elif self.themeSelectSwitch.currentIndex() == 2:
            self.themeSelectInfo.setText("当前主题：深色模式")
            setTheme(Theme.DARK)
            setThemeColor("#4EC8FA")
