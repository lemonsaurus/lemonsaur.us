FROM heavysaturn/lemonsaurus-base:latest

# Move the new files into the right folder
COPY . /lemonsaurus
WORKDIR /lemonsaurus

# Install dependencies
RUN pipenv clean
RUN pipenv install

# Move all static files to a /staticfiles folder
RUN pipenv run collectstatic --noinput

# Make tini the default command handler, and run the pipenv script called start.
CMD ["pipenv", "run", "start"]
