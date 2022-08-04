docker stop $(docker ps -a -q) && docker rm $(docker container ls -a -q)
docker-compose up --build