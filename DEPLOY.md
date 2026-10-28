# Deployment

`render.yaml` deploys the React frontend and Express API as one Render web service. The service serves the built frontend and API from the same HTTPS origin, including the Socket.IO connection.

## Required setup

1. Put the contents of this project folder in a private GitHub repository. Do not commit `.env` files or credentials.
2. Create a MongoDB Atlas database and copy its application connection string.
3. In Render, create a Blueprint from the private repository and use `render.yaml`. Enter the MongoDB connection string and the initial admin name, email, and a unique password of at least 12 characters when prompted. Render generates the JWT signing secret and sensor token. The first build seeds the admin account.
4. After deployment, open the Render service URL. The admin account can log in with the bootstrap email and password.

The first deployment seeds only the admin account; it does not create the sample accounts that shipped in the original project. The admin can approve future account requests from the Users page.

## Sensor and blockchain settings

The temperature API requires the generated `SENSOR_TOKEN` when it is configured. Add that value to the ESP32 sketch's `sensorToken` before uploading the sketch. MQTT is disabled unless `MQTT_BROKER_URL` is configured for a broker you control. The blockchain remains disabled until a real contract address and RPC settings are provided; the UI's sample ledger data is mock data.

The hosted service requires a MongoDB connection string. Temperature readings are currently stored in memory, so they reset when the service restarts. Batch, user, and access-request records use MongoDB.
