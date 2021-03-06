import { put, take, call, fork, all } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import taskManager from '../task-manager';

export function* pollingTask(payload) {
  const channel = yield call(subscribe, payload);
  try {
    while (true) {
      let action = yield take(channel);
      yield put(action);
    }
  } finally {
    channel.close();
  }
}

export function subscribe({ action, interval }) {
  return eventChannel(emit => {
    emit(action);
    let timer = setInterval(() => {
      emit(action);
    }, interval);
    return () => {
      clearInterval(timer);
    };
  });
}

export default function*() {
  while (true) {
    let action = yield take('SAGA_POLLING');
    const { payload } = action;
    const task = yield fork(pollingTask, payload);
    action.task = task;
    yield call(taskManager.append, task);
  }
}
