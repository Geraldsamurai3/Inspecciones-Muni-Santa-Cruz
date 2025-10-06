@echo off
REM Script para ejecutar pruebas en Windows

echo ====================================
echo    EJECUTANDO PRUEBAS UNITARIAS
echo ====================================
echo.

echo Modulos con pruebas:
echo   - Stats (Service + Controller)
echo   - Auth (Service + Controller)  
echo   - Users (Service)
echo.

echo Ejecutando Jest...
echo.

call npm run test:cov

echo.
echo ====================================
echo    PRUEBAS COMPLETADAS
echo ====================================
echo.
echo Para ver el reporte HTML de cobertura ejecuta:
echo    start coverage\lcov-report\index.html
echo.

pause
