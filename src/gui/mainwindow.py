from PySide6.QtCore import Qt, QMetaObject
from PySide6.QtWidgets import QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame, QAbstractItemView, QHeaderView
from PySide6.QtGui import QFontDatabase, QFont, QIcon
from qfluentwidgets import (setThemeColor, PushButton, TableWidget, PrimaryPushButton, CheckBox, FluentIcon,
                            ToolButton, IndeterminateProgressRing)
from qfluentwidgets.common.style_sheet import styleSheetManager

from src.module.resource import getResource


class MainWindow(object):
    def setupUI(self, this_window):
        # 配置主题色与字体
        setThemeColor("#1B96DE")
        font_id = QFontDatabase.addApplicationFont(getResource("src/font/Study-Bold.otf"))
        font_family = QFontDatabase.applicationFontFamilies(font_id)

        # 加载 QSS
        with open(getResource("src/style/style_light.qss"), "r", encoding="UTF-8") as file:
            style_sheet = file.read()
        this_window.setStyleSheet(style_sheet)

        this_window.setWindowTitle("SubtitleRenamer 1.4")
        this_window.setWindowIcon(QIcon(getResource("image/icon.png")))
        this_window.resize(1200, 660)
        this_window.setAcceptDrops(True)

        # 标题区域

        self.titleLabel = QLabel("SubtitleRenamer")
        self.titleLabel.setObjectName("titleLabel")
        self.titleLabel.setFont(QFont(font_family))

        self.subtitleLabel = QLabel("有点厉害的动画字幕重命名工具")
        self.subtitleLabel.setObjectName('subtitleLabel')

        self.titleLayout = QVBoxLayout()
        self.titleLayout.setContentsMargins(0, 0, 0, 0)
        self.titleLayout.addWidget(self.titleLabel, 0, Qt.AlignTop)
        self.titleLayout.addWidget(self.subtitleLabel, 0, Qt.AlignTop)

        self.spinner = IndeterminateProgressRing()
        self.spinner.setFixedSize(24, 24)
        self.spinner.setStrokeWidth(3)
        self.spinner.setVisible(False)

        self.aboutButton = ToolButton(FluentIcon.INFO, self)
        self.settingButton = PushButton("设置", self, FluentIcon.SETTING)

        self.headerLayout = QHBoxLayout()
        self.headerLayout.setContentsMargins(0, 0, 0, 0)
        self.headerLayout.addLayout(self.titleLayout)
        self.headerLayout.addStretch(0)
        self.headerLayout.addWidget(self.spinner, 0)
        self.headerLayout.addSpacing(16)
        self.headerLayout.addWidget(self.aboutButton, 0)
        self.headerLayout.addSpacing(12)
        self.headerLayout.addWidget(self.settingButton, 0)

        # 表格区域

        self.table = TableWidget(self)
        self.table.verticalHeader().hide()  # 隐藏左侧表头
        self.table.horizontalHeader().setHighlightSections(False)  # 选中时表头不加粗
        self.table.setSelectionMode(QAbstractItemView.SingleSelection)  # 单选模式
        self.table.setEditTriggers(QAbstractItemView.NoEditTriggers)  # 禁止双击编辑
        self.table.setColumnCount(3)
        self.table.setHorizontalHeaderLabels(["视频文件", "简体字幕", "繁体字幕"])
        # self.table.setColumnWidth(0, 376)  # 1126
        # self.table.setColumnWidth(1, 375)
        # self.table.setColumnWidth(2, 375)
        styleSheetManager.deregister(self.table)  # 禁用皮肤，启用自定义 QSS
        with open(getResource("src/style/table.qss"), encoding="utf-8") as file:
            self.table.setStyleSheet(file.read())

        self.header = self.table.horizontalHeader()
        self.header.setSectionResizeMode(QHeaderView.ResizeMode.Stretch)  # 列宽平均分配

        self.tableLayout = QHBoxLayout()
        self.tableLayout.setContentsMargins(0, 0, 0, 0)
        self.tableLayout.addWidget(self.table)

        self.tableFrame = QFrame()
        self.tableFrame.setObjectName("tableFrame")
        self.tableFrame.setLayout(self.tableLayout)

        # 执行区域

        self.allowSc = CheckBox("简体", self)
        # self.allowSc.setChecked(True)

        self.allowTc = CheckBox("繁体", self)
        # self.allowTc.setChecked(False)

        self.removeButton = PushButton("删除选中字幕", self)
        self.removeButton.setFixedWidth(120)

        self.separator = QFrame()
        self.separator.setObjectName("separator")
        self.separator.setFixedSize(1, 30)

        self.clearButton = PushButton("清空列表", self)
        self.clearButton.setFixedWidth(120)
        self.renameButton = PrimaryPushButton("重命名", self)
        self.renameButton.setFixedWidth(120)

        self.actionLayout = QHBoxLayout()
        self.actionLayout.addWidget(self.allowSc)
        self.actionLayout.addSpacing(32)
        self.actionLayout.addWidget(self.allowTc)
        self.actionLayout.addStretch(0)
        self.actionLayout.addWidget(self.removeButton)
        self.actionLayout.addSpacing(20)
        self.actionLayout.addWidget(self.separator)
        self.actionLayout.addSpacing(20)
        self.actionLayout.addWidget(self.clearButton)
        self.actionLayout.addSpacing(12)
        self.actionLayout.addWidget(self.renameButton)

        # 框架叠叠乐

        self.centralWidget = QWidget(this_window)

        self.vBoxLayout = QVBoxLayout(self.centralWidget)
        self.vBoxLayout.setSpacing(0)
        self.vBoxLayout.setContentsMargins(36, 20, 36, 24)
        self.vBoxLayout.addLayout(self.headerLayout)
        self.vBoxLayout.addSpacing(24)
        self.vBoxLayout.addWidget(self.tableFrame, 0)
        self.vBoxLayout.addSpacing(24)
        self.vBoxLayout.addLayout(self.actionLayout, 0)

        this_window.setCentralWidget(self.centralWidget)

        QMetaObject.connectSlotsByName(this_window)
