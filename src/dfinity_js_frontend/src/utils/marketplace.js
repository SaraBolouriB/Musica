import { approve } from "./icrc2_ledger";
import { createCanisterActor } from "./canisterFactory";
import { idlFactory as marketPlaceIDL } from "../../../declarations/dfinity_js_backend/dfinity_js_backend.did.js";
import IcHttp from "./ichttp";

// Create a CanisterActor for the marketplace agent
const marketplaceAgentCanister = createCanisterActor(process.env.BACKEND_CANISTER_ID, marketPlaceIDL);
const httpClient = new IcHttp(marketplaceAgentCanister);

// Function to create a product
export async function createProduct(data) {
  try {
    return await httpClient.POST({ path: "/addmusic", data });
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Unable to create product");
  }
}

// Function to get address from principal
export async function getAddressFromPrincipal(principalHex) {
  try {
    return await httpClient.GET({ path: `/principal-to-address/${principalHex}` });
  } catch (error) {
    console.error("Error getting address from principal:", error);
    throw new Error("Unable to get address from principal");
  }
}

// Function to get products
export async function getProducts() {
  try {
    return await httpClient.GET({ path: "/musics" });
  } catch (error) {
    console.error("Error getting products:", error);
    throw new Error("Unable to get products");
  }
}

// Function to buy a product
export async function buyProduct(product) {
  try {
    const { id, price } = { ...product };
    await approve(process.env.BACKEND_CANISTER_ID, price);
    return await httpClient.POST({ path: "/download", data: { productId: id } });
  } catch (error) {
    console.error("Error buying product:", error);
    throw new Error("Unable to buy product");
  }
}
