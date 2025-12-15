# CodeBanana 自定义安装脚本
# 增强安装体验和功能

# 自定义安装欢迎页面
!macro customWelcomePage
  # 设置安装向导窗口标题
  !define MUI_WELCOMEPAGE_TITLE "欢迎安装 CodeBanana 桌面应用"
  !define MUI_WELCOMEPAGE_TEXT "CodeBanana 是您的 AI 编程助手，提供智能代码补全、翻译功能、账号管理等企业级特性。$\r$\n$\r$\n本向导将引导您完成安装过程。$\r$\n$\r$\n点击"下一步"继续安装。"
!macroend

# 自定义完成页面
!macro customFinishPage
  !define MUI_FINISHPAGE_TITLE "安装完成"
  !define MUI_FINISHPAGE_TEXT "CodeBanana 已成功安装到您的计算机。$\r$\n$\r$\n✅ 应用已就绪$\r$\n✅ 桌面快捷方式已创建$\r$\n✅ 开始菜单项已添加$\r$\n$\r$\n点击"完成"启动应用。"
  !define MUI_FINISHPAGE_RUN "$INSTDIR\${PRODUCT_NAME}.exe"
  !define MUI_FINISHPAGE_RUN_TEXT "立即运行 CodeBanana"
  !define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\高级功能说明.txt"
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "查看功能说明"
!macroend

# 安装前检查
!macro customInit
  # 检查是否已经在运行
  System::Call 'kernel32::CreateMutex(i 0, i 0, t "CodeBananaMutex") i .r1 ?e'
  Pop $R0
  StrCmp $R0 0 +3
    MessageBox MB_OK|MB_ICONEXCLAMATION "CodeBanana 正在运行，请先关闭应用再继续安装。"
    Abort
  
  # 检查系统要求
  # 检查 Windows 版本（至少 Windows 7）
  ${If} ${AtMostWinVista}
    MessageBox MB_OK|MB_ICONSTOP "此应用需要 Windows 7 或更高版本。"
    Abort
  ${EndIf}
!macroend

# 安装文件时的自定义操作
!macro customInstall
  # 复制额外的文档文件
  SetOutPath "$INSTDIR"
  File /oname=高级功能说明.txt "${BUILD_RESOURCES_DIR}\..\高级功能说明.txt"
  File /oname=使用说明.txt "${BUILD_RESOURCES_DIR}\..\使用说明.txt"
  
  # 复制图标资源文件夹
  SetOutPath "$INSTDIR\icons"
  File /r "${BUILD_RESOURCES_DIR}\..\icons\*.*"
  
  # 创建数据目录
  CreateDirectory "$APPDATA\codebanana-desktop-app"
  
  # 写入安装信息
  WriteRegStr HKCU "Software\CodeBanana\Desktop" "InstallPath" "$INSTDIR"
  WriteRegStr HKCU "Software\CodeBanana\Desktop" "Version" "${VERSION}"
  WriteRegStr HKCU "Software\CodeBanana\Desktop" "InstallDate" "$"$(^Date)$""
  
  # 添加到环境变量（可选）
  # WriteRegExpandStr HKCU "Environment" "CODEBANANA_HOME" "$INSTDIR"
  
  # 创建卸载信息
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayName" "CodeBanana 桌面应用"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "Publisher" "CodeBanana Team"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "DisplayIcon" "$INSTDIR\${PRODUCT_NAME}.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "UninstallString" "$INSTDIR\Uninstall ${PRODUCT_NAME}.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "NoRepair" 1
  
  # 计算安装大小
  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}" "EstimatedSize" "$0"
!macroend

# 卸载时的自定义操作
!macro customUnInstall
  # 询问是否删除用户数据
  MessageBox MB_YESNO|MB_ICONQUESTION "是否删除应用数据（包括账号信息、翻译缓存）？" IDYES delete_data IDNO keep_data
  
  delete_data:
    RMDir /r "$APPDATA\codebanana-desktop-app"
    Goto after_data
  
  keep_data:
    # 保留用户数据
    DetailPrint "保留用户数据：$APPDATA\codebanana-desktop-app"
  
  after_data:
  
  # 删除注册表信息
  DeleteRegKey HKCU "Software\CodeBanana\Desktop"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
  
  # 删除开始菜单文件夹
  RMDir /r "$SMPROGRAMS\CodeBanana"
  
  # 删除桌面快捷方式
  Delete "$DESKTOP\CodeBanana.lnk"
  
  # 删除安装目录
  RMDir /r "$INSTDIR"
!macroend

# 自定义页面标题和文本
!macro customInstallMode
  !define MUI_TEXT_INSTALLING_TITLE "正在安装 CodeBanana"
  !define MUI_TEXT_INSTALLING_SUBTITLE "请稍候，正在安装文件..."
  !define MUI_TEXT_FINISH_TITLE "安装完成"
  !define MUI_TEXT_FINISH_SUBTITLE "CodeBanana 已成功安装"
  !define MUI_TEXT_ABORT_TITLE "安装已取消"
  !define MUI_TEXT_ABORT_SUBTITLE "安装程序被用户取消"
!macroend

# 自定义语言字符串
!macro customLanguage
  LangString WELCOME_TITLE ${LANG_SIMPCHINESE} "欢迎使用 CodeBanana 安装向导"
  LangString WELCOME_TEXT ${LANG_SIMPCHINESE} "这个向导将帮助您在计算机上安装 CodeBanana。$\r$\n$\r$\nCodeBanana 提供：$\r$\n• AI 智能编程助手$\r$\n• 内置翻译功能$\r$\n• 账号自动管理$\r$\n• 自定义服务配置$\r$\n$\r$\n点击"下一步"继续。"
!macroend

# 设置压缩方式
!macro customHeader
  SetCompressor /SOLID lzma
  SetCompressorDictSize 64
  SetDatablockOptimize on
!macroend