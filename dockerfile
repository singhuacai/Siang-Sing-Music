FROM node:16.8.0
WORKDIR /opt/app
COPY . .
RUN npm install --production

# Default command
CMD ["node", "app.js"]

 