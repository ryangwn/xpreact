/** @jsxImportSource xpreact */
import { render } from "xpreact";
import { useState } from "xpreact/hooks";
// import { state } from 'xpreact/runes';

const a = ['A', 'B', 'C', 'D', 'E', 'F'];

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return [...array];
}

function Mapp() {
  const [suffer, setSuffer] = useState(a);

  return (
    <>
      <ul>
        {suffer.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button onClick={() => setSuffer(shuffle(['E', 'A', 'B', 'F', 'C', 'D']))}>Shffer</button>
    </>
  );
}
function Test({ a }) {
  let [countx, setCountx] = useState(1);
  // let counta = state({ a: 0 });

  return (
    <div>
      {a}
      {countx % 2 ? "a" : "b"}
      Testxxx_child {countx}
      <button
        onClick={() => {
          let c = countx + 1;
          // counta = 2;
          setCountx(c);
        }}
      >
        Count_child
      </button>
    </div>
  );
}

export default function App() {
  const [count, setCount] = useState(10);
  const [count2, setCount2] = useState(2);
  const a = 2;

  return (
    <div style="background: #a2a2a2">
      {count}
      <button
        onClick={() => {
          let c = count + 1;
          setCount(c);
          setCount2(c);
        }}
      >
        Plus {count2}
      </button>
      <Test a={count} />
      <Mapp a={a} />
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
      </svg>
    </div>
  );
}

render(<App />, document.getElementById("app"));
