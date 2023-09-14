import re
import chardet
import hanzidentifier
import ass


def subEncoding(file_name):
    with open(file_name, "rb") as content:
        data = content.read()

    chardet_result = chardet.detect(data)
    encoding = chardet_result["encoding"]

    # 修正解码错误
    if encoding.lower() == "gb2312":
        encoding = "gb18030"

    return encoding


def srtSubtitle(file_name):
    # 检测文本编码
    encoding = subEncoding(file_name)

    with open(file_name, "r", encoding=encoding) as file:
        result = file.read()

    # 匹配序号和时间
    srt_pattern = r'\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n([\s\S]*?)' \
                  r'(?=\n\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}|\Z)'

    # 提取正文内容
    matches = re.findall(srt_pattern, result)
    subtitle = [match.strip() for match in matches]

    return subtitle


def assSubtitle(file_name):
    # 检测文本编码
    encoding = subEncoding(file_name)

    with open(file_name, "r", encoding=encoding) as file:
        result = ass.parse(file).events

    # 提取正文内容
    subtitle = []
    for item in result:
        # 转义样式中的斜杠
        new_item = item.text.replace("\\", "\\\\")

        # 匹配 {} 之外内容
        ass_pattern = r'\{[^{}]*\}'
        matches = re.sub(ass_pattern, '', new_item)

        # 排除单字的特效字幕
        if len(matches) == 1:
            continue

        # 排除空内容
        if not matches:
            continue

        subtitle.append(matches)

    return subtitle


def detectSubLanguage(file_name):
    # 提取扩展名
    name_struct = file_name.split(".")
    file_extension = name_struct[-1].lower()

    # 提取纯字幕到列表
    if file_extension == "srt":
        subtitle = srtSubtitle(file_name)
    else:
        subtitle = assSubtitle(file_name)

    # 字幕去重
    subtitle = list(set(subtitle))

    # 计算简繁数量
    sc = tc = 0
    for item in subtitle:
        if hanzidentifier.is_simplified(item):
            sc += 1
            # print("sc: " + item)
        elif hanzidentifier.is_traditional(item):
            tc += 1
            # print("tc: " + item)

    # 打印数量
    print(f"简繁比 {sc}:{tc}")

    # 判断简繁，计算比例 0.8：1
    if sc * 0.8 > tc:
        return "sc"
    else:
        return "tc"
