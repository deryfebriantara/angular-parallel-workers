/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  const result = data.transactions.reduce((acc: any, txn: any) => {
    acc[txn.region] = (acc[txn.region] || 0) + txn.amount;
    return acc;
  }, {});
  postMessage(result);
});
