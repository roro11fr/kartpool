FROM python:3.10-slim

# Instalare GDAL și dependențe
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    python3-gdal \
    build-essential \
    python3-dev \
    && apt-get clean

# Setează directorul de lucru
WORKDIR /app

# Copiază fișierul de cerințe și instalează pachetele Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiază restul codului în aplicație
COPY . /app/
