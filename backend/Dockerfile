# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Install Poppler Utils, a system-level dependency
RUN apt-get update && apt-get install -y poppler-utils && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

ENV PYTHONPATH "${PYTHONPATH}:/app"
ENV PYTHONUNBUFFERED=1

# Copy the dependencies file to the working directory
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy the rest of the application's code
COPY ./app /app/app
COPY ./.env /app/.env

# Expose the port the app runs on
EXPOSE 8000

# Run the Uvicorn server
# The --host 0.0.0.0 flag is crucial to make the server accessible from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "debug"]