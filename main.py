import sys
from PySide6.QtGui import QIcon
from PySide6.QtWidgets import QApplication

from module.run import MyMainWindow
from module.resource import getResource


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MyMainWindow()

    # 加载图标
    icon = QIcon(getResource("image/icon.png"))
    window.setWindowIcon(icon)

    # 加载 QSS
    style_file = getResource("style/style_light.qss")
    with open(style_file, "r", encoding="UTF-8") as file:
        style_sheet = file.read()
    window.setStyleSheet(style_sheet)

    # 显示窗口
    window.show()
    app.exec()
