/** @jsxImportSource xpreact */
import { render } from 'xpreact';
import { useState } from 'xpreact/hooks';

const arr = [1, 2, 3, 4, 5];

function Mapp() {
	const [suffer, setSuffer] = useState(arr);

	return (
		<>
			<ul>
				{suffer.map(item => (<li>{item} 2st</li>))}
			</ul>
			<button onClick={() => setSuffer([4, 5, 3, 2, 1])}>Shffer</button>
		</>
	)
}
function Test({ a }) {
	let [countx, setCountx] = useState(1);

	return (
		<div>
			{a}
			{countx % 2 ? 'a' : 'b'}
			Testxxx_child {countx}
			<button onClick={() => {
				let c = countx + 1;
				setCountx(c)
			}}>
				Count_child
			</button>
		</div>
	)
}

export default function App() {
	const [count, setCount] = useState(10);
	const [count2, setCount2] = useState(2);

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
				Plus {" "} {count2}
			</button>
			<Test a={count} />
			<Mapp />
		</div>
	)
}

render(<App />, document.getElementById('app'))
