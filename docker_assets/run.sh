#!/bin/bash
# startup script inside the container for tubearchivist

if [[ -z "$ELASTIC_USER" ]]; then
    export ELASTIC_USER=elastic
fi

required="Missing required environment variable"
if [[ ! -f .superuser_created ]]; then
    : "${TA_USERNAME:?$required}"
    : "${TA_PASSWORD?$required}"
fi
: "${ELASTIC_PASSWORD:?$required}"

# ugly nginx and uwsgi port overwrite with env vars
if [[ -n "$TA_PORT" ]]; then
    sed -i "s/8000/$TA_PORT/g" /etc/nginx/sites-available/default
fi

if [[ -n "$TA_UWSGI_PORT" ]]; then
    sed -i "s/8080/$TA_UWSGI_PORT/g" /etc/nginx/sites-available/default
    sed -i "s/8080/$TA_UWSGI_PORT/g" /app/uwsgi.ini
fi

# wait for elasticsearch
counter=0
until curl -u "$ELASTIC_USER":"$ELASTIC_PASSWORD" "$ES_URL" -fs; do
    echo "waiting for elastic search to start"
    counter=$((counter+1))
    if [[ $counter -eq 12 ]]; then
        # fail after 2 min
        echo "failed to connect to elastic search, exiting..."
        exit 1
    fi
    sleep 10
done

# start python application
python manage.py makemigrations
python manage.py migrate

if [[ -f .superuser_created ]]; then
    echo -e "\e[33;1m[WARNING]\e[0m This is not the first run! Skipping" \
        "superuser creation.\nTo force it, remove $(pwd)/.superuser_created"
else
    export DJANGO_SUPERUSER_PASSWORD=$TA_PASSWORD && \
        python manage.py createsuperuser --noinput --name "$TA_USERNAME" && \
        touch .superuser_created
fi

python manage.py collectstatic --noinput -c
nginx &
celery -A home.tasks worker --loglevel=INFO &
celery -A home beat --loglevel=INFO \
    -s "${BEAT_SCHEDULE_PATH:-/cache/celerybeat-schedule}" &
uwsgi --ini uwsgi.ini
