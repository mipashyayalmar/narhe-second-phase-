import os
import sys

# Path to your virtual environment
virtualenv_path = '/home/guidepandharpur/.virtualenvs/venv'

# Add virtualenv site-packages to path
site_packages = os.path.join(virtualenv_path, 'lib/python3.10/site-packages')
if site_packages not in sys.path:
    sys.path.append(site_packages)

# Add your project directory to the path
project_home = '/home/guidepandharpur/narhe-second-phase-'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Activate the virtual environment
activate_this = os.path.join(virtualenv_path, 'bin/activate_this.py')
with open(activate_this) as f:
    exec(f.read(), {'__file__': activate_this})

# Set Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'ig_prj.settings'

# Serve Django via WSGI
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()