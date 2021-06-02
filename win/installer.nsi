; Modern UI definitions
;--------------------------------
;Include Modern UI

!include "MUI2.nsh"

;--------------------------------
;Definitions
!define APP_NAME "LogarithmPlotter"
!define DEV_NAME "Ad5001"
!define WEBSITE "https://logarithmplotter.org"
!define APP_VERSION "0.0.1.0"
!define COPYRIGHT "Ad5001 © 2021"
!define DESCRIPTION "Browse and use online services, free of account."

!define REG_UNINSTALL "Software\Microsoft\Windows\CurrentVersion\Uninstall\LogarithmPlotter"

;--------------------------------
;General description
Name "${APP_NAME}"
Caption "${APP_NAME}"
BrandingText "${APP_NAME}"
OutFile "logarithmplotter-setup.exe"
RequestExecutionLevel admin

;Default installation folder
InstallDir "$PROGRAMFILES\LogarithmPlotter"

;--------------------------------
;Additional parameters
SetCompressor ZLIB
VIProductVersion  "${APP_VERSION}"
VIAddVersionKey "ProductName"  "${APP_NAME}"
VIAddVersionKey "CompanyName"  "${DEV_NAME}"
VIAddVersionKey "LegalCopyright"  "${COPYRIGHT}"
VIAddVersionKey "FileDescription"  "${DESCRIPTION}"
VIAddVersionKey "FileVersion"  "${VERSION}"


;--------------------------------
;defines MUST come before pages to apply to them

!define MUI_PAGE_HEADER_TEXT "${APP_NAME} v${APP_VERSION}"
!define MUI_PAGE_HEADER_SUBTEXT "${COPYRIGHT}"

!define MUI_WELCOMEPAGE_TITLE "Install ${APP_NAME} v${APP_VERSION}"
!define MUI_WELCOMEPAGE_TEXT "Welcome to the ${APP_NAME} installer! Follow the steps provided by this installer to install ${APP_NAME}"
!define MUI_HEADERIMAGE_RIGHT
;Extra space for the title area
;!insertmacro MUI_WELCOMEPAGE_TITLE_3LINES

;Icons
Icon "logplotter.ico"
;!define MUI_HEADERIMAGE
;!define MUI_HEADERIMAGE_BITMAP "logarithmplotter.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "inst_banner.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "inst_banner.bmp"


!define MUI_LICENSEPAGE_TEXT_TOP "This software is governed by the following terms:"
!define MUI_LICENSEPAGE_TEXT_BOTTOM "Have you read and agreed the terms of the license?"
!define MUI_LICENSEPAGE_BUTTON "Next"

;Display a checkbox the user has to check to agree with the license terms.
;!define MUI_LICENSEPAGE_CHECKBOX
;!define MUI_LICENSEPAGE_CHECKBOX_TEXT "I agree"

;*OR*
;Display two radio buttons to allow the user to choose between accepting the license terms or not.
!define MUI_LICENSEPAGE_RADIOBUTTONS
!define MUI_LICENSEPAGE_RADIOBUTTONS_TEXT_ACCEPT "I agree"
!define MUI_LICENSEPAGE_RADIOBUTTONS_TEXT_DECLINE "I disagree"

;!define MUI_COMPONENTSPAGE_TEXT_TOP "Select some Monkeys"
;!define MUI_COMPONENTSPAGE_TEXT_COMPLIST "Choose your Monkeys:"
;!define MUI_COMPONENTSPAGE_TEXT_INSTTYPE "Monkey List:"
;!define MUI_COMPONENTSPAGE_TEXT_DESCRIPTION_TITLE "MUI_COMPONENTSPAGE_TEXT_DESCRIPTION_TITLE"
;!define MUI_COMPONENTSPAGE_TEXT_DESCRIPTION_INFO "MUI_COMPONENTSPAGE_TEXT_DESCRIPTION_INFO"

;!define MUI_DIRECTORYPAGE_TEXT_TOP "MUI_DIRECTORYPAGE_TEXT_TOP"
;!define MUI_DIRECTORYPAGE_TEXT_DESTINATION "MUI_DIRECTORYPAGE_TEXT_DESTINATION"
;!define MUI_DIRECTORYPAGE_VARIABLE $INSTDIR

