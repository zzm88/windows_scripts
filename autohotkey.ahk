;-----------------------------------------
; Mac keyboard to Windows Key Mappings
;=========================================

; --------------------------------------------------------------
; NOTES
; --------------------------------------------------------------
; ! = ALT
; ^ = CTRL
; + = SHIFT
; # = WIN
;
; Debug action snippet: MsgBox You pressed Control-A while Notepad is active.

#InstallKeybdHook
#SingleInstance force
SetTitleMatchMode 2
SendMode Input

; --------------------------------------------------------------
; Mac-like screenshots in Windows (requires Windows 10 Snip & Sketch)
; --------------------------------------------------------------

; Capture entire screen with CMD/WIN + SHIFT + 3
#+3::send #{PrintScreen}

; Capture portion of the screen with CMD/WIN + SHIFT + 4
#+4::#+s

; --------------------------------------------------------------
; media/function keys all mapped to the right option key
; --------------------------------------------------------------

RAlt & F7::SendInput {Media_Prev}
RAlt & F8::SendInput {Media_Play_Pause}
RAlt & F9::SendInput {Media_Next}
;F10::SendInput {Volume_Mute}
;F11::SendInput {Volume_Down}
;F12::SendInput {Volume_Up}

; swap left command/windows key with left alt
;LWin::LAlt
;LAlt::LWin ; add a semicolon in front of this line if you want to disable the windows key

; Remap Windows + Left OR Right to enable previous or next web page
; Use only if swapping left command/windows key with left alt
;Lwin & Left::Send, !{Left}
;Lwin & Right::Send, !{Right}

; Eject Key
;F20::SendInput {Insert} ; F20 doesn't show up on AHK anymore, see #3

; F13-15, standard windows mapping
F13::SendInput {PrintScreen}
F14::SendInput {ScrollLock}
F15::SendInput {Pause}

;F16-19 custom app launchers, see http://www.autohotkey.com/docs/Tutorial.htm for usage info
F16::Run http://twitter.com
F17::Run http://tumblr.com
F18::Run http://www.reddit.com
F19::Run https://facebook.com

; --------------------------------------------------------------
; OS X system shortcuts
; --------------------------------------------------------------

; Make Ctrl + S work with cmd (windows) key
#s::Send, ^s

; Selecting
#a::
  KeyWait, a
  Send, ^a
  
  return

; --------------------------------------------------------------
; copy paste cut undo
; --------------------------------------------------------------

; Copying
#c::Send, ^c

; Pasting
#v::Send, ^v

; Cutting
#x::Send, ^x
; Undo
#z::Send ^z


; Opening
#o::Send ^o

; Finding
#f::Send ^f

; --------------------------------------------------------------
; voice input
; --------------------------------------------------------------




; Redo
#y::Send ^y

; New tab
#t::Send ^t

; close tab
#w::Send ^w

; Close windows (cmd + q to Alt + F4)
#q::Send !{F4}

; Remap Windows + Tab to Alt + Tab.
;Lwin & Tab::AltTab

; minimize windows
#m::WinMinimize,a




; --------------------------------------------------------------
; OS X keyboard mappings for special chars
; --------------------------------------------------------------





; --------------------------------------------------------------
; Custom mappings for special chars	
; --------------------------------------------------------------

;#ö::SendInput {[} 
;#ä::SendInput {]} 

;^ö::SendInput {{} 
;^ä::SendInput {}} 


; --------------------------------------------------------------
; Application specific
; --------------------------------------------------------------
 
; --------------------------------------------------------------
;  chrome 
; --------------------------------------------------------------
; Google Chrome
#IfWinActive, ahk_class Chrome_WidgetWin_1

; Show Web Developer Tools with cmd + alt + i
#!i::Send {F12}
#+c::Send ^+c
; Show source code with cmd + alt + u
#!u::Send ^u

#r::Send ^+r

#IfWinActive

; --------------------------------------------------------------
;  rider 
; --------------------------------------------------------------
; jetbrains rider
#IfWinActive, ahk_class SunAwtFrame
#Down::Send ^!{Down}
#w::Send ^{F4}
#IfWinActive

