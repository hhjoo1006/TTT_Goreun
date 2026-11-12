@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 22 LTS or newer from https://nodejs.org then run this file again.
  pause
  exit /b 1
)
echo Log in to Netlify, then select the EXISTING site where you saved GEMINI_API_KEY.
call npx --yes netlify-cli login
if errorlevel 1 goto failed
call npx --yes netlify-cli link
if errorlevel 1 goto failed
echo The next step publishes this code to the selected site's production URL.
pause
call npx --yes netlify-cli deploy --build --prod
if errorlevel 1 goto failed
echo Deployment complete. Open your site URL followed by /api/config to check gemini:true.
pause
exit /b 0
:failed
echo Deployment stopped. Read the error above. No API key should be entered into this file.
pause
exit /b 1
