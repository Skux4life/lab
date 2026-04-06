# FROM python:3.15.0a7-slim-trixie
FROM 831411500862.dkr.ecr.us-east-1.amazonaws.com/python:3.15.0a7-slim-trixie

# Added in a later video. 
# You can omit this if you are building for the first.
RUN apt-get update && apt-get install -y curl wget 

# Inside Container
# make a new folder inside container
WORKDIR /app

# Outside Container -> Inside Container
# this contains the libraries want to install to run the app
COPY requirements.txt requirements.txt

# This is just junk
#COPY Readme.md Readme.md

# Inside Container
# Install the python libraries used for the app
RUN pip3 install -r requirements.txt

# Outside Container -> Inside Container
# . means everything in the current directory
# first period . - /app (outside container)
# second period . /app (inside container)
COPY . .

# EXPOSE ${PORT}
EXPOSE 4567

ENV PYTHONUNBUFFERED=1

# CMD (Command)
# python3 -m flask run --host=0.0.0.0 --port=4567
CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4567", "--debug"]
