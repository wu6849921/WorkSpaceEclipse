/**
 * Module Description Create Hashtable for the COA Mapping with Javascript
 * Version Date Author Remarks 1.00 09 Sep 2014 Winson.Chen
 * 
 */

triggernamespace("trigger.local");

trigger.local.HashTable = function _hashtable() {
	this.ArrayList = [];
	this.HashArr = {};
	this.Count = 0;

	this.Add = function(key, value) {
		if (this.HashArr.hasOwnProperty(key)) {
			return false; // 如果键已经存在，不添加
		} else {
			this.HashArr[key] = value;
			this.ArrayList[this.Count] = key;
			this.Count++;
			return true;
		}
	}; // add

	this.Contains = function(key) {
		return this.HashArr.hasOwnProperty(key);
	}; // if it's contains

	this.GetValue = function(key) {
		if (this.Contains(key)) {
			return this.HashArr[key];
		} else {
			// throw Error("Hashtable dont cotains this key: " + String(key));
			// err
			return '';
		}
	}; // Get the value from the key

	this.Remove = function(key) {
		if (this.Contains(key)) {
			delete this.HashArr[key];
			this.Count--;
		}
	}; // Remove

	this.Clear = function() {
		this.HashArr = {};
		this.Count = 0;
	}; // Clear
};

trigger.local.HashEntity = function(internalid, name) {
	this.internalid = internalid;
	this.name = name;
}
