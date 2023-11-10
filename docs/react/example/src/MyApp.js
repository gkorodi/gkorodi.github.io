import { useState } from "react";
import "./app_ttt.css"

function TicTacToe() {
    return <>Tic Tac Toe</>;
}

function Square(props) {
    return <button className='ttt-square' onClick={props.onclick}>{props.value}</button>
}



function Board() {
    var initArray = Array(9).fill(' ');
    initArray[0] = 'X';
    const [squareArr, setSquarres] = useState(initArray);

    function handleSquare() {

    }

    function Squares() {
        var squares = []
        for (let i = 0; i < 9; i++) {
            squares.push(<Square key={i} value={i}
                onclick={() => alert(i)} />)
        }
        return <div className='ttt-board'>{squares}</div>
    }
    return <div id='game'><Squares /></div>;
}

export function MyApp() {
    return <>Version 1<br /><Board /></>
}