!define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "Success!"
!define MUI_INSTFILESPAGE_FINISHHEADER_SUBTEXT "${APP_NAME} v${APP_VERSION} was installed on your computer"
!define MUI_INSTFILESPAGE_ABORTHEADER_TEXT "There was an error during the installation process."
!define MUI_INSTFILESPAGE_ABORTHEADER_SUBTEXT "${APP_NAME} v${APP_VERSION} was not installed on your computer."

!define MUI_FINISHPAGE_TITLE "Finished!"
;!define MUI_FINISHPAGE_TITLE_3LINES
!define MUI_FINISHPAGE_TEXT "Press 'Finish' to close this installer program."
;Extra space for the text area (if using checkboxes).
;!define MUI_FINISHPAGE_TEXT_LARGE
!define MUI_FINISHPAGE_BUTTON "Finish"
;!define MUI_FINISHPAGE_CANCEL_ENABLED
;!define MUI_FINISHPAGE_TEXT_REBOOT "MUI_FINISHPAGE_TEXT_REBOOT"
;!define MUI_FINISHPAGE_TEXT_REBOOTNOW "MUI_FINISHPAGE_TEXT_REBOOTNOW"
;!define MUI_FINISHPAGE_TEXT_REBOOTLATER "MUI_FINISHPAGE_TEXT_REBOOTLATER"
;!define MUI_FINISHPAGE_TEXT_REBOOTLATER_DEFAULT

!define MUI_FINISHPAGE_RUN "logarithmplotter.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Run ${APP_NAME}"
;Parameters for the application to run. Don't forget to escape double quotes in the value (use $\").
;!define MUI_FINISHPAGE_RUN_PARAMETERS
;!define MUI_FINISHPAGE_RUN_NOTCHECKED
;!define MUI_FINISHPAGE_RUN_FUNCTION

!define MUI_FINISHPAGE_SHOWREADME "README.md"
;Don't make this label too long or it'll cut on top and bottom.
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Open README"
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
;MUI_FINISHPAGE_SHOWREADME_FUNCTION Function

!define MUI_FINISHPAGE_LINK "${APP_NAME}'s website"
!define MUI_FINISHPAGE_LINK_LOCATION "${WEBSITE}"
;!define MUI_FINISHPAGE_LINK_COLOR RRGGBB

!define MUI_FINISHPAGE_NOREBOOTSUPPORT

;!define MUI_UNCONFIRMPAGE_TEXT_TOP "MUI_UNCONFIRMPAGE_TEXT_TOP"
;!define MUI_UNCONFIRMPAGE_TEXT_LOCATION "MUI_UNCONFIRMPAGE_TEXT_LOCATION"

;hide descriptions on hover
;!define MUI_COMPONENTSPAGE_NODESC

;--------------------------------
;Pages

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.md"
;!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
;!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

;--------------------------------
;Languages

!insertmacro MUI_LANGUAGE "English"

;--------------------------------
;Included files
Section ""
    SetOutPath $INSTDIR
    File logarithmplotter.exe
    File *.dll
    File *.pyd
    File *.md
    File *.manifest
    File *.zip
    File *.bmp
    File *.ico
    File /r qml
    File /r PySide2
    File /r shiboken2


    CreateShortcut "$SMPROGRAMS\LogarithmPlotter.lnk" "$INSTDIR\logarithmplotter.exe"

    WriteUninstaller $INSTDIR\uninstall.exe
    WriteRegStr HKLM ${REG_UNINSTALL} "DisplayName" "LogarithmPlotter"
    WriteRegStr HKLM ${REG_UNINSTALL} "UninstallString" "$INSTDIR\uninstall.exe"
    WriteRegStr HKLM ${REG_UNINSTALL} "QuietUninstallString" "$INSTDIR\uninstall.exe /S"
    WriteRegStr HKLM ${REG_UNINSTALL} "DisplayIcon" "$INSTDIR\logarithmplotter.bmp"
    WriteRegStr HKLM ${REG_UNINSTALL} "DisplayVersion" "${VERSION}"
    WriteRegStr HKLM ${REG_UNINSTALL} "Readme" "$INSTDIR\README.md"
    WriteRegStr HKLM ${REG_UNINSTALL} "URLInfoAbout" "${WEBSITE}"

    SectionEnd

    ;--------------------------------
    ;Uninstaller Section
    ;
    Section "Uninstall"

    RMDir /r "$INSTDIR"

    Delete "$SMPROGRAMS\LogarithmPlotter.lnk"
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\LogarithmPlotter"
;  ;DeleteRegKey /ifempty HKCU "Software\Modern UI Test"
;
SectionEnd
