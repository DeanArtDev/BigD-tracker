export

restart:
	sudo docker compose -f docker-compose.yml pull
	sudo docker compose -f docker-compose.yml down
	sudo docker compose -f docker-compose.yml up -d
