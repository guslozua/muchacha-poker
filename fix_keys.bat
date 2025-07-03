@echo off
echo Subiendo correccion de keys...
cd C:\xampp2\htdocs\muchacha-poker
git add .
git commit -m "Fix React keys issue - add unique keys to card elements"
git push origin main
echo.
echo ¡Corrección subida! Espera 2-3 minutos y prueba:
echo https://guslozua.github.io/muchacha-poker
echo.
echo Este cambio debería resolver el problema de carga en todos los navegadores.
pause
