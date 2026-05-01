@echo off
rem Note1: /C option makes findstr take multiple words. Words inside " "


@echo.
@echo COMMAND RUN:       findstr /i /l /n /C:"%1" *.bat *.md
@echo s=sub_dir i=ignore_case l=consider_literally n=display_line_numbers c=combine_space_seperated_words r=regex
@echo ________________________________________________________________________
set FIND_STR_CLI=findstr /i /l /n /C:"%1" *.bat *.md
cmd /c echo %FIND_STR_CLI%| clip
echo                Copied to clipboard:   %FIND_STR_CLI%
@echo.

@REM Below is infructuous after the above code copies the CLI to clipboard. So Exit
@REM @pause
@REM @echo _______________________________Results:_________________________________
@REM @echo.
@REM @findstr /s /i /l /n /C:"%1" *.md *.bat
@REM @echo ________________________________________________________________________
@REM @echo.
