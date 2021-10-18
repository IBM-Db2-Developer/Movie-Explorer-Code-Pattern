import requests
import json

services = [
    {
      "isQuery": True,
      "parameters": [
        {
          "datatype": "int",
          "name": "@movieId"
        }
      ],
      "serviceDescription": "Get a movie by identifier",
      "serviceName": "GetMovieByID",
      "sqlStatement": "SELECT * FROM MOVIES WHERE MOVIEID = @movieId",
      "version": "1.0"
    },
    {
      "isQuery": True,
      "parameters": [
        {
          "datatype": "varchar(255)",
          "name": "@title"
        }
      ],
      "serviceDescription": "Get a movie by name",
      "serviceName": "GetMoviesByName",
      "sqlStatement": "SELECT * FROM MOVIES WHERE LOWER(TITLE) LIKE CONCAT('%', CONCAT(LOWER(@title), '%')) ORDER BY TITLE ASC",
      "version": "1.0"
    },
    {
      "isQuery": True,
      "parameters": [
        {
          "datatype": "int",
          "name": "@movieId"
        }
      ],
      "serviceDescription": "Get a movie's genres",
      "serviceName": "GetMovieGenres",
      "sqlStatement": "SELECT GENRES.NAME FROM MOVIE_GENRES INNER JOIN GENRES ON GENRES.GENREID=MOVIE_GENRES.GENREID WHERE MOVIE_GENRES.MOVIEID=@movieId ORDER BY GENRES.NAME ASC",
      "version": "1.0"
    },
    {
      "isQuery": True,
      "parameters": [
        {
          "datatype": "int",
          "name": "@movieId"
        }
      ],
      "serviceDescription": "Get a movie's production companies",
      "serviceName": "GetMovieProductionCompanies",
      "sqlStatement": "SELECT PRODUCTION_COMPANIES.NAME FROM MOVIE_PRODUCTION_COMPANIES INNER JOIN PRODUCTION_COMPANIES ON PRODUCTION_COMPANIES.COMPANYID=MOVIE_PRODUCTION_COMPANIES.COMPANYID WHERE MOVIE_PRODUCTION_COMPANIES.MOVIEID=@movieId ORDER BY PRODUCTION_COMPANIES.NAME ASC",
      "version": "1.0"
    },
    {
      "isQuery": True,
      "parameters": [
        {
          "datatype": "int",
          "name": "@queryId"
        }
      ],
      "serviceDescription": "Get movie recommendations",
      "serviceName": "GetMovieRecommendations",
      "sqlStatement": "SELECT F.MOVIEID FROM RATINGS R, (SELECT COUNT(*) AS RCOUNT FROM RATINGS WHERE QUERYID=@queryId) C, TABLE(MOVIEREC(R.MOVIEID, R.RATING, C.RCOUNT)) F WHERE R.QUERYID=@queryId",
      "version": "1.0"
    }
]

def authenticate(rest, body):
    url = f"{rest}/v1/auth"
    response = requests.post(url, json=body, headers={"Content-Type": "application/json"})
    resp = json.loads(response.text)
    print(resp)
    return resp["token"]

def setup(rest, token):
    url = f"{rest}/v1/metadata/setup"
    response = requests.post(url, headers={"authorization": token})
    return response.status_code == 201

def create_service(rest, token, service):
    url = f"{rest}/v1/services"
    response = requests.post(url, json=service, headers={"Content-Type": "application/json", "authorization": token})
    if response.status_code == 201:
        return
    return json.loads(response.text)

if __name__ == "__main__":
    auth_body = {
      "dbParms": {
        "dbHost": "host.docker.internal",
        "dbName": "movies",
        "dbPort": 50000,
        "isSSLConnection": False,
        "password": "filmdb2pwd",
        "username": "db2inst1"
      },
      "expiryTime": "24h"
    }

    rest_endpoint = "http://host.docker.internal:50050"

    token = authenticate(rest_endpoint, auth_body)

    if not setup(rest_endpoint, token):
        print("Could not setup metadata")

    for service in services:
        resp = create_service(rest_endpoint, token, service)
        if resp is not None:
            print(service)
            print("Could not create service")
            print(resp)
            print("")
