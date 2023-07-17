import sys
import platform
import multiprocessing
from PySide6.QtWidgets import QApplication

from src.core import MyMainWindow


if __name__ == "__main__":
    multiprocessing.freeze_support()

    # 继承父进程的所有内容
    # if platform.system() == "Windows":
    #     multiprocessing.set_start_method("spawn")
    # else:
    #     multiprocessing.set_start_method("fork")

    app = QApplication(sys.argv)
    window = MyMainWindow()
    window.show()
    app.exec()
