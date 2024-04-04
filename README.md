# Musica Application
## Introduction
<p align="justify">
As crafting music is an artistic endeavor demanding significant time and effort, singers must receive rewards. The Musica app offers a platform for singers to market their music. Within this platform, singers can share their music while listeners have the opportunity to hear each track once, offer feedback, and express their approval by liking it. However, to download or listen to the music multiple times, payment is required. In summary, this application offers these features:
</p>

- Create, remove, or modify a piece of music.
- Post, remove, or modify a comment.
- Express approval for music, or withdraw approval.
- Stream each musical piece once.
- Make a payment for downloading the music.
  
## How to run
Pre-requirements: 
- [Docker](https://www.docker.com/get-started/)
- [VS Code](https://code.visualstudio.com/)
  
To run the application, you should run the `dfx start --clean --host 127.0.0.1:8000` command on the terminal.
Next, open the terminal and launch docker desktop by running `systemctl --user start docker-desktop` command on the terminal.
Next, run shell files to deploy canisters step by step:

- `./deploy-local-ledger.sh` - Ledger canister
- `./deploy-local-icrc-ledger.sh` - ICRC2 ledger canister
- `./deploy-local-identity.sh` - Internet identity canister
- `dfx identity use default` - Change identity to default
- `./deploy-local-backend-canister.sh` - Backend canister
- `dfx deploy dfinity_js_frontend` - Frontend canister

## How to test
To test developed APIs, you can call APIs directly in the terminal or use Postman application on your desktop. You can find canister by running `caniser_urls.py` file.
- By the terminal (Communicate with your canister using any HTTP client library, for example using curl):
	- **GET request:** `curl http://[canisterId].localhost:8000/db`
	- **POST, PUT, and DELETE requests:** `curl -X POST -H "Content-Type: application/json" -d "{ \"hello\": \"world\" }" http://[canisterId].localhost:8000/db/update`

- By Postman:
  	- **GET request:**
  	  ![Screenshot from 2024-04-04 15-43-07](https://github.com/SaraBolouriB/Musica/assets/45979215/f8cc2ac0-3aa6-437b-8457-e52ff1ea4f50)
  	- **POST, PUT, DELETE requests:**
  	  ![Screenshot from 2024-04-04 15-49-02](https://github.com/SaraBolouriB/Musica/assets/45979215/36108040-7b70-4e84-8158-aa51831e1e41)



