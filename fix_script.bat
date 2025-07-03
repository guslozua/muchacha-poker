@echo off
echo Subiendo cambios de React 18...
cd C:\xampp2\htdocs\muchacha-poker
git add .
git commit -m "Fix React 18 createRoot implementation"
git push origin main
echo.
echo Cambios subidos correctamente!
echo Espera 2-3 minutos y prueba: https://guslozua.github.io/muchacha-poker
pause
