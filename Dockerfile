# Use an official Python runtime as a parent image
FROM python:3.12

# Set environment variables for your Django application
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create and set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install -r requirements.txt

# Copy the rest of the application code into the container
COPY . /app/

# Collect static files (customize as needed)


# Run Gunicorn (you can replace this with Daphne if you prefer)
CMD ["python", "manage.py", "runserver"]

