import { useState } from "react";

function StateForm() {
    const [currState, setCurrState] = useState('')'

    var s = ["Mass", "Conn"]
    const [states, setStates] = useState(s);

    function handleNewState(e) {
        e.preventDefault();
        setStates((st) => [...st, currState]);
        setCurrState('');
        alert(currState);
    }

    return (
        <>
            <form>
                Add a state you have visited:
                <input type='text' name="newState" value={currState}>

                </input>
                <button onClick={(e) => { handleNewState(e) }}>Add State</button>
            </form>

            <ul class="states">
                {states.map((st, i) => <li key={i}>{st}</li>)}
            </ul>
        </>
    );
}

export function MyApp() {
    return <StateForm />;
}