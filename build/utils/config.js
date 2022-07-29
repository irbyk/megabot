import { readFile } from "fs/promises";
export async function loadConfig() {
    const file = await readFile("config/config.json");
    const config = JSON.parse(file.toString());
    return config;
}
export async function loadKey() {
    const file = await readFile("config/keys.json");
    const key = JSON.parse(file.toString());
    return key;
}
export async function loadConfigPlex() {
    const file = await readFile("config/plex.json");
    const configPlex = JSON.parse(file.toString());
    return configPlex;
}
//# sourceMappingURL=config.js.map