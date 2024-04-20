import { approve } from "./icrc2_ledger";
import { createCanisterActor } from "./canisterFactory";
import { idlFactory as marketPlaceIDL } from "../../../declarations/dfinity_js_backend/dfinity_js_backend.did.js";
import IcHttp from "./ichttp";

const marketplaceAgentCanister = await createCanisterActor(process.env.BACKEND_CANISTER_ID, marketPlaceIDL);
const httpClient = new IcHttp(marketplaceAgentCanister);

// MUSIC APIs
export async function getMusics() {
  return httpClient.GET({path: "/musics"});
}

export async function createMusic(data) {
  return httpClient.POST({path: "/addmusic", data});
}

export async function modifyMusic(id, data) {
  return httpClient.PUT({path: `/editmusic/${id}`, data});
}

export async function deleteMusic(id) {
  return httpClient.DELETE({path: `/removemusic/${id}`});
}

// COMMENT APIs
export async function getComments(id) {
  return httpClient.GET({path: `/comments/${id}`});
}

export async function createComment(id, data) {
  return httpClient.POST({path: `/addcomment/${id}`, data});
}

export async function modifyComment(id, data) {
  return httpClient.PUT({path: `/editcomment/${id}`, data});
}

export async function deleteComment(id) {
  return httpClient.DELETE({path: `/removecomment/${id}`});
}

// OTHER APIs
export async function getAddressFromPrincipal(principalHex) {
  return httpClient.GET({path: `/principal-to-address/${principalHex}`});
}

export async function like(id) {
  return httpClient.PUT({path: `/likeMusic/${id}`});
}

export async function unlike(id) {
  return httpClient.PUT({path: `/unlikeMusic/${id}`});
}

export async function downloadMusic(id, price) {
  await approve(process.env.BACKEND_CANISTER_ID, price);
  return await httpClient.POST({path: "/download", data: {musicId: id}});
}

export async function play(id) {
  return httpClient.PUT({path: `/playmusic/${id}`});
}