; --------------------------------------------------------------
;  Global 
; --------------------------------------------------------------
; my Global keybindings
#Space::Send #!{Space}

#=::Send ^{=}
#-::Send ^{-}
#r::Send ^{r}
#0::Send ^{0}
#p::Send ^{p}
#n::Send ^{n}
;#j::Send ^{j}


#/::Send ^{/}			
#d::Send ^{d}
#Enter::Send ^{Enter}
#+f::Send ^+{f}

;vdesktop navigation
#j::Send #^{Left}
#k::Send #^{Right}		

!^Esc::Send {Ctrl down}{LWin down}{Left}{LWin up}{Ctrl up}
!^+Esc::Send {Ctrl down}{RWin down}{Right}{RWin up}{Ctrl up}


!Tab::Send #{Tab}	

; for snipaste f3
;F3::
;   Send, ^c
;   Sleep, 100
;   Send, {F3}
;Return

; F2::Send ^F9 deepL

; ^Backspace::Send !{Backspace}

; --------------------------------------------------------------
;Notion
; --------------------------------------------------------------

#IfWinActive, ahk_exe Notion.exe
#n::Send ^+n
#e::Send ^e
#[::Send ^[
#]::Send ^]
;#1::Send ^+1 
;#0::Send ^+0
#IfWinActive

; --------------------------------------------------------------
;TOTALCMD64
; --------------------------------------------------------------
;ahk_exe TOTALCMD64.EXE
#IfWinActive, ahk_exe TOTALCMD64.EXE
#f::Send ^f
#IfWinActive

; --------------------------------------------------------------
;  vscode Insiders
; --------------------------------------------------------------
;ahk_exe Code - Insiders.exe
#IfWinActive, ahk_exe Code - Insiders.exe
+Esc::Send ^``
!Enter::Send ^.
#IfWinActive

; --------------------------------------------------------------
;  DeepL 
; --------------------------------------------------------------
#IfWinActive, ahk_exe DeepL.exe
#c::Send ^c
#IfWinActive



;press a twice  write "Hello World!" https://www.autohotkey.com/board/topic/103198-fast-way-to-detect-double-key-presses/
~a::
	if (A_PriorHotkey <> "~a" or A_TimeSincePriorHotkey > 200)
	{
		KeyWait, a
		return
	}
	;Send {backspace 2}aa
return


; --------------------------------------------------------------
;  notepad 
; --------------------------------------------------------------
;ahk_exe Notepad.exe
#IfWinActive, ahk_exe Notepad.exe
#s::
	Send ^s
	Reload
Return

#IfWinActive



^Space::Send !+3




; --------------------------------------------------------------
;  google shortcut ctrl+g
; --------------------------------------------------------------
#NoEnv
SendMode Input
SetWorkingDir %A_ScriptDir%
SetTitleMatchMode, 2

; --------------------------------------------------------------
; @@ streamdeck  一键系列 onekey 1key
; --------------------------------------------------------------
;一键google

^!#+g::
Clipboard := ""
Send, ^c
ClipWait, 1
if (ErrorLevel) {
  MsgBox, Failed to copy the selected text.
  return
}
Run, https://www.google.com/search?q=%clipboard%
return

;一键image
^!#+i::
Clipboard := ""
Send, ^c
ClipWait, 2
if (ErrorLevel) {
  MsgBox, Failed to copy the selected text.
  return
}
Run, https://www.google.com/search?q=%clipboard%&newwindow=1&sxsrf=APwXEdcRCGK2Jaj-OyGIOMlac48UqJ59aw:1682494041600&source=lnms&tbm=isch&sa=X&ved=2ahUKEwjduL7dgsf-AhVUk4kEHTAnAZAQ0pQJegQIBBAC&biw=1535&bih=1568&dpr=1.25
return

;一键url
^!#+u::
Clipboard := ""
Send, ^c
ClipWait, 1
if (ErrorLevel) {
  MsgBox, Failed to copy the selected text.
  return
}
Run, %clipboard%
return

