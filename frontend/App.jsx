import React, { useState } from "react"
import Layout from "./components/Layout.jsx"

const App = () => {
    const [path, setPath] = useState("Home")

    return (
        <>
            <Layout setPath={setPath} path={path} />
        </>
    )
}

export default App
