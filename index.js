const makeNullMatrix = (width, height) => {
	const matrix = [];
	for (let x = 0; x < width; x++) {
		matrix[x] = [];
		for (let y = 0; y < height; y++)
			matrix[x][y] = null;
	}
	return matrix;
}

const matrix = makeNullMatrix(4, 4);
const gameSize = 4;
let lost = false;
let score = 0;

const numberColors = {
	2: '#e2d9d1',
	4: '#deaa77',
	8: '#dab38d',
	16: '#ca9159'
}

const render = () => {
	document.getElementById('score').innerHTML = score;
	document.getElementById('high-score').innerHTML = localStorage.getItem('high-score');
	for (let x = 0; x < gameSize; x++)
		for (let y = 0; y < gameSize; y++) {
			let element = document.querySelectorAll("td")[x + y * gameSize];
			element.innerHTML = matrix[x][y];
			element.style.backgroundColor = matrix[x][y] ? numberColors[matrix[x][y]] : '';
		}
}

const haveEmptySpots = () => {
	for (let x = 0; x < gameSize; x++)
		for (let y = 0; y < gameSize; y++)
			if (!matrix[x][y])
				return true;
	return false;
}

const insert = () => {
	const tryInsert = () => {
		const x = Math.floor(Math.random() * gameSize);
		const y = Math.floor(Math.random() * gameSize);
		if (matrix[x][y])
			return false;
		matrix[x][y] = 2;
		return true;
	}
	while (!tryInsert()){};
}

const fall = (direction, coordinate) => {
	const fall = {
		'right': fallRight,
		'down': fallDown,
		'left': fallLeft,
		'up': fallUp
	};

	return fall[direction](coordinate);
}

const fallRight = y => {
	let fell = false;
	while (true) {
		let found = false;
		for (let x = gameSize - 1; x > 0; x--) {
			if (!matrix[x][y] && matrix[x - 1][y]) {
				matrix[x][y] = matrix[x - 1][y];
				matrix[x - 1][y] = null;
				found = true;
				fell = true;
			}
		}
		if (!found)
			break;
	}
	return fell;
}

const fallDown = x => {
	let fell = false;
	while (true) {
		let found = false;
		for (let y = gameSize - 1; y > 0; y--) {
			if (!matrix[x][y] && matrix[x][y - 1]) {
				matrix[x][y] = matrix[x][y - 1];
				matrix[x][y - 1] = null;
				found = true;
				fell = true;
			}
		}
		if (!found)
			break;
	}
	return fell;
}

const fallLeft = y => {
	let fell = false;
	while (true) {
		let found = false;
		for (let x = 0; x < gameSize - 1; x++) {
			if (!matrix[x][y] && matrix[x + 1][y]) {
				matrix[x][y] = matrix[x + 1][y];
				matrix[x + 1][y] = null;
				found = true;
				fell = true;
			}
		}
		if (!found)
			break;
	}
	return fell;
}

const fallUp = x => {
	let fell = false;
	while (true) {
		let found = false;
		for (let y = 0; y < gameSize - 1; y++) {
			if (!matrix[x][y] && matrix[x][y + 1]) {
				matrix[x][y] = matrix[x][y + 1];
				matrix[x][y + 1] = null;
				found = true;
				fell = true;
			}
		}
		if (!found)
			break;
	}
	return fell;
}

const merge = (direction, coordinate) => {
	const merge = {
		'right': mergeRight,
		'down': mergeDown,
		'left': mergeLeft,
		'up': mergeUp
	};

	return merge[direction](coordinate);
}

const mergeRight = y => {
	let merged = false;
	for (let x = gameSize - 1; x > 0; x--) {
		if (matrix[x][y] && matrix[x][y] == matrix[x - 1][y]) {
			matrix[x][y] *= 2;
			score += matrix[x][y];
			if (!localStorage.getItem('high-score') || localStorage.getItem('high-score') < score)
				localStorage.setItem('high-score', score);
			matrix[x - 1][y] = null;
			merged = true;
		}
	}
	return merged;
}

const mergeDown = x => {
	let merged = false;
	for (let y = gameSize - 1; y > 0; y--) {
		if (matrix[x][y] && matrix[x][y] == matrix[x][y - 1]) {
			matrix[x][y] *= 2;
			score += matrix[x][y];
			if (!localStorage.getItem('high-score') || localStorage.getItem('high-score') < score)
				localStorage.setItem('high-score', score);
			matrix[x][y - 1] = null;
			merged = true;
		}
	}
	return merged;
}

const mergeLeft = y => {
	let merged = false;
	for (let x = 0; x < gameSize - 1; x++) {
		if (matrix[x][y] && matrix[x][y] == matrix[x + 1][y]) {
			matrix[x][y] *= 2;
			score += matrix[x][y];
			if (!localStorage.getItem('high-score') || localStorage.getItem('high-score') < score)
				localStorage.setItem('high-score', score);
			matrix[x + 1][y] = null;
			merged = true;
		}
	}
	return merged;
}

const mergeUp = x => {
	let merged = false;
	for (let y = 0; y < gameSize - 1; y++) {
		if (matrix[x][y] && matrix[x][y] == matrix[x][y + 1]) {
			matrix[x][y] *= 2;
			score += matrix[x][y];
			if (!localStorage.getItem('high-score') || localStorage.getItem('high-score') < score)
				localStorage.setItem('high-score', score);
			matrix[x][y + 1] = null;
			merged = true;
		}
	}
	return merged;
}


const move = direction => {
	const iterate = (direction, callback) => {
		const arrayRight = Array.from({length: gameSize}, (v, k) => k);
		const arrayDirectionMap = {
			'right': arrayRight,
			'down': arrayRight,
			'left': arrayRight.reverse(),
			'up': arrayRight.reverse()
		};
		arrayDirectionMap[direction].map(callback);
	}

	let moved = false;
	iterate(direction, line => {
		moved = fall(direction, line) || moved;
		let merged = merge(direction, line);
		if (merged)
			fall(direction, line);
		moved = merged || moved;
	});
	return moved;
}

const canMerge = () => {
	for (let x = 0; x < gameSize; x++) {
		for (let y = 0; y < gameSize; y++) {
			if (x > 0 && matrix[x][y] == matrix[x - 1][y])
				return true;
			if (y > 0 && matrix[x][y] == matrix[x][y - 1])
				return true;
			if (x < gameSize - 1 && matrix[x][y] == matrix[x + 1][y])
				return true;
			if (y < gameSize - 1 && matrix[x][y] == matrix[x][y + 1])
				return true;
		}
	}
	return false;
}

const noPossibleMoves = () => !haveEmptySpots() && !canMerge();

const start = () => {
	insert();
	insert();
	render();
}

document.onkeydown = event => {
	const keyDirectionMap = {
		'ArrowRight': 'right',
		'ArrowDown': 'down',
		'ArrowLeft': 'left',
		'ArrowUp': 'up'
	};

	if (!lost) {
		if (keyDirectionMap[event.key]) {
			let moved = move(keyDirectionMap[event.key]);
			if (moved) 
				insert();
		}
		if (!haveEmptySpots() && !canMerge()) {
			lost = true;
			console.log('lost');
			document.getElementById('lost').classList.add('visible');
		}
		render();
	}
}

document.addEventListener('DOMContentLoaded', start, false);

