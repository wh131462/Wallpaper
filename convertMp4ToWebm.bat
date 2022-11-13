@echo off
setlocal enabledelayedexpansion
::修改utf-8
chcp 65001
set ffmpeg=%cd%\FFmpeg\bin\ffmpeg.exe
set root=%cd%
@echo %ffmpeg%
cd %root%\resources\video
for /f "delims=" %%i in ('dir /b') do (
    echo %%i>tem.txt
    for /f "delims=" %%c in ('find /C ".mp4" tem.txt') do (
        if "%%c"=="---------- TEM.TXT: 1" (
            set str=%root%\resources\video\%%i
            set name=!str:.mp4=.webm!
            @echo 正在将!str!转化到!name!...
            %ffmpeg% -i !str! -y -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus !name!
        )
    )
)
echo All convert successful!
pause
rem 此脚本用于将mp4资源转化为webm格式 由于视频转化消耗资源较大 所以会执行较长时间 请耐心等待