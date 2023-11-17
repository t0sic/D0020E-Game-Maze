import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
    entry: "./frontend/index.js",
    watch: true,
    mode: "development",
    devtool: "eval-source-map",
    output: {
        path: path.resolve(__dirname, "public"),
        filename: "index.js"
    }
}