"""
Django settings for config project.

Generated by 'django-admin startproject' using Django 3.2.5.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

import hashlib
from os import environ, path
from pathlib import Path

import ldap
from corsheaders.defaults import default_headers
from django_auth_ldap.config import LDAPSearch
from home.src.ta.helper import ta_host_parser
from home.src.ta.settings import EnvironmentSettings

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

PW_HASH = hashlib.sha256(environ["TA_PASSWORD"].encode())
SECRET_KEY = PW_HASH.hexdigest()

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(environ.get("DJANGO_DEBUG"))

ALLOWED_HOSTS, CSRF_TRUSTED_ORIGINS = ta_host_parser(environ["TA_HOST"])

# Application definition

INSTALLED_APPS = [
    "home.apps.HomeConfig",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "corsheaders",
    "whitenoise.runserver_nostatic",
    "django.contrib.staticfiles",
    "django.contrib.humanize",
    "rest_framework",
    "rest_framework.authtoken",
    "api",
    "config",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "home.src.ta.health.HealthCheckMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

if bool(environ.get("TA_LDAP")):
    # pylint: disable=global-at-module-level
    global AUTH_LDAP_SERVER_URI
    AUTH_LDAP_SERVER_URI = environ.get("TA_LDAP_SERVER_URI")

    global AUTH_LDAP_BIND_DN
    AUTH_LDAP_BIND_DN = environ.get("TA_LDAP_BIND_DN")

    global AUTH_LDAP_BIND_PASSWORD
    AUTH_LDAP_BIND_PASSWORD = environ.get("TA_LDAP_BIND_PASSWORD")

    """
    Since these are new environment variables, taking the opporunity to use
    more accurate env names.
    Given Names are *_technically_* different from Personal names, as people
    who change their names have different given names and personal names,
    and they go by personal names. Additionally, "LastName" is actually
    incorrect for many cultures, such as Korea, where the
    family name comes first, and the personal name comes last.

    But we all know people are going to try to guess at these, so still want
    to include names that people will guess, hence using first/last as well.
    """

    # Attribute mapping options

    global AUTH_LDAP_USER_ATTR_MAP_USERNAME
    AUTH_LDAP_USER_ATTR_MAP_USERNAME = (
        environ.get("TA_LDAP_USER_ATTR_MAP_USERNAME")
        or environ.get("TA_LDAP_USER_ATTR_MAP_UID")
        or "uid"
    )

    global AUTH_LDAP_USER_ATTR_MAP_PERSONALNAME
    AUTH_LDAP_USER_ATTR_MAP_PERSONALNAME = (
        environ.get("TA_LDAP_USER_ATTR_MAP_PERSONALNAME")
        or environ.get("TA_LDAP_USER_ATTR_MAP_FIRSTNAME")
        or environ.get("TA_LDAP_USER_ATTR_MAP_GIVENNAME")
        or "givenName"
    )

    global AUTH_LDAP_USER_ATTR_MAP_SURNAME
    AUTH_LDAP_USER_ATTR_MAP_SURNAME = (
        environ.get("TA_LDAP_USER_ATTR_MAP_SURNAME")
        or environ.get("TA_LDAP_USER_ATTR_MAP_LASTNAME")
        or environ.get("TA_LDAP_USER_ATTR_MAP_FAMILYNAME")
        or "sn"
    )

    global AUTH_LDAP_USER_ATTR_MAP_EMAIL
    AUTH_LDAP_USER_ATTR_MAP_EMAIL = (
        environ.get("TA_LDAP_USER_ATTR_MAP_EMAIL")
        or environ.get("TA_LDAP_USER_ATTR_MAP_MAIL")
        or "mail"
    )

    global AUTH_LDAP_USER_BASE
    AUTH_LDAP_USER_BASE = environ.get("TA_LDAP_USER_BASE")

    global AUTH_LDAP_USER_FILTER
    AUTH_LDAP_USER_FILTER = environ.get("TA_LDAP_USER_FILTER")

    global AUTH_LDAP_USER_SEARCH
    # pylint: disable=no-member
    AUTH_LDAP_USER_SEARCH = LDAPSearch(
        AUTH_LDAP_USER_BASE,
        ldap.SCOPE_SUBTREE,
        "(&("
        + AUTH_LDAP_USER_ATTR_MAP_USERNAME
        + "=%(user)s)"
        + AUTH_LDAP_USER_FILTER
        + ")",
    )

    global AUTH_LDAP_USER_ATTR_MAP
    AUTH_LDAP_USER_ATTR_MAP = {
        "username": AUTH_LDAP_USER_ATTR_MAP_USERNAME,
        "first_name": AUTH_LDAP_USER_ATTR_MAP_PERSONALNAME,
        "last_name": AUTH_LDAP_USER_ATTR_MAP_SURNAME,
        "email": AUTH_LDAP_USER_ATTR_MAP_EMAIL,
    }

    if bool(environ.get("TA_LDAP_DISABLE_CERT_CHECK")):
        global AUTH_LDAP_GLOBAL_OPTIONS
        AUTH_LDAP_GLOBAL_OPTIONS = {
            ldap.OPT_X_TLS_REQUIRE_CERT: ldap.OPT_X_TLS_NEVER,
        }

    AUTHENTICATION_BACKENDS = ("django_auth_ldap.backend.LDAPBackend",)

# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

CACHE_DIR = EnvironmentSettings().get_cache_dir()
DB_PATH = path.join(CACHE_DIR, "db.sqlite3")
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": DB_PATH,
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",  # noqa: E501
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",  # noqa: E501
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",  # noqa: E501
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",  # noqa: E501
    },
]

AUTH_USER_MODEL = "home.Account"

# Forward-auth authentication
if bool(environ.get("TA_ENABLE_AUTH_PROXY")):
    TA_AUTH_PROXY_USERNAME_HEADER = (
        environ.get("TA_AUTH_PROXY_USERNAME_HEADER") or "HTTP_REMOTE_USER"
    )
    TA_AUTH_PROXY_LOGOUT_URL = environ.get("TA_AUTH_PROXY_LOGOUT_URL")

    MIDDLEWARE.append("home.src.ta.auth.HttpRemoteUserMiddleware")

    AUTHENTICATION_BACKENDS = (
        "django.contrib.auth.backends.RemoteUserBackend",
    )


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = "en-us"
TIME_ZONE = environ.get("TZ") or "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = "/static/"
STATICFILES_DIRS = (str(BASE_DIR.joinpath("static")),)
STATIC_ROOT = str(BASE_DIR.joinpath("staticfiles"))
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LOGIN_URL = "/login/"
LOGOUT_REDIRECT_URL = "/login/"

# Cors needed for browser extension
# background.js makes the request so HTTP_ORIGIN will be from extension
if environ.get("DISABLE_CORS"):
    # disable cors
    CORS_ORIGIN_ALLOW_ALL = True
else:
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"moz-extension://*",
        r"chrome-extension://*",
    ]
    CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]


CORS_ALLOW_HEADERS = list(default_headers) + [
    "mode",
]

# TA application settings
TA_UPSTREAM = "https://github.com/tubearchivist/tubearchivist"
TA_VERSION = "v0.4.2"
