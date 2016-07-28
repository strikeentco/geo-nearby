'use strict';

const threshold = 20;

function change(items, i, j) {
  const c = items[i];
  items[i] = items[j];
  items[j] = c;
}

function partition(items, l, r, x) {
  while (l <= r) {
    while (items[l].g < x.g) {
      l++;
    }

    while (x.g < items[r].g) {
      r--;
    }

    if (l <= r) {
      change(items, l++, r--);
    }
  }

  return l;
}

function medianOf(low, mid, high) {
  if (mid.g < low.g) {
    if (high.g < mid.g) {
      return mid;
    }
    return (high.g < low.g) ? high : low;
  }
  if (high.g < mid.g) {
    return (high.g < low.g) ? low : high;
  }
  return mid;
}

function downHeap(items, k, n) {
  const item = items[k];
  let child;

  while ((child = 2 * k + 1) < n) { // eslint-disable-line no-cond-assign
    if (child + 1 < n && items[child].g < items[child + 1].g) {
      child++;
    }

    if (item.g >= items[child].g) {
      break;
    }

    items[k] = items[child];
    k = child;
  }

  items[k] = item;
}

function heapSort(items, l, r) {
  const length = r - l + 1;

  for (let i = Math.floor(length / 2) - 1; i >= 0; i--) {
    downHeap(items, i, length);
  }

  for (let i = length - 1; i >= 1; i--) {
    change(items, i, 0);
    downHeap(items, 0, i);
  }

  return items;
}

function insertionSort(items, l, r) {
  let j;
  let tmp;

  for (let i = l; i <= r; i++) {
    tmp = items[i];
    j = i;
    while (j !== l && tmp.g < items[j - 1].g) {
      items[j] = items[j - 1];
      j--;
    }

    items[j] = tmp;
  }

  return items;
}

function depth(length) {
  return ((Math.log(length)) << 0) * 2;
}

function introSort(items, l, r, d) {
  let p;

  while (r - l > threshold) {
    if (!d) {
      return heapSort(items, l, r);
    }
    p = partition(items, l, r, medianOf(items[l], items[l + r >> 1], items[r - 1]));
    items = introSort(items, p, r, --d);
    r = p;
  }

  return insertionSort(items, l, r);
}

module.exports = items => {
  const length = items.length;
  return introSort(items, 0, length - 1, depth(length));
};
