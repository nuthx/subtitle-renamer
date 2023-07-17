import re
import chardet
import hanzidentifier
import ass


def detectSubLanguage(file_name):
    # 检测文本编码
    with open(file_name, "rb") as file:
        sub_data = file.read()
        result = chardet.detect(sub_data)
        encoding = result["encoding"]
        if encoding.lower() == "gb2312":  # 修正解码错误
            encoding = "gb18030"
        # print(encoding)

    # 判断字幕格式
    name_struct = file_name.split(".")
    file_extension = name_struct[-1].lower()

    # 提取字幕内容到 subtitle
    if file_extension == "srt":
        with open(file_name, "r", encoding=encoding) as file:
            result = file.read()

        # 匹配序号和时间
        srt_pattern = r'\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}\n([\s\S]*?)' \
                      r'(?=\n\d+\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}|\Z)'

        # 提取正文内容
        matches = re.findall(srt_pattern, result)
        subtitle = [match.strip() for match in matches]

    else:
        with open(file_name, "r", encoding=encoding) as file:
            result = ass.parse(file).events

        # 分离正文内容内容到 subtitle
        subtitle = []
        for item in result:
            new_item = item.text.replace("\\", "\\\\")  # 避免样式中的斜杠转义
            ass_pattern = r"(?<!\{)([^{}]+)(?!\})"  # 匹配 {} 之外内容
            matches = re.findall(ass_pattern, new_item)

            # 排除空行
            if matches:
                matches = matches[-1]  # 排除字幕样式文本

                # 排除单字的特效字幕
                if len(matches) > 1:
                    subtitle.append(matches)

    # 计算每简体与繁体的数量
    sc = 0
    tc = 0
    subtitle = list(set(subtitle))  # 去重
    for item in subtitle:
        if hanzidentifier.is_simplified(item):
            sc += 1
        elif hanzidentifier.is_traditional(item):
            tc += 1

    # 打印数量
    # print(f"该字幕简繁比为{sc}:{tc}（{file_name}）")

    # 判断简繁，计算比例 0.8：1
    if sc * 0.8 > tc:
        return "sc"
    else:
        return "tc"
