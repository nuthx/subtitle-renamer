import time
import send2trash
import subprocess
import threading
import multiprocessing
from joblib import Parallel, delayed
from PySide6.QtWidgets import QMainWindow, QTableWidgetItem, QDialog
from PySide6.QtCore import Qt, QPoint, QCoreApplication
from qfluentwidgets import MessageBox, InfoBar, InfoBarPosition, RoundMenu, Action, FluentIcon

from src.gui.mainwindow import MainWindow
from src.gui.about import AboutWindow
from src.gui.setting import SettingWindow
from src.function import *
from src.module.config import *
from src.module.counter import *


class MyMainWindow(QMainWindow, MainWindow):
    def __init__(self):
        super().__init__()
        self.setupUI(self)
        self.initUI()
        self.initList()
        readConfig()  # 仅用于检查配置是否正确

    def initUI(self):
        addOpenTimes(readConfig(), configPath())

        self.table.setContextMenuPolicy(Qt.CustomContextMenu)
        self.table.customContextMenuRequested.connect(self.showMenu)

        self.aboutButton.clicked.connect(self.openAbout)
        self.settingButton.clicked.connect(self.openSetting)
        self.removeButton.clicked.connect(self.justRemoveSub)
        self.clearButton.clicked.connect(self.initList)
        self.renameButton.clicked.connect(self.startRename)

    def initList(self):
        self.file_list = []
        self.video_list = []
        self.sc_list = []
        self.tc_list = []
        self.table.clearContents()
        self.table.setRowCount(0)

    def openAbout(self):
        about = MyAboutWindow()
        about.exec()

    def openSetting(self):
        setting = MySettingWindow()
        setting.exec()

    def dragEnterEvent(self, event):
        event.acceptProposedAction()

    def dropEvent(self, event):
        self.showInfo("info", "", "请等待识别完成")

        # 获取并格式化本地路径
        self.raw_file_list = event.mimeData().urls()
        self.file_list = formatRawFileList(self.raw_file_list, self.file_list)

        # 放入子线程
        self.thread = threading.Thread(target=self.dropThread)
        self.thread.start()

        # 等待线程完成，不阻塞 UI 界面
        while self.thread.is_alive():
            QCoreApplication.processEvents()

        self.dropFinish()

    def dropThread(self):
        start_time = time.time()

        # 排除已分析过的内容
        split_list = [item for item in self.file_list if item not in self.video_list + self.sc_list + self.tc_list]

        # 多进程启动
        # results = Parallel(n_jobs=-1)(delayed(splitList)(item) for item in split_list)
        pool = multiprocessing.Pool()
        results = pool.map(splitList, split_list)
        pool.close()
        pool.join()

        for result in results:
            self.video_list.extend(result[0])
            self.sc_list.extend(result[1])
            self.tc_list.extend(result[2])

        self.used_time = (time.time() - start_time) * 1000  # 计时结束
        self.item_num = len(split_list)

    def dropFinish(self):
        self.video_list = sorted(self.video_list)
        self.sc_list = sorted(self.sc_list)
        self.tc_list = sorted(self.tc_list)

        self.showInTable()

        if self.item_num == 0:
            self.showInfo("warning", "", "没有新增文件")
        elif self.used_time > 1000:
            used_time_s = "{:.2f}".format(self.used_time / 1000)  # 取 2 位小数
            self.showInfo("success", f"已添加{self.item_num}个文件", f"耗时{used_time_s}s")
        else:
            used_time_ms = "{:.0f}".format(self.used_time)  # 舍弃小数
            self.showInfo("success", f"已添加{self.item_num}个文件", f"耗时{used_time_ms}ms")

    def showInTable(self):
        # 计算列表行数
        max_len = max(len(self.video_list), len(self.sc_list), len(self.tc_list))
        self.table.setRowCount(max_len)

        video_id = 0
        for video_name in self.video_list:
            video_name_lonely = os.path.basename(video_name)
            self.table.setItem(video_id, 0, QTableWidgetItem(video_name_lonely))
            video_id += 1

        sc_id = 0
        for sc_name in self.sc_list:
            sc_name_lonely = os.path.basename(sc_name)
            self.table.setItem(sc_id, 1, QTableWidgetItem(sc_name_lonely))
            sc_id += 1

        tc_id = 0
        for tc_name in self.tc_list:
            tc_name_lonely = os.path.basename(tc_name)
            self.table.setItem(tc_id, 2, QTableWidgetItem(tc_name_lonely))
            tc_id += 1

        self.table.resizeColumnsToContents()  # 自动匹配列宽

    def showMenu(self, pos):
        menu = RoundMenu(parent=self)
        delete_this_file = Action(FluentIcon.CLOSE, "删除此文件")
        delete_this_line = Action(FluentIcon.DELETE, "删除整行内容")
        menu.addAction(delete_this_file)
        menu.addAction(delete_this_line)

        # 必须选中单元格才会显示
        if self.table.itemAt(pos) is not None:
            # 在微调后的位置显示
            menu.exec(self.table.mapToGlobal(pos) + QPoint(0, 30), ani=True)

            # 计算单元格坐标
            clicked_item = self.table.itemAt(pos)
            row = self.table.row(clicked_item)
            column = self.table.column(clicked_item)

            delete_this_file.triggered.connect(lambda: self.deleteThisFile(row, column))
            delete_this_line.triggered.connect(lambda: self.deleteThisLine(row))

    def deleteThisFile(self, row, column):
        if column == 0:
            del self.video_list[row]
        elif column == 1:
            del self.sc_list[row]
        elif column == 2:
            del self.tc_list[row]
        self.table.clearContents()
        self.table.setRowCount(0)
        self.showInTable()

    def deleteThisLine(self, row):
        if row < len(self.video_list):
            del self.video_list[row]
        if row < len(self.sc_list):
            del self.sc_list[row]
        if row < len(self.tc_list):
            del self.tc_list[row]
        self.table.clearContents()
        self.table.setRowCount(0)
        self.showInTable()

    def startRename(self):
        # 读取配置
        self.config = readConfig()
        self.loadConfig()

        # 命名前检查
        if not self.renameCheck():
            return

        # 未勾选的语言加入 delete_list
        delete_list = []
        if not self.allowSc.isChecked():
            delete_list.extend(self.sc_list)
        if not self.allowTc.isChecked():
            delete_list.extend(self.tc_list)

        # 删除未勾选的语言
        if self.remove_unused and delete_list:
            if self.removeCheck(delete_list):
                send2trash.send2trash(delete_list)
            else:
                return

        # 计算重命名数量
        rename_num = 0

        # 字幕重命名
        if self.allowSc.isChecked():
            state_sc = renameAction(
                self.sc_extension,
                self.video_list,
                self.sc_list,
                self.move_to_folder,
                self.encode
            )
            if state_sc == 516:
                self.showInfo("error", "重命名失败", "目标文件夹存在同名的简体字幕")
                return
            else:
                rename_num = rename_num + len(self.sc_list)

        if self.allowTc.isChecked():
            state_tc = renameAction(
                self.tc_extension,
                self.video_list,
                self.tc_list,
                self.move_to_folder,
                self.encode
            )
            if state_tc == 516:
                self.showInfo("error", "重命名失败", "目标文件夹存在同名的繁体字幕")
                return
            else:
                rename_num = rename_num + len(self.sc_list)

        self.initList()
        addRenameTimes(self.config, configPath())
        addRenameNum(self.config, configPath(), rename_num)
        self.showInfo("success", "", "重命名成功")

    def loadConfig(self):
        self.sc_extension = self.config.get("Extension", "sc")
        self.tc_extension = self.config.get("Extension", "tc")

        self.move_to_folder = self.config.getboolean("General", "move_to_anime_folder")
        self.remove_unused = self.config.getboolean("General", "remove_unused_sub")
        self.encode = self.config.get("General", "encode")

    def renameCheck(self):
        # 是否有视频与字幕文件
        if not self.video_list:
            self.showInfo("warning", "", "请添加视频文件")
            return False

        if not self.sc_list and not self.tc_list:
            self.showInfo("warning", "", "请添加字幕文件")
            return False

        # 必须勾选简体或繁体
        if not self.allowSc.isChecked() and not self.allowTc.isChecked():
            self.showInfo("error", "", "请勾选需要重命名的字幕格式：简体或繁体")
            return False

        # 勾选的语言下必须存在字幕文件
        if self.allowSc.isChecked() and not self.sc_list:
            self.showInfo("error", "", "未发现待命名的简体字幕文件，请确认勾选情况")
            return False

        if self.allowTc.isChecked() and not self.tc_list:
            self.showInfo("error", "", "未发现待命名的繁体字幕文件，请确认勾选情况")
            return False

        # 简体繁体的扩展名不可相同
        if self.allowSc.isChecked() and self.allowTc.isChecked() \
                and self.sc_extension == self.tc_extension:
            print(self.sc_extension)
            print(self.tc_extension)
            self.showInfo("error", "", "简体扩展名与繁体扩展名不可相同")
            return False

        # 视频与字幕个数需相等
        if (self.allowSc.isChecked() and len(self.video_list) != len(self.sc_list)) \
                or (self.allowTc.isChecked() and len(self.video_list) != len(self.tc_list)):
            self.showInfo("error", "", "视频与字幕的数量不相等")
            return False

        return True

    def removeCheck(self, delete_list):
        # 获得 delete_list 文件名
        delete_list_lonely = []
        for item in delete_list:
            item_lonely = os.path.basename(item)
            if len(item_lonely) > 60:  # 截取最后 60 位
                item_lonely = "..." + item_lonely[-60:]
            delete_list_lonely.append(item_lonely)

        # 弹窗提醒待删除文件
        delete_file = "<br>".join(delete_list_lonely)  # 转为字符串形式
        notice = MessageBox("下列文件将被删除", delete_file, self)
        if notice.exec():
            return True
        else:
            return False

    def justRemoveSub(self):
        delete_list = []
        if self.allowSc.isChecked():
            delete_list.extend(self.sc_list)
        if self.allowTc.isChecked():
            delete_list.extend(self.tc_list)

        if delete_list:
            if self.removeCheck(delete_list):
                send2trash.send2trash(delete_list)
                self.initList()
                self.showInfo("success", "", "删除成功")
            else:
                return
        else:
            self.showInfo("warning", "", "没有要删除的文件")

    def showInfo(self, state, title, content):
        info_state = {
            "info": InfoBar.info,
            "success": InfoBar.success,
            "warning": InfoBar.warning,
            "error": InfoBar.error
        }

        if state in info_state:
            info_state[state](
                title=title, content=content,
                orient=Qt.Horizontal, isClosable=True,
                position=InfoBarPosition.TOP,
                duration=2000, parent=self
            )


