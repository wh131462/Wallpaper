::读取目录
@echo on&setlocal enabledelayedexpansion
::修改utf-8
chcp 65001
set  root=%cd%
set  json=%root%\dir.json
del %json%
::audio
echo {"audio":[>>%json%
cd %root%\resources\audio
for /f %%a in ('dir /b') do set end=%%a
for /f "delims=" %%i in ('dir /b') do (
if %end% == %%i (
echo "%%i">>%json%
) else (
echo "%%i",>>%json%
)
)
echo ],>>%json%
::img
echo "img":[>>%json%
cd %root%\resources\img
for /f %%a in ('dir /b') do set end=%%a
for /f "delims=" %%i in ('dir /b') do (
if %end% == %%i (
echo "%%i">>%json%
) else (
echo "%%i",>>%json%
)
)
echo ],>>%json%
::video
echo "video":[>>%json%
cd %root%\resources\video
for /f %%a in ('dir /b') do set end=%%a
for /f "delims=" %%i in ('dir /b') do (
if %end% == %%i (
echo "%%i">>%json%
) else (
echo "%%i",>>%json%
)
)
echo ]}>>%json%
echo Success
pause