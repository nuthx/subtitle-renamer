from PySide6.QtCore import Qt, QMetaObject
from PySide6.QtWidgets import QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame, QAbstractItemView
from qfluentwidgets import setThemeColor, PushButton, TableWidget, PrimaryPushButton, EditableComboBox, CheckBox, \
                           ToolButton, FluentIcon
from qfluentwidgets.common.style_sheet import styleSheetManager
from module.resource import getResource


class Ui_MainWindow(object):
    def __init__(self):
        super().__init__()

    def setupUI(self, MainWindow):
        setThemeColor("#29ACE9")

        MainWindow.setWindowTitle("Subtitle Renamer")
        MainWindow.resize(1200, 720)
        MainWindow.setAcceptDrops(True)
        # MainWindow.setFixedSize(self.size())  # 禁止拉伸窗口

        # 标题区域

        self.titleLabel = QLabel("SubtitleRenamer")
        self.titleLabel.setObjectName("titleLabel")
        self.subtitleLabel = QLabel("有点厉害的动画字幕重命名工具")
        self.subtitleLabel.setObjectName('subtitleLabel')

        self.titleLayout = QVBoxLayout()
        self.titleLayout.setSpacing(8)
        self.titleLayout.setContentsMargins(0, 0, 0, 0)
        self.titleLayout.addWidget(self.titleLabel, 0, Qt.AlignTop)
        self.titleLayout.addWidget(self.subtitleLabel, 0, Qt.AlignTop)

        self.settingButton = PushButton("设置", self, FluentIcon.SETTING)

        self.headerLayout = QHBoxLayout()
        self.headerLayout.setContentsMargins(0, 0, 0, 0)
        self.headerLayout.addLayout(self.titleLayout)
        self.headerLayout.addStretch(0)
        self.headerLayout.addWidget(self.settingButton, 0)

        # 表格区域

        self.table = TableWidget(self)
        self.table.verticalHeader().hide()  # 隐藏左侧表头
        self.table.horizontalHeader().setHighlightSections(False)  # 选中时表头不加粗
        self.table.setSelectionMode(QAbstractItemView.SingleSelection)  # 单选模式
        self.table.setEditTriggers(QAbstractItemView.NoEditTriggers)  # 禁止双击编辑
        self.table.setColumnCount(3)
        self.table.setHorizontalHeaderLabels(["视频文件", "简体字幕", "繁体字幕"])
        self.table.setColumnWidth(0, 376)  # 1126
        self.table.setColumnWidth(1, 375)
        self.table.setColumnWidth(2, 375)
        styleSheetManager.deregister(self.table)  # 禁用皮肤，启用自定义 QSS
        with open(getResource("style/table.qss"), encoding="utf-8") as file:
            self.table.setStyleSheet(file.read())

        self.tableLayout = QHBoxLayout()
        self.tableLayout.setContentsMargins(0, 0, 0, 0)
        self.tableLayout.addWidget(self.table)

        self.tableFrame = QFrame()
        self.tableFrame.setObjectName("tableFrame")
        self.tableFrame.setLayout(self.tableLayout)

        # 底部语言区域

        self.allowSc = CheckBox("简体", self)
        self.allowSc.setChecked(True)

        self.scFormat = EditableComboBox(self)
        self.scFormat.setMaximumWidth(200)
        self.scFormat.addItems([".sc", ".chs", ".zh-Hans"])
        self.scFormat.setPlaceholderText("不添加简体扩展名")

        self.scLayout = QHBoxLayout()
        self.scLayout.setContentsMargins(0, 0, 0, 0)
        self.scLayout.addWidget(self.allowSc)
        self.scLayout.addSpacing(16)
        self.scLayout.addWidget(self.scFormat)

        self.allowTc = CheckBox("繁体", self)
        self.allowTc.setChecked(False)

        self.tcFormat = EditableComboBox(self)
        self.tcFormat.setMaximumWidth(200)
        self.tcFormat.addItems([".tc", ".cht", ".zh-Hant"])
        self.tcFormat.setPlaceholderText("不添加繁体扩展名")

        self.tcLayout = QHBoxLayout()
        self.tcLayout.setContentsMargins(0, 0, 0, 0)
        self.tcLayout.addWidget(self.allowTc)
        self.tcLayout.addSpacing(16)
        self.tcLayout.addWidget(self.tcFormat)

        # self.deleteSub = CheckBox("删除多余文件（包括未勾选的简繁字幕）", self)
        # self.deleteSub.setChecked(True)

        self.infoLayout = QHBoxLayout()
        self.infoLayout.setSpacing(40)
        self.infoLayout.setContentsMargins(24, 16, 30, 14)  # 修正四边间距
        self.infoLayout.addLayout(self.scLayout, 0)
        self.infoLayout.addLayout(self.tcLayout, 0)

        self.infoFrame = QFrame()
        self.infoFrame.setObjectName("infoFrame")
        self.infoFrame.setLayout(self.infoLayout)
        self.infoFrame.setMaximumHeight(242)

        self.messageLabel = QLabel("")

        self.clearButton = PushButton("清空列表", self)
        self.clearButton.setFixedWidth(120)
        self.renameButton = PrimaryPushButton("重命名", self)
        self.renameButton.setFixedWidth(120)










        self.buttonLayout = QHBoxLayout()
        self.buttonLayout.setSpacing(12)
        self.buttonLayout.setContentsMargins(0, 0, 0, 0)
        self.buttonLayout.setObjectName("infoLayout")
        self.buttonLayout.addWidget(self.messageLabel)
        self.buttonLayout.addStretch(0)
        self.buttonLayout.addWidget(self.clearButton)
        self.buttonLayout.addWidget(self.renameButton)

        self.buttonFrame = QFrame()
        self.buttonFrame.setObjectName("buttonFrame")
        self.buttonFrame.setLayout(self.buttonLayout)

        self.centralWidget = QWidget(MainWindow)

        self.vBoxLayout = QVBoxLayout(self.centralWidget)
        self.vBoxLayout.setSpacing(0)
        self.vBoxLayout.setContentsMargins(36, 24, 36, 24)
        # self.vBoxLayout.addWidget(self.titleFrame, 0)
        self.vBoxLayout.addLayout(self.headerLayout)
        self.vBoxLayout.addSpacing(24)
        self.vBoxLayout.addWidget(self.tableFrame, 0)
        self.vBoxLayout.addSpacing(24)
        self.vBoxLayout.addWidget(self.infoFrame, 0)
        self.vBoxLayout.addSpacing(24)
        self.vBoxLayout.addWidget(self.buttonFrame, 0)

        MainWindow.setCentralWidget(self.centralWidget)

        QMetaObject.connectSlotsByName(MainWindow)
