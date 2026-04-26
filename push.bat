@echo off
cd C:\tythys-com-cursor
date /t > .\frontend\src\app\version_timestamp
time /t >> .\frontend\src\app\version_timestamp

IF [%1%] equ [] (
	set COMMENT=%DATE%%TIME%
) ELSE (
	set COMMENT=%1%
)
echo.
echo.
echo Commit Comment: "%COMMENT%"
		pause
echo.
echo.
@echo g    h  p_sb5L  2s6tMmbc  7HSi1I0 VztbeW7v   4Ak0IVIQ sd-birthday dd plus 1
@echo config credential.helper store
echo.

set err_code=CD_TYTHYS_DOT_COM_DID_NOT_WORK
    cd C:\tythys-com-cursor				
	IF %ERRORLEVEL% NEQ 0 GOTO E_R_R_O_R

set err_code=GIT_PUSH_DID_NOT_WORK
	git add .
	git commit -m "%COMMENT%"
	git push
	IF %ERRORLEVEL% NEQ 0 GOTO E_R_R_O_R
	@echo [93m   -----------------------------------------------------------
GOTO ALL_OKAY

:E_R_R_O_R
	@pause
	echo.
	echo                 GIT PUSH Failed!!!!                      GIT PUSH Failed!!!!
	echo.
	echo.
	echo ............................................................................
	echo                   BATCH ERROR:       %err_code%
	echo                   OS ERROR:          %ERRORLEVEL% 
	echo .............................................................................
	echo.
	echo.
	echo.
	@REM This below goto will prevent execution of exit command, which is needed for the user to see the error message before the window closes.
	goto error_exit	
exit

:ALL_OKAY
	echo.
	echo                      Push worked fine! 
	timeout /t 1
	@rem echo 1 secs to exit.
	@rem timeout /t 5 >nul

:error_exit