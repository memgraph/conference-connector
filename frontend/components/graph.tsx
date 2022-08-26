import { useEffect } from "react"


export default function Graph() {


    useEffect(() => {
        fetch('http://localhost:8000/graph')
            .then((response) => response.json())
            .then((data) => console.log(data));
    }, []);


    return (
        <div id="graph">Hi graph!</div>
    )

}
