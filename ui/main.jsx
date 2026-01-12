import "@/globals.css"
import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import { initConfig, getConfig } from "@/utils/config"
import { AppWindow, TitleBar, MainContent } from "@/components/window.jsx"
import { Nav, NavButton, NavSpace, NavUpgrade } from "@/components/nav.jsx"
import { SubtitleRename } from "@/pages/subtitle"
import { Settings } from "@/pages/settings"
import { GeneralSetting } from "@/pages/settings-general"
import { RenameSetting } from "@/pages/settings-rename"
import { DeveloperSetting } from "@/pages/settings-developer"
import { AboutSetting } from "@/pages/settings-about"
import { SubtitlesIcon, GearSixIcon } from "@phosphor-icons/react"

// 初始化配置和主题模式
initConfig().then(async () => {
  const config = await getConfig()
  await invoke("set_theme", { theme: config.general.theme })
})

// 监听菜单跳转
listen("navigate", (event) => {
  window.location.hash = event.payload
})

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <AppWindow>
        <Toaster
          position="top-center"
          offset={{ top: "32px" }}
          expand={true}
          gap={8}
          visibleToasts={5}
          className="flex justify-center"
        />
        <TitleBar />
        <MainContent>
          <Nav>
            <NavButton path="/" title="字幕命名" icon={<SubtitlesIcon />} />
            <NavSpace />
            <NavUpgrade />
            <NavButton path="/settings" title="设置" icon={<GearSixIcon />} />
          </Nav>

          <Routes>
            <Route path="/" element={<SubtitleRename />} />
            <Route path="/settings" element={<Settings />}>
              <Route index element={<Navigate to="general" replace />} />
              <Route path="general" element={<GeneralSetting />} />
              <Route path="rename" element={<RenameSetting />} />
              <Route path="developer" element={<DeveloperSetting />} />
              <Route path="about" element={<AboutSetting />} />
            </Route>
          </Routes>
        </MainContent>
      </AppWindow>
    </HashRouter>
  </StrictMode>
)
