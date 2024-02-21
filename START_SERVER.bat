@echo off
cd %~dp0
echo [Note]: All installations require an internet connection.
echo [Note]: You must have the following two installations in order to run the application.
echo [Note]: Close this window to stop the application.
echo ========================================================================
echo Do you want to install Nest Js.? (Y/N)
choice /C YN /M "Press Y for Yes, N for No. "

if errorlevel 2 goto :no_install
if errorlevel 1 goto :run_install

:run_install
npm install -g @nestjs/cli
goto :end

:no_install
echo Skipping Nest Js. installation.

:end

echo -----------------------------------------------------------

echo Do you want to install application dependencies? (Y/N)
choice /C YN /M "Press Y for Yes, N for No. "

if errorlevel 2 goto :no_install
if errorlevel 1 goto :run_install

:run_install
npm install
goto :end

:no_install
echo Skipping npm install.

:end
echo -----------------------------------------------------------
echo Open http://localhost:3000 on your web browser once the application is up and running.
echo Starting application...
npm run start