;一键zlib
^!#+z::
Clipboard := ""
Send, ^c
ClipWait, 2
if (ErrorLevel) {
  MsgBox, Failed to copy the selected text.
  return
}
Run, https://lib-fhdpaezs2syilxeaxmat66mo.b-ok.africa/s/?q=%clipboard%
return




; --------------------------------------------------------------
;delete key

#Backspace::
Send {Delete}
return

; --------------------------------------------------------------
;ahk, when saved file(in vscode), reload script
#Persistent
SetTimer, ReloadScript, 1000
return

ReloadScript:
IfWinActive, ahk_exe Code.exe
{
    IfWinExist, ahk_id %CodeMainWindow%
    {
        WinActivate ahk_id %CodeMainWindow%
        SendInput ^s
        Sleep, 200
        SendInput ^r
    }
}
return

CodeMainWindow:
WinGet, CodeMainWindow, ID, A
return




#F1:: ; Use Win+Z to switch between Unity and Houdini windows
WinGetTitle, currentTitle, A ; Get the title of the current window
if (currentTitle ~= "Unity")
{
    ; If the current window is Unity, switch to the Houdini window
    WinActivate, ahk_exe hindie.steam.exe
}
else if (currentTitle ~= "Houdini")
{
    ; If the current window is Houdini, switch to the Unity window
    WinActivate, ahk_exe Unity.exe
}
return




; ----------------------#+num => Fnum----------------------------------------


;@@ F5 F6 F7 F8
; -----You can use AutoHotkey to launch Notion.exe using the following script:

F7::
IfWinExist, ahk_exe Notion.exe
{
    WinActivate ; activate the existing window
}
else
{
    Run, "C:\Users\zzm88\AppData\Local\Programs\Notion\Notion.exe" ; launch the application
}
return

F5::
IfWinExist, ahk_exe chrome.exe 
{
    WinActivate ; activate the existing window
}
else
{
    Run, "C:\Program Files\Google\Chrome\Application\chrome.exe" ; launch the application
}
return

F6::
IfWinExist, ahk_exe Code.exe
{
    WinActivate ; activate the existing window
}
else
{
    Run, "C:\Users\zzm88\AppData\Local\Programs\Microsoft VS Code\Code.exe" ; launch the application
}
return


F8::
IfWinExist, ahk_exe Eagle.exe
{
    WinActivate ; activate the existing window
}
else
{
    Run, "C:\Program Files\Eagle\Eagle.exe" ; launch the application
}
return


F9::
IfWinExist, ahk_exe Unity.exe
{
    WinActivate ; activate the existing window
}
else
{
    Run, "C:\Program Files\Unity Hub\Unity Hub.exe" ; launch Unity
}
return

F10::
IfWinExist, ahk_exe hindie.steam.exe
{
    WinActivate ; activate the existing window
}
else
{
    Run, "C:\Program Files (x86)\Steam\steamapps\common\Houdini\bin\hindie.exe" ; launch Houdini
}
return





;-------（not working)i want to reload script everytime i save the ahk script. 

#Persistent
#SingleInstance force

; Set the initial timestamp of the script file
FileGetTime, scriptTimestamp, %A_ScriptFullPath%

; Set the loop delay time in milliseconds (e.g. 500ms)
loopDelay := 500

Loop
{
    ; Wait for the loop delay time
    Sleep, %loopDelay%
    
    ; Get the current timestamp of the script file
    FileGetTime, currentTimestamp, %A_ScriptFullPath%
    
    ; Check if the script file has been modified since the last check
    if (currentTimestamp != scriptTimestamp)
    {
        ; Update the script timestamp
        scriptTimestamp := currentTimestamp
        
        ; Reload the script
        Reload
    }
}


; PageUp and PageDown keys to Ctrl+Tab and Ctrl+Shift+Tab, respectively Chrome.exe 

#IfWinActive, ahk_exe chrome.exe
PgDn::^Tab
PgUp::^+Tab
#IfWinActive
