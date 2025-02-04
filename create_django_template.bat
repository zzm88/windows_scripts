@echo off
echo Setting up Python project...

REM Create virtual environment
python -m venv venv
if errorlevel 1 (
    echo Failed to create virtual environment
    exit /b 1
)

REM Activate virtual environment
call venv\Scripts\activate
if errorlevel 1 (
    echo Failed to activate virtual environment
    exit /b 1
)

REM Install required packages
echo Installing required packages...
python -m pip install --upgrade pip
pip install django
pip install python-dotenv

REM Create .vscode directory and settings.json for VS Code
if not exist .vscode mkdir .vscode

REM Create settings.json for VS Code
echo Creating VS Code settings...
(
echo {
echo     "python.defaultInterpreterPath": "${workspaceFolder}/venv/Scripts/python.exe",
echo     "python.terminal.activateEnvironment": true,
echo     "terminal.integrated.defaultProfile.windows": "Command Prompt",
echo     "python.analysis.extraPaths": ["${workspaceFolder}"]
echo }
) > .vscode\settings.json

REM Create a basic Django project
django-admin startproject config .
if errorlevel 1 (
    echo Failed to create Django project
    exit /b 1
)

REM Create superuser
echo Creating Django superuser...
python manage.py makemigrations
python manage.py migrate
echo.
echo Please create a superuser account:
python manage.py createsuperuser

REM Create a .gitignore file
echo Creating .gitignore...
echo venv/ > .gitignore
echo *.pyc >> .gitignore
echo __pycache__/ >> .gitignore
echo db.sqlite3 >> .gitignore
echo .env >> .gitignore
echo .vscode/ >> .gitignore

REM Create a requirements.txt file
echo Creating requirements.txt...
pip freeze > requirements.txt

REM Create a basic README.md
echo Creating README.md...
echo # Django Project > README.md
echo. >> README.md
echo This project was set up using an automated script. >> README.md
echo. >> README.md
echo ## Setup >> README.md
echo 1. Create virtual environment: `python -m venv venv` >> README.md
echo 2. Activate virtual environment: `venv\Scripts\activate` >> README.md
echo 3. Install requirements: `pip install -r requirements.txt` >> README.md

echo.
echo Setup complete! Your Django project is ready.
echo.
echo Next steps:
echo 1. Start the development server: python manage.py runserver
echo 2. Visit http://127.0.0.1:8000/ in your browser
echo 3. Access the admin interface at http://127.0.0.1:8000/admin
echo.
pause