FROM python:3.8-slim-buster

# Install essential system packages
RUN apt update && apt install -y \
                build-essential \
                libffi-dev \
                postgresql \
                zlib1g \
                zlib1g-dev \
                libjpeg-dev \
                libxml2 \
                libxml2-dev \
                libxslt1-dev \
                libfreetype6-dev

# Set environment variables
ENV PIPENV_VENV_IN_PROJECT=1
ENV PIPENV_IGNORE_VIRTUALENVS=1
ENV PIPENV_NOSPIN=1
ENV PIPENV_HIDE_EMOJIS=1
ENV PYTHONPATH=/lemonsaurus

# Make the folder and move the pipfiles into it
RUN mkdir -p /lemonsaurus
COPY Pipfile /lemonsaurus
COPY Pipfile.lock /lemonsaurus

# Install pipenv
RUN pip install pipenv
WORKDIR /lemonsaurus

