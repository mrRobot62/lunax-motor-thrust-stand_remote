function Queue(value) {
	this._queue = [];
	if (value === undefined || value === null) {
		this._queue = [];
	} else if (!Array.isArray(value)) {
		throw new Error ('Expecting first argument should be an Array or explicit null');
	}
	this._queue = value;

}


Queue.prototype.push = function(value) {
	this._queue.unshift(value);
}

Queue.prototype.add = function(value) {
	this.push(value);
}

Queue.prototype.queue = function() {
	return this._queue;
}

Queue.prototype.first = function() {
  return this._queue[0];
}

Queue.prototype.last = function() {
  return this._queue[this._queue.length - 1];
}

Queue.prototype.size = function() {
  return this._queue.length;
}

Queue.prototype.pop = function() {
  return this._queue.pop();
}

module.exports  = Queue;
