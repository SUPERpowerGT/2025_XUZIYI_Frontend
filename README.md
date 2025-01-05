# Coin Calculator - Frontend

This is the frontend part of the Coin Calculator application. It is built with React and served via Nginx. The frontend offers a user-friendly interface that enables users to calculate the minimum number of coins needed for a target amount based on user-specified coin denominations. It interacts with the backend service to carry out the calculations.

## Features
- **React-Based UI**: Features a clean and responsive design.
- **Dynamic Error Handling**: Displays meaningful error messages received from the backend.
- **API Integration**: Connects to the backend for real-time calculations.
- **Input Validation**: Ensures that the inputs for target amounts and denominations are valid.

## Technologies Used
- **React**: Used for constructing the user interface.
- **CSS**: Employed for styling the application.
- **Nginx**: Serves the React build and proxies API requests.

## Project Structure
```
frontend/
├── build/                 # Compiled React application
├── public/
│   └── index.html         # HTML entry point
├── src/
│   ├── components/        # React components
│   │   ├── CoinCalculator.js
│   ├── App.js             # Main React component
│   ├── App.css            # Styling for the app
│   ├── index.js           # React DOM rendering
├── nginx.conf             # Nginx configuration
├── Dockerfile             # Dockerfile for frontend deployment
├── package.json           # NPM dependencies and scripts
└──.dockerignore          # Files to ignore during Docker build
```

## How to Run the Frontend Locally
### Prerequisites
- Node.js and npm are installed.
- A running backend server (refer to the backend setup).

### Steps
1. Navigate to the frontend directory:
```bash
cd frontend
```
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm start
```
4. Access the application in your browser:
```bash
http://localhost:3000
```

## Connecting to the Backend
The frontend depends on the backend API for calculations. The API URL is `/api/calculate`.

### To connect the frontend to the backend:
- Ensure the backend server is running at `http://localhost:8080` or another appropriate host/port.
- Proxy API requests to the backend:
    - In the development environment, React uses a `proxy` field in `package.json` to forward API calls. Open `package.json` and add the following line:
    ```json
    "proxy": "http://localhost:8080"
    ```
    This makes sure that requests to `/api/calculate` are forwarded to the backend running at `http://localhost:8080`.

### Production Configuration (Nginx):
In production, API requests are proxied using Nginx. This is managed by the `nginx.conf` file:
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/; 
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Update `proxy_pass` to point to your backend's actual hostname and port (e.g., `http://localhost:8080`).

## Building the Frontend for Production
To build the React application for production:
1. Run the build command:
```bash
npm run build
```
The compiled files will be placed in the `build/` directory.
2. Deploy the `build/` directory using Nginx or any other static file server.

## Docker Deployment

The frontend can be containerized with Docker for convenient deployment alongside the backend on the same network. This allows for seamless integration and communication between the two components.

### Steps to Build and Run the Docker Images:
1. Navigate to the frontend directory:
```bash
cd frontend
```
2. Build the Docker image for the frontend:
```bash
docker build -t coin-calculator-frontend.
```
3. Navigate to the backend directory:
```bash
cd../backend
```
4. Build the Docker image for the backend:
```bash
docker build -t coin-calculator-backend.
```
5. Create a Docker network to connect the containers:
```bash
docker network create coin-calculator-network
```
6. Run the backend container on the created network:
```bash
docker run --name backend --network coin-calculator-network -p 8080:8080 coin-calculator-backend
```
7. Run the frontend container on the same network:
```bash
docker run --name frontend --network coin-calculator-network -p 3000:80 coin-calculator-frontend
```
8. Access the application in your browser:
```bash
http://localhost:3000
```

## Backend Integration in Docker:
The `nginx.conf` file ensures that API requests are forwarded to the backend. Since both containers are on the same Docker network, the `proxy_pass` directive in `nginx.conf` should be set to:
```nginx
proxy_pass http://backend:8080/;
```

This configuration enables the frontend to communicate with the backend effectively. When a user interacts with the frontend application and initiates a calculation request, the frontend sends the necessary data to the backend via the specified API endpoint. The backend then processes the request and returns the result, which the frontend can display to the user. By using Docker networks, we can simplify the deployment process and ensure reliable communication between the two parts of our application. 

### Backend Integration in Docker:
The `nginx.conf` file ensures that API requests are forwarded to the backend. To deploy the backend and frontend together, ensure the backend container is named `backend` or update the `proxy_pass` directive in `nginx.conf` to match the backend container's name or IP address.

## Example API Request
The frontend sends a POST request to `/api/calculate` with the following payload:
```json
{
  "targetAmount": 126.5,
  "denominations": [0.5, 2.0, 5.0, 10.0, 50.0, 100.0]
}
```

### Expected backend response:
- **Success**:
```json
{
  "coinsUsed": [100.0, 10.0, 10.0, 5.0, 2.0, 0.5]
}
```
- **Error**:
```json
{
  "message": "Invalid denominations or target amount."
}
``` 
# Challenges and Solutions in Frontend Development

