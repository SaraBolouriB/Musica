// import { v4 as uuidv4 } from 'uuid';
// import { Server, StableBTreeMap, ic, Principal, serialize, Result } from 'azle';
// import express from 'express';
// import cors from 'cors';
// import { hexAddressFromPrincipal } from "azle/canisters/ledger";

// /**
//  * This type represents a product that can be listed on a marketplace.
//  * It contains basic properties that are needed to define a product.
//  */
// class Product {
//     id: string;
//     title: string;
//     description: string;
//     location: string;
//     price: number;
//     seller: string;
//     attachmentURL: string;
//     soldAmount: number
// }

// class ProductPayload {
//     title: string;
//     description: string;
//     location: string;
//     price: number;
//     attachmentURL: string
// }

// enum OrderStatus {
//     PaymentPending,
//     Completed
// }

// class Order {
//     productId: string;
//     price: number;
//     status: string;
//     seller: string;
// }

// /**
//  * `productsStorage` - it's a key-value data structure that is used to store products.
//  * {@link StableBTreeMap} is a self-balancing tree that acts as durable data storage that keeps data across canister upgrades.
//  * For the sake of this contract we've chosen {@link StableBTreeMap} as a storage for the next reasons:
//  * - `insert`, `get` and `remove` operations have a constant time complexity - O(1)
//  * - data stored in the map survives canister upgrades unlike using HashMap where data is stored in a heap and it's lost after the canister is upgraded
//  * 
//  * Breakdown of the `StableBTreeMap(string, Message)` datastructure:
//  * - the key of the map is a `messageId`
//  * - the value in this map is a message itself `Message` that is related to a given key (`messageId`)
//  * 
//  * Constructor values:
//  * 1) 0 - memory id where to initialize a map.
//  */
// const productsStorage = StableBTreeMap<string, Product>(0);
// const orders = StableBTreeMap<string, Order>(1);

// /* 
//     initialization of the ICRC Ledger canister. The principal text value is hardcoded because 
//     we set it in the `dfx.json`
// */
// const ICRC_CANISTER_PRINCIPAL = "mxzaz-hqaaa-aaaar-qaada-cai";

// export default Server(() => {
//     const app = express();
//     // only for development purposes. For production-ready apps, one must configure CORS appropriately
//     app.use(cors());
//     app.use(express.json());

//     app.get("/products", (req, res) => {
//         res.json(productsStorage.values());
//     });

//     app.get("/orders", (req, res) => {
//         res.json(orders.values());
//     });

//     app.get("/products/:id", (req, res) => {
//         const productId = req.params.id;
//         const productOpt = productsStorage.get(productId);
//         if ("None" in productOpt) {
//             res.status(404).send(`the product with id=${productId} not found`);
//         } else {
//             res.json(productOpt.Some);
//         }
//     });

//     app.post("/products", (req, res) => {
//         const payload = req.body as ProductPayload;
//         const product = { id: uuidv4(), soldAmount: 0, seller: ic.caller().toText(), ...payload };
//         productsStorage.insert(product.id, product);
//         return res.json(product);
//     });

//     app.put("/products/:id", (req, res) => {
//         const productId = req.params.id;
//         const payload = req.body as ProductPayload;
//         const productOpt = productsStorage.get(productId);
//         if ("None" in productOpt) {
//             res.status(400).send(`couldn't update a product with id=${productId}. product not found`);
//         } else {
//             const product = productOpt.Some;
//             const updatedProduct = { ...product, ...payload, updatedAt: getCurrentDate() };
//             productsStorage.insert(product.id, updatedProduct);
//             res.json(updatedProduct);
//         }
//     });

//     app.delete("/products/:id", (req, res) => {
//         const productId = req.params.id;
//         const deletedProductOpt = productsStorage.remove(productId);
//         if ("None" in deletedProductOpt) {
//             res.status(400).send(`couldn't delete a product with id=${productId}. product not found`);
//         } else {
//             res.json(deletedProductOpt.Some);
//         }
//     });

//     /*
//         Before the order is received, the icrc2_approve is called - that's where we create
//         an allowance entry for the canister to make a transfer of an ICRC token on behalf of the sender to the seller of the product.
//         Here, we make an allowance transfer by calling icrc2_transfer_from.
//     */
//     app.post("/orders", async (req, res) => {
//         const productOpt = productsStorage.get(req.body.productId);
//         if ("None" in productOpt) {
//             res.send(`cannot create the order: product=${req.body.productId} not found`);
//         } else {
//             const product = productOpt.Some;
//             const allowanceResponse = await allowanceTransfer(product.seller, BigInt(product.price));
//             if (allowanceResponse.Err) {
//                 res.send(allowanceResponse.Err);
//                 return;
//             }
//             const order: Order = {
//                 productId: product.id,
//                 price: product.price,
//                 status: OrderStatus[OrderStatus.Completed],
//                 seller: product.seller
//             };
//             orders.insert(uuidv4(), order);
//             product.soldAmount += 1;
//             productsStorage.insert(product.id, product);
//             res.json(order);
//         }
//     });

//     /*
//         a helper function to get the address from the principal
//         the address is later used in the transfer method
//     */
//     app.get("/principal-to-address/:principalHex", (req, res) => {
//         const principal = Principal.fromText(req.params.principalHex);
//         res.json({ account: hexAddressFromPrincipal(principal, 0) });
//     });

//     return app.listen();
// });

// function getCurrentDate() {
//     const timestamp = new Number(ic.time());
//     return new Date(timestamp.valueOf() / 1000_000);
// }

// async function allowanceTransfer(to: string, amount: bigint): Promise<Result<any, string>> {
//     try {
//         const response = await fetch(`icp://${ICRC_CANISTER_PRINCIPAL}/icrc2_transfer_from`, {
//             body: serialize({
//                 candidPath: "/src/icrc1_ledger_canister.did",
//                 args: [{
//                     // for optional values use an empty array notation [] instead of None is they should remain empty
//                     spender_subaccount: [],
//                     created_at_time: [],
//                     memo: [],
//                     amount,
//                     fee: [],
//                     from: { owner: ic.caller(), subaccount: [] },
//                     to: { owner: Principal.fromText(to), subaccount: [] }
//                 }]
//             })
//         });
//         return Result.Ok(response);
//     } catch (err) {
//         let errorMessage = "an error occurred on approval";
//         if (err instanceof Error) {
//             errorMessage = err.message;
//         }
//         return Result.Err(errorMessage);
//     }
// }

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

    // Edit a comment
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
    
    const upload = multer({ dest: 'uploads/' });

    app.post("/upload-audio", upload.single('audio'), (req, res) => {
        try{
            const audioFile = req.file;
            if(!audioFile) {
                return res.status(400).json({ error: 'No audio file uploaded' });
            }
            return res.status(200).json({ message: 'Audio file uploaded successfully' });
        } catch (error) {
            console.error('Error uploading file:', error);
            return res.status(500).json({ error: 'Internal server error' });
        } 

    })

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
