import React, { useState } from "react"
import Layout from "./components/Layout.jsx"

const App = () => {
    const [path, setPath] = useState("Guide")

    return (
        <>
            <Layout path={path} />
        </>
    )
}

export default App
