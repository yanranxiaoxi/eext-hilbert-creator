let stopped = false;

function stopDrawing() {
	stopped = true;
}

async function drawHilbertCurve(lineWidth, startX, startY, iterations, height, mode) {
	const layer = 1;
	const net = 'HILBERT';
	const h = eda.sys_Unit.mmToMil(height) / Math.pow(2, iterations);

	// 获取数据原点与画布原点的偏移量
	const offset = await eda.pcb_Document.getCanvasOrigin();

	let x = offset['offsetX'] + eda.sys_Unit.mmToMil(startX);
	let y = offset['offsetY'] + eda.sys_Unit.mmToMil(startY);

	// 临时解决方案，2.2.35.4 已修复
	lineWidth = eda.sys_Unit.mmToMil(lineWidth);
	mode = parseInt(mode, 10);

	/* if (mode >= 2) {
		x = eda.sys_Unit.mmToMil(startX) + eda.sys_Unit.mmToMil(height) - h;
		y = eda.sys_Unit.mmToMil(startX) + eda.sys_Unit.mmToMil(height) - h;
	} */

	async function One(n) {
		if (n > 0 && !stopped) {
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
		if (n > 0 && !stopped) {
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
		if (n > 0 && !stopped) {
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
		if (n > 0 && !stopped) {
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
		if (stopped) return;
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

	stopped = false;
}

async function calcResistance(lineWidth) {
	// R=(ρL)/(1000WD)
	const r = 0.0175;
	const W = lineWidth;
	const D = 0.035;

	try {
		const length = await eda.pcb_Net.getNetLength('HILBERT');
		return (r * eda.sys_Unit.milToMm(length)) / (1000 * W * D);
	} catch (error) {
		console.error('Error calculating resistance: ', error);
		throw error;
	}
}
