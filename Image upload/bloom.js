const crypto = require('crypto');

class BloomFilter {
  constructor(size = 100, hashCount = 3) {
    this.size = size;
    this.hashCount = hashCount;
    this.bitArray = new Array(size).fill(0);
  }

  _hash(item, seed) {
    const hash = crypto.createHash('sha256');
    hash.update(item + seed);
    return parseInt(hash.digest('hex'), 16) % this.size;
  }

  add(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this._hash(item, i);
      console.log(index)
      this.bitArray[index] = 1;
      console.log(this.bitArray);
      
    }
  }

  contains(item) {
    for (let i = 0; i < this.hashCount; i++) {
      const index = this._hash(item, i);
      if (this.bitArray[index] === 0) {
        return false; // definitely not in set
      }
    }
    return true; // possibly in set
  }
}

// Example usage
const bloom = new BloomFilter(50, 3);

// bloom.add("apple");
// bloom.add("banana");

console.log("apple:", bloom.contains("apple")); // true
console.log("banana:", bloom.contains("banana")); // true
// console.log("grape:", bloom.contains("grape")); // false (most likely)
