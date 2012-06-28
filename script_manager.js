/**
 * @author eturino
 */
// BIBLIOTECA
function ScriptManager() {
	this.levels = {};
	this.executed = {};
	this.past_levels = {};
	this.counter_run = 0;
}

ScriptManager.BLOCK_HEADER = 0;
ScriptManager.BLOCK_FOOTER = 100;
ScriptManager.BLOCK_AFTER_FOOTER = 200;


ScriptManager.LEVEL_INMEDIATE_BEFORE = 1;
ScriptManager.LEVEL_INMEDIATE        = 2;
ScriptManager.LEVEL_INMEDIATE_AFTER  = 3;
ScriptManager.LEVEL_HIGHEST_BEFORE   = 4;
ScriptManager.LEVEL_HIGHEST          = 5;
ScriptManager.LEVEL_HIGHEST_AFTER    = 6;
ScriptManager.LEVEL_HIGH_BEFORE      = 7;
ScriptManager.LEVEL_HIGH             = 8;
ScriptManager.LEVEL_HIGH_AFTER       = 9;
ScriptManager.LEVEL_MEDIUM_BEFORE    = 10;
ScriptManager.LEVEL_MEDIUM           = 11;
ScriptManager.LEVEL_MEDIUM_AFTER     = 12;
ScriptManager.LEVEL_LOW_BEFORE       = 13;
ScriptManager.LEVEL_LOW              = 14;
ScriptManager.LEVEL_LOW_AFTER        = 15;
ScriptManager.LEVEL_LOWEST_BEFORE    = 16;
ScriptManager.LEVEL_LOWEST           = 17;
ScriptManager.LEVEL_LOWEST_AFTER     = 18;
ScriptManager.LEVEL_END_BEFORE       = 19;
ScriptManager.LEVEL_END              = 20;
ScriptManager.LEVEL_END_AFTER        = 21;

/**
 * returns the singleton ScriptManager
 * @returns ScriptManager
 */
ScriptManager.getInstance = function () {
	if (ScriptManager._inst) {
		return ScriptManager._inst;
	}

	ScriptManager._inst = new ScriptManager();
	return ScriptManager._inst;
};

/**
 *
 * @param level
 * @param script
 * @return ScriptManager
 */
ScriptManager.prototype.addFunctionToLevel = function (script, level, ignore_counter_run) {
	ignore_counter_run = ignore_counter_run || false;
	var eflev = level;
	if(!ignore_counter_run){
		eflev = level + this.counter_run;
	}

	if (!this.levels[eflev]) {
		this.levels[eflev] = [];
	}

	this.levels[eflev].push(function () {
		try{
			script();
		}catch(ex){

		}
	});
	return this;
};

/**
 *
 * @param level
 * @param script
 * @return ScriptManager
 */
ScriptManager.prototype.addScriptToLevel = function (script, level, ignore_counter_run) {
	ignore_counter_run = ignore_counter_run || false;
	var eflev = level;
	if(!ignore_counter_run){
		eflev = level + this.counter_run;
	}

	if (!this.levels[eflev]) {
		this.levels[eflev] = [];
	}

	this.levels[eflev].push(script);
	return this;
};

/**
 *
 * @return ScriptManager
 */
ScriptManager.prototype.runChain = function () {
	for (var i in this.levels) {
		if (this.levels.hasOwnProperty(i)) {
			this.runLevel(i);
		}
	}
	this.counter_run = this.counter_run + 100;
	return this;
};

/**
 *
 * @param cr
 * @return ScriptManager
 */
ScriptManager.prototype.setCounterRun = function (cr) {
	this.counter_run = cr;
	return this;
};

/**
 *
 * @param i
 * @return ScriptManager
 */
ScriptManager.prototype.runLevel = function (i) {
	for (var j in this.levels[i]) {
		if (this.levels[i].hasOwnProperty(j)) {
			$LAB.script(this.levels[i][j]);
		}
	}
	$LAB.wait(function () {
		ScriptManager.getInstance().markExecuted(i);
	});
	this.past_levels[i] = this.levels[i];
	delete(this.levels[i]);
	return this;
};

/**
 *
 * @param i
 * @return ScriptManager
 */
ScriptManager.prototype.isExecuted = function (i) {
	return this.executed[i] || false;
}

/**
 *
 * @param i
 * @return ScriptManager
 */
ScriptManager.prototype.markExecuted = function (i) {
	this.executed[i] = true;
	return this;
}
