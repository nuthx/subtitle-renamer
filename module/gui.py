from PySide6.QtCore import Qt, Signal, QMetaObject
from PySide6.QtWidgets import QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame, QAbstractItemView
from qfluentwidgets import setThemeColor, PushButton, TableWidget, PrimaryPushButton, EditableComboBox, CheckBox
from qfluentwidgets.common.style_sheet import styleSheetManager
from module.resource import getResource


class Ui_MainWindow(object):
    def setupUI(self, MainWindow):
        setThemeColor("#9CA9B9")

        MainWindow.setWindowTitle("Subtitle Renamer")
        MainWindow.resize(1200, 720)
        MainWindow.setAcceptDrops(True)
        # MainWindow.setFixedSize(self.size())  # 禁止拉伸窗口

        self.titleLabel = QLabel("Subtitle Renamer")
        self.titleLabel.setObjectName("titleLabel")
        self.subtitleLabel = QLabel("有点高效的视频字幕重命名工具")
        self.subtitleLabel.setObjectName('subtitleLabel')

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
        # self.table.resizeColumnsToContents()  # 自动匹配列宽
        styleSheetManager.deregister(self.table)  # 禁用皮肤，启用自定义 QSS
        with open(getResource("style/table.qss"), encoding="utf-8") as file:
            self.table.setStyleSheet(file.read())

        self.allowSc = CheckBox("简体", self)
        self.allowSc.setChecked(True)
        self.scFormat = EditableComboBox(self)
        self.scFormat.addItems([self.tr(".sc"), self.tr(".chs"), self.tr("[sc]")])
        self.scFormat.setPlaceholderText(self.tr("默认为空，不添加简体扩展名"))

        self.allowTc = CheckBox("繁体", self)
        self.allowTc.setChecked(False)
        self.tcFormat = EditableComboBox(self)
        self.tcFormat.addItems([self.tr(".tc"), self.tr(".cht"), self.tr("[tc]")])
        self.tcFormat.setPlaceholderText(self.tr("默认为空，不添加繁体扩展名"))

        self.deleteSub = CheckBox("删除多余文件（包括未勾选的简繁字幕）", self)
        self.deleteSub.setChecked(True)

        self.messageLabel = QLabel("")

        self.clearButton = PushButton("清空列表", self)
        self.clearButton.setFixedWidth(120)
        self.renameButton = PrimaryPushButton("重命名", self)
        self.renameButton.setFixedWidth(120)

        self.tableLayout = QHBoxLayout()
        self.tableLayout.setSpacing(0)
        self.tableLayout.setContentsMargins(0, 0, 0, 0)
        self.tableLayout.addWidget(self.table)

        self.tableFrame = QFrame()
        self.tableFrame.setObjectName("tableFrame")
        self.tableFrame.setLayout(self.tableLayout)

        self.scLayout = QHBoxLayout()
        self.scLayout.setSpacing(8)
        self.scLayout.setContentsMargins(0, 0, 0, 0)
        self.scLayout.addWidget(self.allowSc)
        self.scLayout.addSpacing(16)
        self.scLayout.addWidget(self.scFormat)

        self.tcLayout = QHBoxLayout()
        self.tcLayout.setSpacing(8)
        self.tcLayout.setContentsMargins(0, 0, 0, 0)
        self.tcLayout.addWidget(self.allowTc)
        self.tcLayout.addSpacing(16)
        self.tcLayout.addWidget(self.tcFormat)

        self.infoLayout = QHBoxLayout()
        self.infoLayout.setSpacing(40)
        self.infoLayout.setContentsMargins(24, 16, 30, 14)  # 修正四边间距
        self.infoLayout.setObjectName("infoLayout")
        self.infoLayout.addLayout(self.scLayout, 0)
        self.infoLayout.addLayout(self.tcLayout, 0)
        self.infoLayout.addWidget(self.deleteSub)

        self.infoFrame = QFrame()
        self.infoFrame.setObjectName("infoFrame")
        self.infoFrame.setLayout(self.infoLayout)
        self.infoFrame.setMaximumHeight(242)

        self.buttonLayout = QHBoxLayout()
        self.buttonLayout.setSpacing(12)
        self.buttonLayout.setContentsMargins(0, 0, 0, 0)
        self.buttonLayout.setObjectName("infoLayout")
        self.buttonLayout.addWidget(self.messageLabel)
        self.buttonLayout.addStretch(1)
        self.buttonLayout.addWidget(self.clearButton)
        self.buttonLayout.addWidget(self.renameButton)

        self.buttonFrame = QFrame()
        self.buttonFrame.setObjectName("buttonFrame")
        self.buttonFrame.setLayout(self.buttonLayout)

        self.centralWidget = QWidget(MainWindow)

        self.vBoxLayout = QVBoxLayout(self.centralWidget)
        self.vBoxLayout.setSpacing(0)
        self.vBoxLayout.setContentsMargins(36, 24, 36, 24)
        self.vBoxLayout.addWidget(self.titleLabel, 0, Qt.AlignTop)
        self.vBoxLayout.addSpacing(4)
        self.vBoxLayout.addWidget(self.subtitleLabel, 0, Qt.AlignTop)
        self.vBoxLayout.addSpacing(24)
        self.vBoxLayout.addWidget(self.tableFrame, 0)
        self.vBoxLayout.addSpacing(24)
        self.vBoxLayout.addWidget(self.infoFrame, 0)
        self.vBoxLayout.addSpacing(24)
        self.vBoxLayout.addWidget(self.buttonFrame, 0)

        MainWindow.setCentralWidget(self.centralWidget)

        QMetaObject.connectSlotsByName(MainWindow)
