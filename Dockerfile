FROM debian:sid

# Install deps + add Chrome Stable + purge all the things
RUN apt-get update && apt-get install -y --force-yes \
  apt-transport-https \
  ca-certificates \
  curl \
  gnupg \
  --no-install-recommends
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list
RUN apt-get update && apt-get install -y \
	google-chrome-stable \
	--no-install-recommends
# RUN apt-get -f purge --auto-remove -y --force-yes curl gnupg
RUN apt-get -f -y --force-yes remove --purge curl
# RUN apt-get -f -y --force-yes remove --purge gnupg
RUN rm -rf /var/lib/apt/lists/*

# Add Chrome as a user
RUN groupadd -r chrome && useradd -r -g chrome -G audio,video chrome \
    && mkdir -p /home/chrome && chown -R chrome:chrome /home/chrome

EXPOSE 9222

# Autorun chrome headless with no GPU
ENTRYPOINT [ "google-chrome-stable" ]

CMD [ "--headless", "--disable-gpu", "--remote-debugging-address=0.0.0.0", "--remote-debugging-port=9222" ]