::读取目录
@echo on&setlocal enabledelayedexpansion
set  json=dir.json
for /d/r "delims=" %%i in (%cd%\resources\audio) do (
echo %%i
)
echo "测试"
pause