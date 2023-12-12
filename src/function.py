import os
import platform
import shutil
import codecs
import chardet

from src.module.config import readConfig
from src.module.detectsub import detectSubLanguage


def formatRawFileList(raw_file_list, file_list):
    for raw_file in raw_file_list:
        # 转换为文件路径
        file_path = raw_file.toLocalFile()

        # Windows 下调整路径分隔符
        if platform.system() == 'Windows':
            file_path = file_path.replace('/', '\\')

        # 解决 macOS 下路径无法识别
        if file_path.endswith('/'):
            file_path = file_path[:-1]

        # 排除文件夹
        if not os.path.isfile(file_path):
            continue

        file_list.append(file_path)

    file_list = list(set(file_list))  # 去重
    return file_list


def splitList(comb_list):
    file_name = comb_list[0]
    file_struct = file_name.split(".")
    file_extension = file_struct[-1].lower()

    video_extension = ["mkv", "mp4", "avi", "flv", "webm", "m4v", "mov", "rm", "rmvb"]
    video_extension.extend([item.strip() for item in comb_list[1].split(",")])

    subtitle_extension = ["ass", "ssa", "srt"]

    video_list = []
    sc_list = []
    tc_list = []

    # 视频文件
    if file_extension in video_extension:
        video_list.append(file_name)

    # 字幕文件
    elif file_extension in subtitle_extension:
        sub_language = detectSubLanguage(file_name)
        if sub_language == "sc":
            sc_list.append(file_name)
        elif sub_language == "tc":
            tc_list.append(file_name)

    return video_list, sc_list, tc_list


def renameAction(lang_format, video_list, sub_list, move_to_folder, encode):
    new_sub_list = []
    sub_id_a = 0
    sub_id_b = 0

    # 新字幕名存入 new_sub_list
    for this_video in video_list:
        this_sub = sub_list[sub_id_a]
        this_video_name = os.path.splitext(os.path.basename(this_video))[0]  # 视频文件名（无扩展名）
        this_video_path = os.path.dirname(this_video)  # 视频路径
        this_sub_path = os.path.dirname(this_sub)  # 字幕路径
        this_sub_extension = os.path.splitext(os.path.basename(this_sub))[-1]  # 字幕扩展名
        separator = os.sep  # 系统路径分隔符

        # 是否要移动至视频文件夹
        if move_to_folder:
            new_sub = this_video_path + separator + this_video_name + lang_format + this_sub_extension
        else:
            new_sub = this_sub_path + separator + this_video_name + lang_format + this_sub_extension

        new_sub_list.append(new_sub)
        new_sub_list.sort()
        sub_id_a += 1

    # 目标目录是否存在同名文件
    for new_sub in new_sub_list:
        if os.path.exists(new_sub):
            return 516

    # 1 => 修改编码
    if encode == "UTF-8" or encode == "UTF-8-SIG":
        for this_sub in sub_list:
            # 识别
            with open(this_sub, "rb") as file:
                sub_data = file.read()
                result = chardet.detect(sub_data)
                encoding = result["encoding"]
                if encoding.lower() == "gb2312":  # 修正解码错误
                    encoding = "gb18030"

            # 忽略错误，强行转换，最为致命~
            with codecs.open(this_sub, "r", encoding=encoding, errors="ignore") as file:
                content = file.read()
            with codecs.open(this_sub, "w", encoding=encode, errors="ignore") as file:
                file.write(content)

    # 2 => 重命名
    for this_sub in sub_list:
        new_sub = new_sub_list[sub_id_b]
        shutil.copy(this_sub, new_sub)
        os.remove(this_sub)
        sub_id_b += 1