class MyAboutWindow(QDialog, AboutWindow):
    def __init__(self):
        super().__init__()
        self.setupUI(self)
        self.initUI()
        self.config = readConfig()
        self.loadConfig()

    def initUI(self):
        self.configPathButton.clicked.connect(self.openConfigPath)

    @staticmethod
    def openConfigPath():
        config_path = configPath()[0]
        if config_path != "N/A":
            if platform.system() == "Windows":
                subprocess.call(["explorer", config_path])
            elif platform.system() == "Darwin":
                subprocess.call(["open", config_path])
            elif platform.system() == "Linux":
                subprocess.call(["xdg-open", config_path])

    def loadConfig(self):
        self.openTimes.setText(self.config.get("Counter", "open_times"))
        self.renameTimes.setText(self.config.get("Counter", "rename_times"))
        self.renameNum.setText(self.config.get("Counter", "rename_num"))


class MySettingWindow(QDialog, SettingWindow):
    def __init__(self):
        super().__init__()
        self.setupUI(self)
        self.initUI()
        self.config = readConfig()
        self.loadConfig()

    def initUI(self):
        self.applyButton.clicked.connect(self.saveConfig)  # 保存配置
        self.cancelButton.clicked.connect(lambda: self.close())  # 关闭窗口

    def loadConfig(self):
        self.scFormat.setText(self.config.get("Extension", "sc"))
        self.tcFormat.setText(self.config.get("Extension", "tc"))
        self.moveSubSwitch.setChecked(self.config.getboolean("General", "move_to_anime_folder"))
        self.removeSubSwitch.setChecked(self.config.getboolean("General", "remove_unused_sub"))
        self.encodeType.setCurrentText(self.config.get("General", "encode"))

    def saveConfig(self):
        self.config.set("Extension", "sc", self.scFormat.currentText())
        self.config.set("Extension", "tc", self.tcFormat.currentText())
        self.config.set("General", "move_to_anime_folder", str(self.moveSubSwitch.isChecked()).lower())
        self.config.set("General", "remove_unused_sub", str(self.removeSubSwitch.isChecked()).lower())
        self.config.set("General", "encode", self.encodeType.currentText())

        with open(configPath()[1], "w") as content:
            self.config.write(content)

        self.close()
