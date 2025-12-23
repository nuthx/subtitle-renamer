import os
import platform
import shutil
import codecs
import chardet

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

    subtitle_extension = ["ass", "ssa", "srt", "mks"]

    # 视频文件
    if file_extension in video_extension:
        return file_name, "video"

    # 字幕文件
    elif file_extension in subtitle_extension:
        try:
            sub_language = detectSubLanguage(file_name)
        except Exception as e:
            print(e)
            sub_language = "error"

        return file_name, sub_language

    # 其他文件
    else:
        return file_name, "other"


# 重命名动作，简繁体会分别执行一次renameAction，因此不需要区分运行时是简体还是繁体
# - lang_format: 用户定义的简繁体后缀
# - video_list: 视频文件列表
# - sub_list: 字幕文件列表
# - move_to_folder: 是否要移动至视频文件夹
# - encode: 是否要编码转换
def renameAction(lang_format, video_list, sub_list, move_to_folder, encode):
    # 1 => 根据规则输出改名后的完整字幕路径列表
    new_sub_list = []
    for i in range(len(video_list)):
        this_video_path = os.path.dirname(video_list[i])  # 视频路径
        this_video_name = os.path.splitext(os.path.basename(video_list[i]))[0]  # 视频文件名（不含扩展名）
        this_sub_path = os.path.dirname(sub_list[i])  # 字幕路径
        this_sub_extension = os.path.splitext(os.path.basename(sub_list[i]))[-1]  # 字幕扩展名

        if move_to_folder == 0:
            # 保持原位(append自动添加到末尾)
            new_sub_list.append(os.path.join(this_sub_path, this_video_name + lang_format + this_sub_extension))
        else:
            # 移动至视频文件夹
            new_sub_list.append(os.path.join(this_video_path, this_video_name + lang_format + this_sub_extension))

    # 2 => 检查目标目录是否存在同名文件
    for new_sub in new_sub_list:
        if os.path.exists(new_sub):
            return 516

    # 3 => 修改编码
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

    # 4 => 重命名
    for i in range(len(new_sub_list)):
        # 重命名
        # noinspection PyTypeChecker
        shutil.copy(sub_list[i], new_sub_list[i])

        # 若设置剪切，则删除源路径的字幕
        if move_to_folder != 1:
            os.remove(sub_list[i])
