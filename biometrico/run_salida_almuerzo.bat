@echo off
set SCRIPT=salida_almuerzo.js

cd /d C:\Users\juan.estevez\Documents\docker\playwright\biometrico

echo ================================== >> logs.txt
echo Script: %SCRIPT% >> logs.txt
echo Inicio: %date% %time% >> logs.txt

node %SCRIPT% >> logs.txt 2>&1

echo Codigo de salida: %errorlevel% >> logs.txt
echo Fin: %date% %time% >> logs.txt
echo ================================== >> logs.txt
echo. >> logs.txt