import { Server, StableBTreeMap, ic, serialize, Principal, Result, blob } from 'azle';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';
import { hexAddressFromPrincipal } from "azle/canisters/ledger";
import multer from 'multer';

class Music {
    id: string;
    owner: string;
    soldNumber: number;
    likeNumber: number;
    likes : string[];
    comments: string[];
    whoslisten: string[];
    audio: blob;
    name: string;
    description: string;
    price: number;
}

class MusicPayload {
    audio: blob;
    name: string;
    description: string;
    price: number;
}

class Comment {
    id: string;
    description: string;
    owner: string;
    musicID: string;
}

class Order {
    musictId: string;
    musicOwner: string;
    price: number;
    status: OrderStatus;
}

enum OrderStatus {
    PaymentPending,
    Completed
}

const musicStorage = StableBTreeMap<string, Music>(0);
const commentStorage = StableBTreeMap<string, Comment>(1);
const orderStorage = StableBTreeMap<string, Order>(2);

const ICRC_CANISTER_PRINCIPAL = "mxzaz-hqaaa-aaaar-qaada-cai";

export default Server(() => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Retrieve all musics
    app.get("/musics", (req, res) => {
        res.json(musicStorage.values());
    });

    // Retrieve music with a specific ID
    app.get("/music/:id", (req, res) => {
        const musicID = req.params.id;
        const musicOpt = musicStorage.get(musicID);

        if ('None' in musicOpt) {
            res.status(404).send(`The music with id ${musicID} not found.`);
        } else {
            res.json(musicOpt.Some);
        }
    });
    
    // Add new music to Musica application
    app.post('/addmusic', async (req, res) => {
        const payload = req.body as MusicPayload;
        const music = {
            id: uuidv4(), 
            owner: ic.caller().toText(),
            soldNumber: 0,
            likeNumber: 0,
            likes: [],
            comments: [],
            whoslisten: [],
            ...payload
        };
        musicStorage.insert(music.id, music);
        return res.json(music);
    });

    // Delete the music
    app.delete('/removemusic/:id', (req, res) => {
        const musicID = req.params.id;
        const musicOpt = musicStorage.get(musicID);

        if('None' in musicOpt) {
            res.status(404).send(`This music with id ${musicID} not found.`);
        } else {
            musicStorage.remove(musicID);
            return res.json(musicOpt.Some);
        }
    });

    // Modify the music
    app.put('/editmusic/:id', (req, res) => {
        const musicID = req.params.id;
        const musicOpt = musicStorage.get(musicID);

        if('None' in musicOpt) {
            res.status(404).send(`This music with id ${musicID} not found.`);
        } else {
            const music = musicOpt.Some;
            const editedMusic = req.body;

            const updatedMusic = {
                ...music,
                ...editedMusic
            }

            musicStorage.insert(music.id, updatedMusic);
            return res.json(updatedMusic);
        }
    });

    // Retrieve all comments of a specific music
    app.get("/comments/:id", (req, res) => {
        const musicID = req.params.id;
        const musicOpt = musicStorage.get(musicID);

        if('None' in musicOpt) {
            res.status(404).send(`This music with id ${musicID} not found.`);
        } else {
            const commentsID = musicOpt.Some.comments;
            let comments = [];
            for (var i = 0; i < commentsID.length; i++) {
                const comment = commentStorage.get(commentsID[i]);
                if (comment.Some) {
                    comments.push(comment.Some);
                }
            }
            return res.json(comments);
        }
    });

    // Add new a comment
    app.post("/addcomment/:id", (req, res) => {
        const musicID = req.params.id;
        const musicOpt = musicStorage.get(musicID);

        if ('None' in musicOpt) {
            res.status(404).send(`The music with id ${musicID} not found.`);
        } else {
            const payload = req.body;
            const music = musicOpt.Some;

            const comment = {
                id: uuidv4(), 
                description: payload.description, 
                owner: ic.caller().toText(),
                musicID: musicID
            }
            music.comments.push(comment.id); //Add new comment to this music's comments list

            const updatedMusic = { 
                ...music, 
                comments: music.comments
            }

            musicStorage.insert(musicID, updatedMusic);
            commentStorage.insert(comment.id, comment);

            return res.json(comment);
        }
    });

    // Delete a comment
    app.delete("/removecomment/:id", (req, res) => {
        const commentID = req.params.id;
        const commentOpt = commentStorage.get(commentID);

        if ('None' in commentOpt) {
            res.status(404).send(`The comment with id ${commentID} not found.`);
        } else {
            const comment = commentOpt.Some;
            const musicOpt = musicStorage.get(comment.musicID);

            if ('None' in musicOpt) {
                res.status(404).send(`The music with id ${comment.musicID} not found.`);
            } else {
                const music = musicOpt.Some;
                
                const index = music.comments.indexOf(commentID);
                music.comments.splice(index, 1);

                const updatedMusic = {
                    ...music,
                    comments: music.comments,
                }

                musicStorage.insert(music.id, updatedMusic);
                commentStorage.remove(commentID);

                return res.json(comment);
            }

        }
    }); 

    // Modify a comment
    app.put("/editcomment/:id", (req, res) => {
        const commentID = req.params.id;
        const commentOpt = commentStorage.get(commentID);

        if ('None' in commentOpt) {
            res.status(404).send(`The comment with id ${commentID} not found.`);
        } else {
            const comment = commentOpt.Some;
            const editedContent = req.body;

            const updatedComment = {
                ...comment,
                description: editedContent.description
            }

            commentStorage.insert(commentID, updatedComment);
            return res.json(updatedComment);
        }
    });

    // Like a music
    app.put("/likeMusic/:id", (req, res) => {
        const musicID = req.params.id;
        const musicOpt = musicStorage.get(musicID);

        if ('None' in musicOpt) {
            res.status(404).send(`The music with id ${musicID} not found.`);
        } else {
            const music = musicOpt.Some;
            const ownerID = ic.caller().toString(); 

            let findLike = music.likes.find((id) => id === ownerID);
            if (findLike !== undefined) {
                res.status(400).send(`You have like this music before.`);
                return;
            }

            music.likes.push(ownerID);
            const updatedMusic = { 
                ...music, 
                likeNumber: music.likeNumber + 1, 
                likes: music.likes
            };
            musicStorage.insert(musicID, updatedMusic);

            return res.json(updatedMusic);
        }
    });

    // Unlike a music
    app.put("/unlikeMusic/:id", (req, res) => {
        const musicID = req.params.id;
        const musicOpt = musicStorage.get(musicID);

        if ('None' in musicOpt) {
            res.status(404).send(`The music with id ${musicID} not found.`);
        } else {
            const music = musicOpt.Some;
            const ownerID = ic.caller().toString(); 

            let findLike = music.likes.find((id) => id === ownerID);
            if (findLike === undefined) {
                res.status(400).send(`The like does not exist.`);
                return;
            } 
            
            const index = music.likes.indexOf(ownerID);
            music.likes.splice(index, 1);

            const updatedMusic = { 
                ...music, 
                likeNumber: music.likeNumber - 1,
                likes: music.likes
            };
            musicStorage.insert(musicID, updatedMusic);
            return res.json(updatedMusic);
        }
    });

    // Return the number of likes of a music
    app.get("/likes/:id", (req, res) => {
        const musicID = req.params.id;
        const musicOpt = musicStorage.get(musicID);

        if ('None' in musicOpt) {
            res.status(404).send(`The music with id ${musicID} not found.`);
        } else {
            const numLikes = musicOpt.Some.likeNumber;
            res.json(numLikes);
        }
    });

    // Play a music
    app.put("/playmusic/:id", (req, res) => {
        const musicID = req.params.id;
        const musicOpt = musicStorage.get(musicID);

        if ('None' in musicOpt) {
            res.status(404).send(`The music with id ${musicID} not found.`);
        } else {
            const music = musicOpt.Some;
            const ownerID = ic.caller().toString();

            const findListener = music.whoslisten.find((listener) => listener === ownerID);

            if (findListener !== undefined) {
                res.status(400).send(`You can not listen to music again. Please download it.`);
                return;
            }

            music.whoslisten.push(ownerID);
            const updatedMusic = {
                ...music,
                whoslisten: music.whoslisten
            }
            musicStorage.insert(musicID, updatedMusic);

            return res.json(music.audio);

        }
    });

    // Download a music
    app.post("/download", async(req, res) => {
        const musicOpt = musicStorage.get(req.body.musicId);

        if ('None' in musicOpt) {
            res.status(404).send(`The music with id ${req.body.musicId} not found.`);
            return;
        } else {
            const music = musicOpt.Some;
            const allowanceResponse = await allowanceTransfer(music.owner, BigInt(music.price));

            if (allowanceResponse.Err) {
                res.send(allowanceResponse.Err);
                return;
            } else {
                const order = {
                    musictId: music.id,
                    musicOwner: music.owner,
                    price: music.price,
                    status: OrderStatus.Completed
                }

                orderStorage.insert(uuidv4(), order);
                music.soldNumber += 1;
                musicStorage.insert(music.id, music);
                res.send(music.audio);
            }

        }
    });
    
    app.get("/principal-to-address/:principalHex", (req, res) => {
        const principal = Principal.fromText(req.params.principalHex);
        res.json({ account: hexAddressFromPrincipal(principal, 0) });
    });
    
    app.use(express.static('/dist'));

    return app.listen();
});

async function allowanceTransfer(to: string, amount: bigint): Promise<Result<any, string>> {
    try {
        const response = await fetch(`icp://${ICRC_CANISTER_PRINCIPAL}/icrc2_transfer_from`, {
            body: serialize({
                candidPath: "/src/icrc1_ledger_canister.did",
                args: [{
                    // for optional values use an empty array notation [] instead of None is they should remain empty
                    spender_subaccount: [],
                    created_at_time: [],
                    memo: [],
                    amount,
                    fee: [],
                    from: { owner: ic.caller(), subaccount: [] },
                    to: { owner: Principal.fromText(to), subaccount: [] }
                }]
            })
        });
        return Result.Ok(response);
    } catch (err) {
        let errorMessage = `an error occurred on approval`;
        if (err instanceof Error) {
            errorMessage = err.message;
        }
        return Result.Err(errorMessage);
    }
}
