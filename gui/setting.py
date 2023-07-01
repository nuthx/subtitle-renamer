from PySide6.QtCore import Qt, QMetaObject
from PySide6.QtWidgets import QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame, QAbstractItemView
from PySide6.QtGui import QFontDatabase, QFont
from qfluentwidgets import setThemeColor, PushButton, TableWidget, PrimaryPushButton, EditableComboBox, CheckBox, \
                           ToolButton, FluentIcon
from qfluentwidgets.common.style_sheet import styleSheetManager
from module.resource import getResource


class SettingWindow(object):
    def setupUI(self, this_window):
        setThemeColor("#1B96DE")

        this_window.setWindowTitle("设置")
        this_window.resize(800, 600)

        # self.centralWidget = QWidget(MainWindow)
        # self.clearButton.clicked.connect(self.settingWindow)
        #
        # self.vBoxLayout = QVBoxLayout(self.centralWidget)
        # self.vBoxLayout.setSpacing(0)
        # self.vBoxLayout.setContentsMargins(36, 20, 36, 24)
        # self.vBoxLayout.addLayout(self.headerLayout)
        # self.vBoxLayout.addSpacing(24)
        # self.vBoxLayout.addWidget(self.tableFrame, 0)
        # self.vBoxLayout.addSpacing(24)
        # self.vBoxLayout.addLayout(self.actionLayout, 0)
        #
        # MainWindow.setCentralWidget(self.centralWidget)

        QMetaObject.connectSlotsByName(this_window)












        # self.pushButton1 = PushButton("8800", self)
        # self.resize(600, 700)
        # self.gridLayout = QGridLayout(self)
        # self.gridLayout.addWidget(self.pushButton1, 0, 0)








        # self.deleteSub = CheckBox("删除多余文件（包括未勾选的简繁字幕）", self)
        # self.deleteSub.setChecked(True)

        # self.infoLayout = QHBoxLayout()
        # self.infoLayout.setSpacing(40)
        # self.infoLayout.setContentsMargins(24, 16, 30, 14)  # 修正四边间距
        # self.infoLayout.addLayout(self.scLayout, 0)
        # self.infoLayout.addLayout(self.tcLayout, 0)
        #
        # self.infoFrame = QFrame()
        # self.infoFrame.setObjectName("infoFrame")
        # self.infoFrame.setLayout(self.infoLayout)
        # self.infoFrame.setMaximumHeight(242)
        #
        #
        #
        # self.scFormat = EditableComboBox(self)
        # self.scFormat.setMaximumWidth(200)
        # self.scFormat.addItems([".sc", ".chs", ".zh-Hans"])
        # self.scFormat.setPlaceholderText("不添加简体扩展名")

        # self.tcFormat = EditableComboBox(self)
        # self.tcFormat.setMaximumWidth(200)
        # self.tcFormat.addItems([".tc", ".cht", ".zh-Hant"])
        # self.tcFormat.setPlaceholderText("不添加繁体扩展名")
        #
        #
        #
        #
        # self.buttonLayout = QHBoxLayout()
        # self.buttonLayout.setSpacing(12)
        # self.buttonLayout.setContentsMargins(0, 0, 0, 0)
        # self.buttonLayout.setObjectName("infoLayout")
        # self.buttonLayout.addWidget(self.messageLabel)
        # self.buttonLayout.addStretch(0)
        # self.buttonLayout.addWidget(self.clearButton)
        # self.buttonLayout.addWidget(self.renameButton)
        #
        # self.buttonFrame = QFrame()
        # self.buttonFrame.setObjectName("buttonFrame")
        # self.buttonFrame.setLayout(self.buttonLayout)


