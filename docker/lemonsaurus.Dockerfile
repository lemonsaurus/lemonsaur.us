FROM python:3.8.2-slim-buster

# Allow service to handle stops gracefully
STOPSIGNAL SIGQUIT

# Install pipenv
RUN pip install pipenv==2018.11.26

# Install dependencies
COPY Pipfile* ./
RUN pipenv lock --requirements > requirements.txt
RUN pip install -r requirements.txt

# Start the server
CMD ["gunicorn", "--preload", "-b", "0.0.0.0:8002", "lemonsaurus.wsgi:application", "--threads", "4", "-w", "2"]
