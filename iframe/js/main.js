async function drawHilbertCurve(lineWidth, startX, startY, iterations, height, mode) {
	const layer = 1;
	const net = 'Hilbert';
	const h = eda.sys_Unit.mmToMil(height) / Math.pow(2, iterations);

	let x = eda.sys_Unit.mmToMil(startX);
	let y = eda.sys_Unit.mmToMil(startY);

	lineWidth = eda.sys_Unit.mmToMil(lineWidth) / 10;
	mode = parseInt(mode, 10);

	/* if (mode >= 2) {
		x = eda.sys_Unit.mmToMil(startX) + eda.sys_Unit.mmToMil(height) - h;
		y = eda.sys_Unit.mmToMil(startX) + eda.sys_Unit.mmToMil(height) - h;
	} */

	async function One(n) {
		if (n > 0) {
			await Two(n - 1);
			await drawLine(x, y, x, y + h);
			y += h;
			await One(n - 1);
			await drawLine(x, y, x + h, y);
			x += h;
			await One(n - 1);
			await drawLine(x, y, x, y - h);
			y -= h;
			await Four(n - 1);
		}
	}

	async function Two(n) {
		if (n > 0) {
			await One(n - 1);
			await drawLine(x, y, x + h, y);
			x += h;
			await Two(n - 1);
			await drawLine(x, y, x, y + h);
			y += h;
			await Two(n - 1);
			await drawLine(x, y, x - h, y);
			x -= h;
			await Three(n - 1);
		}
	}

	async function Three(n) {
		if (n > 0) {
			await Four(n - 1);
			await drawLine(x, y, x, y - h);
			y -= h;
			await Three(n - 1);
			await drawLine(x, y, x - h, y);
			x -= h;
			await Three(n - 1);
			await drawLine(x, y, x, y + h);
			y += h;
			await Two(n - 1);
		}
	}

	async function Four(n) {
		if (n > 0) {
			await Three(n - 1);
			await drawLine(x, y, x - h, y);
			x -= h;
			await Four(n - 1);
			await drawLine(x, y, x, y - h);
			y -= h;
			await Four(n - 1);
			await drawLine(x, y, x + h, y);
			x += h;
			await One(n - 1);
		}
	}

	async function drawLine(startX, startY, endX, endY) {
		await eda.pcb_PrimitiveLine.create(net, layer, startX, startY, endX, endY, lineWidth);
	}

	switch (mode) {
		case 0:
			await One(iterations);
			break;
		case 1:
			await Two(iterations);
			break;
		case 2:
			await Three(iterations);
			break;
		case 3:
			await Four(iterations);
			break;
		default:
			await One(iterations);
			break;
	}
}

/* async function calcResistance(lineWidth) {
	// R=(ρL)/(1000WD)
	const r = 0.0175;
	const W = lineWidth;
	const D = 0.035;
	await eda.pcb_Net.getNetLength("Hilbert").then((length) => {
		const R = (r * length) / (1000 * W * D);
		console.log("Resistance: ", R);
		return R;
	});
} */

async function calcResistance(lineWidth) {
	// R=(ρL)/(1000WD)
	const r = 0.0175;
	const W = lineWidth;
	const D = 0.035;

	try {
		const length = await eda.pcb_Net.getNetLength('Hilbert');
		const R = (r * eda.sys_Unit.milToMm(length)) / (1000 * W * D);
		console.log('Resistance: ', R);
		return R;
	} catch (error) {
		console.error('Error calculating resistance: ', error);
		throw error;
	}
}
// 调用示例
// drawHilbertCurve(0.254, 10, 10, 5, 50, 0);
