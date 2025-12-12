@echo off
REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

REM Wait a bit
timeout /t 2 /nobreak

REM Start the server in background
start "Backend Server" cmd /k "cd /d c:\Users\EMMANUEL\Documents\site tru\backend && npm start"

REM Wait for server to start
timeout /t 5 /nobreak

REM Run tests
cd /d c:\Users\EMMANUEL\Documents\site tru\backend
node run-tests.js

REM Show results
echo.
echo Test results saved to test-results.log
type test-results.log

pause
