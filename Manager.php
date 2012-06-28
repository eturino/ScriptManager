<?php

class EtuDev_ScriptManager_Manager {

	const BLOCK_HEAD         = 0;
	const BLOCK_FOOTER       = 100;
	const BLOCK_AFTER_FOOTER = 200;

	const LEVEL_INMEDIATE_BEFORE = 1;
	const LEVEL_INMEDIATE        = 2;
	const LEVEL_INMEDIATE_AFTER  = 3;
	const LEVEL_HIGHEST_BEFORE   = 4;
	const LEVEL_HIGHEST          = 5;
	const LEVEL_HIGHEST_AFTER    = 6;
	const LEVEL_HIGH_BEFORE      = 7;
	const LEVEL_HIGH             = 8;
	const LEVEL_HIGH_AFTER       = 9;
	const LEVEL_MEDIUM_BEFORE    = 10;
	const LEVEL_MEDIUM           = 11;
	const LEVEL_MEDIUM_AFTER     = 12;
	const LEVEL_LOW_BEFORE       = 13;
	const LEVEL_LOW              = 14;
	const LEVEL_LOW_AFTER        = 15;
	const LEVEL_LOWEST_BEFORE    = 16;
	const LEVEL_LOWEST           = 17;
	const LEVEL_LOWEST_AFTER     = 18;
	const LEVEL_END_BEFORE       = 19;
	const LEVEL_END              = 20;
	const LEVEL_END_AFTER        = 21;

	/**
	 * @var EtuDev_ScriptManager_Manager
	 */
	static protected $instance;

	static public function getInstance() {
		if (!static::$instance) {
			static::$instance = new static();
		}
		return static::$instance;
	}

	protected $current_block = self::BLOCK_HEAD;

	protected $scripts_by_level = array();

	public function addFunctionByLevel($jsFunction, $level, $block = null) {
		if (!$jsFunction) {
			return $this;
		}
		$l = $this->getEffectiveLevel($level, $block);


		$this->scripts_by_level[$l][] = array('f' => $jsFunction);
		return $this;
	}

	public function addScriptByLevel($scriptname, $level, $block = null) {
		if (!$scriptname) {
			return $this;
		}
		$l = $this->getEffectiveLevel($level, $block);

		$this->scripts_by_level[$l][] = array('s' => json_encode($scriptname));
		return $this;
	}

	protected function getEffectiveLevel($level, $block) {
		if (!$block || $block < $this->current_block) {
			$block = $this->current_block;
		}

		return (int) ($block + $level);
	}

	/**
	 * returns the scripts for the current block, ordered by level, ready to be executed/printed
	 * @return array
	 */
	protected function getCurrentBlockScripts() {

		$current_block = $this->current_block;

		$filteredKeys = array_filter(array_keys($this->scripts_by_level), function($lvl) use ($current_block) {
			return ($lvl >= $current_block && $lvl < ($current_block + 100));
		});

		if (empty($filteredKeys)) {
			return array();
		}

		$filtered = array_intersect_key($this->scripts_by_level, array_flip(array_values($filteredKeys)));
		ksort($filtered);
		return $filtered;
	}

	public function renderRunCurrentBlock() {
		$lvls = $this->getCurrentBlockScripts();
		$h    = '';
		if ($lvls) {
			foreach ($lvls as $lkey => $scripts) {
				if ($scripts) {
					foreach ($scripts as $s) {
						if ($s['f']) {
							$method = 'addFunctionToLevel';
							$param  = $s['f'];
						} else {
							$method = 'addScriptToLevel';
							$param  = $s['s'];
						}
						$h .= "ScriptManager.getInstance().$method($param,$lkey); \n";
					}
					$h .= "ScriptManager.getInstance().runLevel($lkey); \n";
				}
			}
		}
		$this->current_block += 100;
		$cb = $this->current_block;
		$h .= "ScriptManager.getInstance().setCounterRun($cb); \n";
		return $h;
	}

	public function renderRunCurrentBlockWithScriptTag() {
		$h = $this->renderRunCurrentBlock();
		if ($h) {
			$h = '<script type="text/javascript">' . $h . '</script>';
		}

		return $h;
	}
}