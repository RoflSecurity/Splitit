# Docker pour Spleeter
FROM python:3.10-slim

WORKDIR /app

# Installer ffmpeg et dépendances système
RUN apt-get update && \
    apt-get install -y ffmpeg git && \
    rm -rf /var/lib/apt/lists/*

# Installer Spleeter + dépendances
RUN pip install --no-cache-dir spleeter==2.1.0 mutagen websockets requests

# Copier scripts et cli
COPY scripts/ /app/scripts/
COPY bin/ /app/bin/

ENTRYPOINT ["/app/scripts/spleeter-docker.sh"]
