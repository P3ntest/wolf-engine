import { disableValidators } from "discord.js";

type RunningTreesDict = {
  [key: string]: RunningTree;
};

type RunningTree = {
  running: {
    [key: string]: number;
  };
  runningStack: string[];
  history: {
    [key: string]: number[];
  };
  parents: {
    [key: string]: string;
  };
};

let trees: RunningTreesDict = {};

function ensureTree(name: string) {
  if (!trees[name]) {
    trees[name] = {
      running: {},
      runningStack: [],
      history: {},
      parents: {},
    };
  }

  return trees[name];
}

export const WolfPerformance = {
  start(root: string, name?: string) {
    name = name ?? root;
    const start = performance.now();
    const tree = ensureTree(root);
    tree.running[name] = start;

    if (tree.runningStack.length && !tree.parents[name]) {
      tree.parents[name] = tree.runningStack[tree.runningStack.length - 1];
    }

    tree.runningStack.push(name);
  },
  end(root: string) {
    const end = performance.now();
    const tree = ensureTree(root);
    const name = tree.runningStack.pop()!;
    const start = tree.running[name];

    const time = end - start;
    if (!tree.history[name]) {
      tree.history[name] = [];
    }
    tree.history[name].push(time);
    if (tree.history[name].length > 100) {
      tree.history[name].shift();
    }
  },
};

let lastPerformanceCalc = 0;

let lastPerformance: TreePerformance[] = [];

export function getPerformance(refreshRate = 1000) {
  if (performance.now() - lastPerformanceCalc < refreshRate) {
    return lastPerformance;
  }

  lastPerformanceCalc = performance.now();

  const treePerformance: TreePerformance[] = Object.keys(trees).map((key) =>
    getTreePerformance(trees[key])
  );

  lastPerformance = treePerformance;

  return treePerformance;
}

type TreePerformance = {
  name: string;
  time: number;
  percentage: number;
  children: TreePerformance[];
};

function getTreePerformance(tree: RunningTree): TreePerformance {
  const root = Object.keys(tree.history).find(
    (key) => !tree.parents[key] && tree.history[key].length
  )!;

  if (!root) {
    return {
      children: [],
      name: "No root",
      time: 0,
      percentage: 0,
    };
  }

  const avgTime =
    tree.history[root].reduce((a, b) => a + b, 0) / tree.history[root].length;

  return {
    children: Object.keys(tree.parents)
      .filter((key) => tree.parents[key] === root)
      .map((child) => getSubTreePerformance(tree, child, avgTime)),
    name: root,
    time: avgTime,
    percentage: 1,
  };
}

function getSubTreePerformance(
  tree: RunningTree,
  root: string,
  parentTime: number
): TreePerformance {
  const children = Object.keys(tree.parents).filter(
    (key) => tree.parents[key] === root
  );

  const avgTime =
    tree.history[root].reduce((a, b) => a + b, 0) / tree.history[root].length;

  return {
    children: children.map((child) =>
      getSubTreePerformance(tree, child, avgTime)
    ),
    name: root,
    time: avgTime,
    percentage: avgTime / parentTime,
  };
}

export function PerformanceComponent({
  performance,
}: {
  performance: TreePerformance[];
}) {
  return (
    <div>
      {performance.map((tree) => (
        <PerformanceTree tree={tree} />
      ))}
    </div>
  );
}

function PerformanceTree({ tree }: { tree: TreePerformance }) {
  return (
    <div>
      <div>
        {tree.name} - {tree.time.toFixed(2)}ms (
        {(tree.percentage * 100).toFixed(2)}%)
      </div>
      <div style={{ marginLeft: 20 }}>
        {tree.children.map((child) => (
          <PerformanceTree tree={child} />
        ))}
      </div>
    </div>
  );
}
