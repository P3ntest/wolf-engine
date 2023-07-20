let running: { [key: string]: number } = {};

let history: { [key: string]: number[] } = {};

let parents: { [key: string]: string } = {};
let runningStack: string[] = [];

export const WolfPerformance = {
  start(name: string) {
    const start = performance.now();
    running[name] = start;
    if (!parents[name] && runningStack.length > 0) {
      const parent = runningStack[runningStack.length - 1];
      parents[name] = parent;
    }
    runningStack.push(name);
  },
  end(name: string) {
    const end = performance.now();
    const start = running[name];

    const time = end - start;
    if (!history[name]) {
      history[name] = [];
    }
    history[name].push(time);
    if (history[name].length > 100) {
      history[name].shift();
    }
    runningStack.pop();
  },
};

let averages: { [key: string]: number } = {};

export function logPerformance() {
  console.log(
    "%cPerformance:",
    "color: #4f55f7; font-size: 20px; font-weight: bold; text-shadow: 5px 5px #000000;"
  );

  averages = {};
  // calculate averages
  for (const item of Object.keys(history)) {
    const average = history[item].reduce((acc, item) => acc + item, 0) / 100;
    averages[item] = average;
  }

  const root = Object.keys(history).find((item) => !parents[item]);
  const tree = getChildTree(root!);

  console.log(
    `${root}: ${averages[root!].toFixed(2)}ms (${(100).toFixed(2)}%)`
  );
  printTree(tree);
}

function printTree(tree: tree, depth: number = 0) {
  for (const item of Object.keys(tree)) {
    const child = tree[item];
    const average = averages[item];
    const parent = parents[item];
    let percentage = 1;
    if (parent) {
      const parentAverage = averages[parent];
      percentage = average / parentAverage;
    }
    console.log(
      `${" ".repeat(depth)}${item}: ${average.toFixed(2)}ms (${(
        percentage * 100
      ).toFixed(2)}%)`
    );
    printTree(child, depth + 1);
  }
}

type tree = { [key: string]: tree };
const tree: tree = {};

function getChildTree(name: string) {
  const tree: tree = {};
  for (const item of Object.keys(parents)) {
    const parent = parents[item];
    if (parent === name) {
      tree[item] = getChildTree(item);
    }
  }
  return tree;
}

export function enablePerformanceLogging() {
  setInterval(() => {
    logPerformance();
  }, 1000);
}
