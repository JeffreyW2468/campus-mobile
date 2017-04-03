import { delay } from 'redux-saga';
import { call, fork, put, select, takeLatest } from 'redux-saga/effects';

import { fetchShuttleArrivalsByStop } from '../services/shuttleService';

const getShuttle = (state) => (state.shuttle);

function* addStop(action) {
	const shuttle = yield select(getShuttle);
	const savedStops = shuttle.savedStops.slice(); // copy array
	const stops = Object.assign({}, shuttle.stops);
	let contains = false;

	for (let i = 0;  i < savedStops.length; ++i) {
		if (savedStops[i].id === action.stopID) {
			contains = true;
			break;
		}
	}

	if (!contains) {
		savedStops.unshift(stops[action.stopID]);
	}

	yield put({ type: 'CHANGED_STOPS', savedStops });
	yield fork(fetchArrival, action.stopID);
}

function* removeStop(action) {
	const shuttle = yield select(getShuttle);
	const savedStops = shuttle.savedStops.slice();
	savedStops.splice(action.stopIndex, 1);

	/*
	for (let i = 0;  i < savedStops.length; ++i) {
		// Found stop, remove and exit
		if (savedStops[i].id === action.stopID) {
			savedStops.splice(i, 1);
			break;
		}
	}*/

	yield put({ type: 'CHANGED_STOPS', savedStops });
}

function* moveStopUp(action) {
	if (action.stopIndex > 0) {
		const shuttle = yield select(getShuttle);
		const savedStops = shuttle.savedStops.slice();
		const tempStop = savedStops[action.stopIndex];
		savedStops[action.stopIndex] = savedStops[action.stopIndex - 1];
		savedStops[action.stopIndex - 1] = tempStop;

		yield put({ type: 'CHANGED_STOPS', savedStops });
	}
}

function* moveStopDown(action) {
	if (action.stopIndex > 0) {
		const shuttle = yield select(getShuttle);
		const savedStops = shuttle.savedStops.slice();
		const tempStop = savedStops[action.stopIndex];
		savedStops[action.stopIndex] = savedStops[action.stopIndex + 1];
		savedStops[action.stopIndex + 1] = tempStop;

		yield put({ type: 'CHANGED_STOPS', savedStops });
	}
}

function* fetchArrival(stopID) {
	const shuttle = yield select(getShuttle);
	const stops = Object.assign({}, shuttle.stops);

	try {
		const arrivals = yield call(fetchShuttleArrivalsByStop, stopID);

		// Sort arrivals, should be on lambda?
		arrivals.sort((a, b) => {
			const aSecs = a.secondsToArrival;
			const bSecs = b.secondsToArrival;

			if ( aSecs < bSecs ) return -1;
			if ( aSecs > bSecs) return 1;
			return 0;
		});

		stops[stopID].arrivals = arrivals;

		yield put({ type: 'SET_ARRIVALS', stops });
	} catch (error) {
		console.log('Error fetching arrival for ' + stopID + ': ' + error);
	}
}

function* watchArrivals() {
	while (true) {
		const { savedStops } = yield select(getShuttle);
		for (let i = 0; i < savedStops.length; ++i) {
			const stopID = savedStops[i].id;
			yield call(fetchArrival, stopID);
		}
		yield delay(60000); // wait 60s before pinging again
	}
}

function* shuttleSaga() {
	yield takeLatest('ADD_STOP', addStop);
	yield takeLatest('REMOVE_STOP', removeStop);
	yield takeLatest('MOVE_STOP_UP', moveStopUp);
	yield takeLatest('MOVE_STOP_DOWN', moveStopDown);
	yield call(watchArrivals);
}

export default shuttleSaga;
