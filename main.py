import sys
import multiprocessing
from PySide6.QtWidgets import QApplication

from src.core import MyMainWindow


if __name__ == "__main__":
    multiprocessing.freeze_support()
    app = QApplication(sys.argv)
    window = MyMainWindow()
    window.show()
    app.exec()
