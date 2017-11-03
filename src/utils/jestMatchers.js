import chalk from 'chalk';

const toMatchImageSnapshot = (result, testState) => {
  const snapshotState = testState;
  expect.setState(snapshotState, {
    _counters: snapshotState.snapshotState._counters.set(
      snapshotState.currentTestName,
      (snapshotState.snapshotState._counters.get(snapshotState.currentTestName) || 0) + 1,
    ),
  });
  let pass = true;
  if (result.updated) {
    expect.setState(snapshotState, { updated: snapshotState.snapshotState.updated += 1 });
  } else if (result.added) {
    expect.setState(snapshotState, { added: snapshotState.snapshotState.added += 1 });
  } else if (result.matched) {
    expect.setState(snapshotState, { matched: snapshotState.snapshotState.matched += 1 });
  } else if (!result.matched) {
    expect.setState(snapshotState, { unmatched: snapshotState.snapshotState.unmatched += 1 });
    pass = false;
  }

  const message = () => 'Expected image to match snapshot.\n'
                  + `${chalk.bold.red('See diff for details:')} ${chalk.red(result.diffPath)}`;
  return {
    message,
    pass,
  };
};

const toNotError = (error, testState) => {
  const snapshotState = testState;
  expect.setState(snapshotState, {
    _counters: snapshotState.snapshotState._counters.set(
      snapshotState.currentTestName,
      (snapshotState.snapshotState._counters.get(snapshotState.currentTestName) || 0) + 1,
    ),
  });

  const message = () => 'Failed to run your test.\n'
                  + `${chalk.bold.red('Cause:')} ${chalk.red(error)}`;
  return {
    message,
    pass: false,
  };
};

export default { toMatchImageSnapshot, toNotError };
