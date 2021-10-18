# Movie Recommender

This code pattern is a web application that helps you find new movies to watch and explore the relationships between movies, their genres, and production companies! It's been built to show you how you can use the power of Db2, Db2 REST, Db2 Graph, and Db2 Python UDFs to simply build and deploy applications with complex functionality.

When the reader has completed this code pattern, they will understand how to:

- Deploy Db2, Db2 REST, and Db2 Graph via Docker
- Call Db2 REST services
- Embed Db2 Graph UI into web applications
- Create Db2 Python UDFs that call libraries like Turi Create, Apple's machine learning library in Python

## Prerequisites

1. Docker
2. Python 3
    1. requests module

## Steps

1. Clone this repo
2. Setup IBM Cloud Container Registry
3. Run Db2 Docker containers
4. Setup SSL
5. Build & run the Movie API (Backend) Docker container
6. Setup the database
7. Setup the REST services
8. Setup Db2 Graph
9. Setup & run the frontend

### 1. Clone this repo

The first step to deploying your own movie recommender application is to clone this repo so you have the required resources. Simply run the following command:

```bash
git clone https://github.com/tanmayb123/movierecommender-db2
```

### 2. Setup IBM Cloud Container Registry

This code pattern will make use of certain docker images only available on the IBM Cloud Container Registry. In order to access them, sign up for a free [IBM Cloud account here](https://cloud.ibm.com), and then follow [these steps](https://cloud.ibm.com/docs/cli?topic=cli-getting-started) to setup the IBM Cloud CLI on your machine. Follow steps 1-3, and note that you will not need to access cloud foundry services for this code pattern.

After setting up the CLI and logging into IBM Cloud through it, you will need to enable the "container registry" plugin. You can do so by running the following command:

```bash
ibmcloud plugin install container-registry
```

Then, run the following commands to setup the container registry such that we can find the required images:

```
ibmcloud cr region-set global
ibmcloud cr login
```

Now, when you run the relevant `docker pull` and `docker run` commands, they will be able to grab the correct images.

### 3. Run Db2 Docker containers

As this code pattern uses Db2 to store data and interface with the recommendation algorithm, Db2 REST to communicate with Db2, and Db2 Graph to visualize relationships within the data, we need to deploy these 3 main components first.

All 3 services, Db2, Db2 REST, and Db2 Graph, can be deployed as Docker containers. Let's start with Db2 itself. The following command will:

- Create a container called `movie_db2`.
- Expose Db2's port `50000` to `50000` on the host.
- Accept the license agreement.
- Assign a password of `filmdb2pwd` to the `db2inst1` user, which is the username associated with Db2 and our database.
- Create a database called `MOVIES`.
- Mount `/root/movieappdb` as the location on the host where Db2 within the container actually stores its data.

```bash
docker run -itd --name movie_db2 --privileged=true -p 50000:50000 -e LICENSE=accept -e DB2INST1_PASSWORD=filmdb2pwd -e DBNAME=MOVIES -v /root/movieappdb:/database ibmcom/db2
```

Be careful when running this container — it takes a few minutes for Db2 to really get started. We will use it in step 6 (setting up the database), which is a few minutes away, so it will have started by then. However, if you need to restart this container, or deploy a new instance of it, keep in mind that you should wait around 3-4 minutes for Db2 to start internally before you run commands against it. Running commands prematurely can put your database in an intermediate state that's hard to recover from.

Then, we can deploy Db2 REST. The following command will:

- Create a container called `db2rest`.
- Specify the hostname of the server running the Db2 container (you must set this value in the command).
- Expose Db2 REST's port `50050` to `50050` on the host.
- Accept the license agreement.
- Disable TLS (to keep this example simpler).

```bash
docker run -it --name=db2rest --hostname=<INSERT HOSTNAME> -p 50050:50050 -e LICENSE=accept -e DB2REST_USE_HTTP=true icr.io/obs/hdm/db2rest:latest-amd64
```

The container will prompt you to hit `Ctrl-P Ctrl-Q` once it has started, so you can exit. Once that's done, you can deploy Db2 Graph. The following command will:

- Create a container called `db2graph`.
- Specify the hostname of the server running the Db2 container (you must set this value in the command).
- Mount `/root/db2graphstorage` as the location on the host where Db2 Graph within the container actually stores its data.
- Expose Db2 Graph's ports `8182` and `3000` to `8192` and `3000` on the host, respectively.
- Accept the license agreement.

```bash
docker run -it --name=db2graph --hostname=<INSERT HOSTNAME> -v /root/db2graphstorage:/db2graph -p 8182:8182 -p 3000:3000 -e LICENSE=accept icr.io/obs/hdm/db2graph:latest-amd64
```

This container will once again prompt you to hit `Ctrl-P Ctrl-Q` once it has started, so you can exit.

### 4. Setup SSL

In order to secure our connections, and to make sure that we can connect to the backend from the web app frontend, we're going to apply TLS encryption to some of our services. Specifically, Db2 Graph and Movie API backend will be secured with TLS. To begin, you'll need an SSL certificate — you can generate one with a service like Let's Encrypt. If you do not have a domain name associated with the application, and would like a certificate for a bare IP, you can use a service like ZeroSSL.

Once you have generated the SSL certificate for your server/domain, download it in a format that gives you `.crt` certificate and `.key` private key files. In order to apply these files to Db2 Graph, we're going to store them in the directory on the host that we mounted inside the container as well. For example, if you're in the directory of files you've downloaded from ZeroSSL:

```bash
cp certificate.crt /root/db2graphstorage/ssl/cert.crt
cp private.key /root/db2graphstorage/ssl/server.key
```

Then, you need to tell Db2 Graph to apply the new certificate and restart it to have the changes take effect:

```bash
docker exec -it db2graph manage replaceTLSCert
docker exec -it db2graph manage restart
```

### 5. Build & run the Movie API (Backend) container

Instead of the frontend working with Db2 REST directly to get movie recommendations and movie information, it communicates with the Movie API, the backend of this application. It will then, in turn, deal with processes like searching through movies and handling Db2 REST jobs. Instead of having to build and deploy the API yourself, this repo ships with a Dockerfile that does it all for you. To build and run the container, simply run the following within the repo directory:

```bash
cd backend
docker build -t movieapi:latest .
```

After the container is done building, you can run it with the following command. It will:

- Create a new container called `moviebackend`.
- Mount `/root/db2graphstorage/ssl` (where we stored the certificate for Graph) on the host to `/movieapp_ssl` in the container.
- Expose the backend's port `443` to `443` on the host.
- Run the container in daemon mode (in the background).

```bash
docker run --name=moviebackend -v /root/db2graphstorage/ssl:/movieapp_ssl -p 443:443 -d movieapi:latest
```

### 6. Setup the database

In order for the backend to have content to serve and the frontend to have content to display, we need to setup the database that we've deployed, which consists of:

1. Creating the tables with the correct schema.
2. Loading the movie data (movies, genres, production companies) into the tables.
3. Creating & setting up a UDF (user-defined function) in Db2 that calls the Python code required to recommend movies based on historical interactions.

To begin the process, run the following commands from the repo directory:

```bash
cd setup/database

cat movie_rec.zip.* > movie_rec.zip
unzip movie_rec.zip

docker cp setup.sql movie_db2:/setup.sql
docker cp moviedata.zip movie_db2:/moviedata.zip
docker cp rec_udf.py movie_db2:/database/config/db2fenc1/rec_udf.py
docker cp movie_rec movie_db2:/database/config/db2fenc1/movie_rec
```

The above commands will copy an SQL setup script, the movie data, the recommender UDF Python script, and the movie recommender model itself, to the Db2 Community Edition Docker container that we deployed a little while ago. Then, run the following two commands:

```bash
docker exec movie_db2 unzip moviedata.zip
docker exec -it movie_db2 su - db2inst1 -c "db2 -tvf /setup.sql"
```

This will unzip the movie data and run the setup SQL script. The script will create the tables, load the data, and setup the UDF. However, before we're done setting everything up, we need to do a bit more ceremony for the UDF to execute properly:

```bash
docker exec -it movie_db2 yum install -y python3
docker exec -it movie_db2 su - db2fenc1 -c "python3 -m pip install -U --user pip"
docker exec -it movie_db2 su - db2fenc1 -c "python3 -m pip install turicreate"
docker exec movie_db2 chown db2fenc1 /database/config/db2fenc1/rec_udf.py
docker exec movie_db2 chown db2fenc1 /database/config/db2inst1/sqllib/adm/.fenced
docker exec -it movie_db2 su - db2inst1 -c "db2 update dbm cfg using python_path /usr/bin/python3"
docker exec -it movie_db2 su - db2inst1 -c "db2 terminate"
docker exec -it movie_db2 su - db2inst1 -c "db2stop"
docker exec -it movie_db2 su - db2inst1 -c "db2start"
```

This will install the required Python dependencies, make sure the files required to execute the UDF are owned by the right user, set the Python path so Db2 knows where to find the interpreter, and then restart Db2 by terminating connections, stopping the server, and starting it again.

### 7. Setup the REST services

The backend that we've deployed through a container will communicate with Db2 through Db2 REST, and will specifically make use of Db2 REST "services" that enable predefined queries to be run with new parameters. For example, this application has services to find movies by their ID and name, to find a movie's genres and production companies, and to recommend new movies based on past ratings from a user.

To setup the required services, run the following commands from the repo directory:

```bash
cd setup/rest
python3 setup_rest.py
```

The Python script will connect to Db2 REST, setup the metadata it requires within the database (for example, the tables that contain information on which services exist and the parameters they expect), and then actually create the services.

### 8. Setup Db2 Graph

Db2 Graph is able to automatically look at the schema of tables in your database and determine how to represent them as edges and vertices in a graph. You can setup Graph through a web UI or through the command line — in this example, we'll use the command line. We'll start off by opening a new session with the Graph server itself:

```
root@bluejay3:~/MovieRecommenderApplication/setup/rest# docker exec -it db2graph manage openSession
Enter sessionName [default: auto-generate a name]: setup_session
Db2GRAPH-1000I Session 'setup_session' opened.
```

Then, let's create a new connection from the Graph server to the Db2 server we've deployed:

```
root@bluejay3:~/MovieRecommenderApplication/setup/rest# docker exec -it db2graph manage addConnection
Enter sessionName: setup_session
Enter connectionName: MovieDB
Enter description: 
Enter hostname: 52.117.200.43
Use SSL [y/N (default)]: N
Enter port [50000]: 
Enter database: MOVIES
Enter username: db2inst1
Enter password: filmdb2pwd
Db2GRAPH-1000I Added connection 'MovieDB'.
```

We call the connection `MovieDB`, and make sure you replace information such as the hostname of the server according to where you deployed Db2. Now that the connection exists, we can open the connection so that we can setup the graph within the database:

```
root@bluejay3:~/MovieRecommenderApplication/setup/rest# docker exec -it db2graph manage openConnection
Enter sessionName: setup_session
Available connections:
  1 - MovieDB
  0 - quit
Select option [0 - 1]: 1
Enter username: db2inst1
Enter password: filmdb2pwd
Db2GRAPH-1000I Opened connection 'MovieDB'.
```

We can now add the graph itself:

```
root@bluejay3:~/MovieRecommenderApplication/setup/rest# docker exec -it db2graph manage addGraph
Enter sessionName: setup_session
Available connections:
  1 - MovieDB
  0 - quit
Select option [0 - 1]: 1
Enter name: movie
Enter schema: DB2INST1
Db2GRAPH-1132W The table or view DB2INST1.RATINGS was not automatically added because it does not have a primary key or foreign key relationship with an included table. You will need to manually create its vertex or edge table.
Db2GRAPH-1000I Added graph 'setup_session_MovieDB_movie'. Before the graph can be used in queries, it must be opened.
```

And we're done! Db2 Graph has gone through the tables we created, and realized that the `MOVIES`, `GENRES`, and `PRODUCTION_COMPANIES` tables each contain information on a specific piece of data (vertices), and the `MOVIE_GENRES` and `MOVIE_PRODUCTION_COMPANIES` tables contain the information on how to link each move to its genres and production companies (edges). `RATINGS` does not connect into this graph as it's only used for recommendation, and data does not persist in this table.

We can also close the session that we opened with the Graph server:

```
root@bluejay3:~/MovieRecommenderApplication/setup/rest# docker exec -it db2graph manage closeSession
Enter sessionName: setup_session
Db2GRAPH-1000I Closed connection 'MovieDB' for session 'setup_session'.
Db2GRAPH-1000I Closed session 'setup_session'.
```

### 9. Setup & run the frontend

You're about to be able to run the application! You simply need to configure the frontend to point to the right locations to find the Graph server, Movie API, and SSL certificates, and install the required dependencies.

Start by modifying the file at `frontend/MovieApp/.env`. It should contain the following:

```
HTTPS=true
REACT_APP_GRAPH_SERVER=<INSERT HOSTNAME>
REACT_APP_GRAPH_PORT=3000
REACT_APP_GRAPH_CONNECTION=MovieDB
REACT_APP_GRAPH_NAME=movie
SSL_CRT_FILE=/movieapp_ssl/cert.crt
SSL_KEY_FILE=/movieapp_ssl/server.key
```

If you followed the previous steps exactly, most of the defaults should be fine. The only value that you will need to change according to your setup is the server hostname for Db2 Graph. If you changed information like the name of the connection/graph or the port, you will need to change that here too.

You'll also need to modify `frontend/MovieApp/src/config.ts`. It should contain the following:

```js
export const IS_PROD = process.env.NODE_ENV === 'production';
export const BASE_HOST = '<BASE HOST>';
export const BASE_WEBSOCKET = `wss://${BASE_HOST}`;
export const MOVIE_WEBSOCKET = `${BASE_WEBSOCKET}/movie`;
export const BASE_URL = `https://${BASE_HOST}/`;
export const REGISTER_URL = `${BASE_URL}register`;
export const GENRES_URL = `${BASE_URL}genres`;
export const PRODUCTION_COMPANIES_URL = `${BASE_URL}productionCompanies`;
export const RECOMMENDATIONS_URL = `${BASE_URL}recommendations`;
export const LOCAL_STORAGE_KEY = 'db2movierecommender';
```

Here, you only need to change `BASE_HOST` to contain the hostname of the server where you've deployed the Movie API container from this repo.

You can now build the frontend docker container and run it:

```bash
cd frontend
docker build -t movieapp:latest .
docker run -v /root/db2graphstorage/ssl:/movieapp_ssl -p 3500:3500 -it movieapp:latest
```

If all goes well, you should be able to access the frontend through an HTTPS connection on port 3500.
