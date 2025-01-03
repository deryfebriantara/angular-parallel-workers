/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const result = data.transactions.filter((txn: any) => txn.amount > 10000);
  postMessage(result);
});

