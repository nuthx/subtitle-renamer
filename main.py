import sys
import platform
import multiprocessing
from PySide6.QtWidgets import QApplication

from src.core import MyMainWindow


if __name__ == "__main__":
    multiprocessing.freeze_support()

    # macOS 中使用 fork 速度快一些
    if platform.system() == "Darwin":
        multiprocessing.set_start_method("fork")

    app = QApplication(sys.argv)
    window = MyMainWindow()
    window.show()
    app.exec()