During the development and deployment of the Coin Calculator frontend, we faced several challenges, including network interface configuration, understanding the architecture of Nginx, communication with the backend, and unfamiliarity with React. Below is a detailed summary of the challenges and their corresponding solutions, organized for readability.

---

## Challenge 1: Frontend Network Interface Configuration

**Problem:**  
During development, ensuring the frontend could successfully call the backend API required correct network interface configuration. When deploying the frontend in a Docker container, special care was needed to enable communication with the backend.

**Solution:**  
1. **Use Nginx to configure a proxy** that forwards frontend `/api` requests to the backend service.  
2. Since the frontend and backend run in the same Docker network, communication was achieved via the backend container name `backend` and its port `8080`.
3. Modify the Nginx configuration file to ensure API requests are correctly proxied to the backend.  
   For example, the following Nginx configuration forwards `/api` requests:
   ```nginx
   location /api/ {
       proxy_pass http://backend:8080/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```
4. During React frontend development, add a `proxy` field in the `package.json` to support local testing:
   ```json
   "proxy": "http://localhost:8080"
   ```

---

## Challenge 2: Understanding Nginx Architecture

**Problem:**  
When using Nginx to deploy the frontend, we needed to configure a proxy to achieve the following goals:
1. Support accessing the frontend through the **public IP address**.
2. Ensure `/api` requests are correctly proxied to the backend service.

**Solution:**  
1. Configure the `server_name` in Nginx to the **public IP address** so the frontend page can be accessed over the public network.
2. Configure `/` to serve the frontend page and `/api/` to proxy backend requests:
   ```nginx
   server {
       listen 80;
       server_name your-ec2-public-ip;

       location / {
           root /usr/share/nginx/html;
           index index.html;
           try_files $uri /index.html;
       }

       location /api/ {
           proxy_pass http://backend:8080/;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

**Note:**  
- The `proxy_pass` uses the container name `backend` since the frontend and backend are running in the same Docker network.  
- Ensure your AWS security group allows traffic on **port 80** for HTTP and **port 8080** for backend API access.

---

## Challenge 3: Unfamiliarity with React Architecture

**Problem:**  
Due to a lack of experience with React, we faced challenges in:
1. Organizing components effectively.
2. Establishing communication with the backend API (e.g., `api/calculate`).
3. Properly managing state and updating the UI.

**Solution:**  
1. **Referencing existing codebases**: Study open-source projects to understand best practices for React application architecture.
2. **Trial and error**: Repeatedly adjust component structure until it met functional requirements.
3. **Implementing API calls**:
   - Use the `fetch` method to interact with the backend:
     ```javascript
     const handleSubmit = async (e) => {
         e.preventDefault();
         const payload = {
             targetAmount: parseFloat(targetAmount),
             denominations: denominations.split(",").map((value) => parseFloat(value.trim())),
         };

         try {
             const response = await fetch("/api/calculate", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify(payload),
             });
             if (!response.ok) {
                 throw new Error(await response.text());
             }
             const data = await response.json();
             setResult(data.coinsUsed);
         } catch (err) {
             setError(err.message);
         }
     };
     ```
   - When calling the backend API via `/api/calculate`, ensure the request path is correctly proxied through Nginx.

---

## Challenge 4: Dockerizing the Frontend

**Problem:**  
When packaging the frontend as a Docker container for deployment on the cloud, we needed to ensure:
1. The container started correctly and served the application.
2. The container communicated with the backend using the backend's container name `backend`.

**Solution:**  
1. Create a Dockerfile to containerize the frontend application:
   ```dockerfile
   FROM nginx:alpine

   WORKDIR /usr/share/nginx/html

   RUN rm -rf ./*

   COPY ./build/ /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf

   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```
2. Configure the Nginx file `nginx.conf` to proxy `/api` requests to the backend service.
3. Build and run the Docker container:
   ```bash
   docker build -t coin-calculator-frontend .
   docker run --name frontend --network coin-calculator-network -p 80:80 -d coin-calculator-frontend
   ```

---

## Summary

### Key Challenges:
1. **Frontend Network Interface Configuration**: Setting up proper communication between the frontend and backend APIs.
2. **Understanding Nginx Architecture**: Configuring Nginx to serve the frontend and proxy backend requests.
3. **Unfamiliarity with React**: Organizing components, managing state, and establishing backend communication.
4. **Dockerizing the Frontend**: Packaging the frontend as a Docker container and ensuring communication with the backend.

### Solutions:
1. **Nginx Proxy Configuration**: Utilize `proxy_pass` to enable frontend-to-backend communication. Requests to `/api` are proxied to the backend service.
2. **Learning React**: Refer to open-source projects for architecture and resolve issues through repeated testing and adjustments.
3. **Docker Deployment**: Use Docker and Docker networks to ensure seamless communication between frontend and backend services in the same network.
4. **Public IP Access**: Configure Nginx's `server_name` to the cloud server's public IP address, enabling frontend and backend access over the public internet.

---

## Final Outcome:
- **Frontend Public Access**: The frontend can be accessed at `http://your-ec2-public-ip`.
- **Backend API Functionality**: The frontend's `/api/calculate` requests correctly return responses from the backend.
