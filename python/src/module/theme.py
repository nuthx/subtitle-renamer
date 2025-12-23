from enum import Enum
from qfluentwidgets import StyleSheetBase, Theme, qconfig

from src.module.resource import getResource


# 定义样式表路径
class StyleSheet(StyleSheetBase, Enum):
    WINDOW = "window"

    def path(self, theme=Theme.AUTO):
        theme = qconfig.theme if theme == Theme.AUTO else theme
        return getResource(f"src/style/style_{theme.value.lower()}.qss")
