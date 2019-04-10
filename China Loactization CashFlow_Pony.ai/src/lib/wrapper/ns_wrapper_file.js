/**
 * Copyright © 2017, Oracle and/or its affiliates. All rights reserved.
 * 
 * @NApiVersion 2.0
 * @NModuleScope Public
 */
define([ 'N/file', './ns_wrapper_search', '../commons',
		'../../dao/helper/search_helper' ], function(file, search, commons,
		helper) {

	var UUID = 'f29f97d8-5f0d-b745-fa7a-9dce97de71da-cashflow'; // An empty file with
	// this string as its
	// name should exist
	// under src directory
	// if you want to use
	// relative path to load
	// a file.
	var URI = "src/" + UUID;

	function create(options) {
		return file.create(options);
	}

	/**
	 * @param options:
	 *            One of the following: path: The relative file path to the file
	 *            in the installation root. For example, {path:
	 *            'src/someDirectory/someFile'}. id: One of the following:
	 *            Internal ID of the file as a number or a string. The relative
	 *            file path to the file in the file cabinet. For example,
	 *            'SuiteScripts/someDirectory/someFile'.
	 * @returns file.File
	 */
	function load(options) {
		log.debug('ns_wrapper_file.js: options', options);

		if (!commons.makesure(options)) {
			return;
		}

		if (commons.isPrimitive(options)) {
			log.debug('ns_wrapper_file.js: isPrimitive', options);

			return loadById(options);
		}

		if (commons.makesure(options.id)) {
			log.debug('ns_wrapper_file.js: makesure(options.id)', options.id);
			return loadById(options.id);
		}

		if (commons.makesure(options.path)) {
			log.debug('ns_wrapper_file.js: .makesure(options.path)',
					options.path);
			return loadByPath(options.path);
		}
	}

	function loadByPath(path) {
		var absolutePath = toAbsolutePath(path);
		if (commons.makesure(absolutePath)) {
			return file.load({
				id : absolutePath
			});
		}
	}

	function loadById(id) {
		return file.load({
			id : id
		});
	}

	function toAbsolutePath(path) {
		var uuidSearch = search.create({
			type : 'file',
			filters : [ search.createFilter({
				name : 'name',
				operator : search.Operator.IS,
				values : UUID
			}) ],
			columns : [ search.createColumn({
				name : 'internalid'
			}) ]
		});
		var results = uuidSearch.run().getRange({
			start : 0,
			end : 1
		});
		if (!commons.makesure(results)) {
			return;
		}

		var baseFile = file.load({
			id : results[0].getValue('internalid')
		});
		if (!commons.makesure(baseFile)) {
			return;
		}

		var uuidPath = baseFile.path;
		var basePath = uuidPath.substring(0, uuidPath.indexOf(URI));
		var absolutePath = basePath + path;

		log.debug('ns_wrapper_file.js: basePath', basePath);
		log.debug('ns_wrapper_file.js: absolutePath', absolutePath);

		return absolutePath;
	}

	/**
	 * @desc List files under a specified directory.
	 * @param {String}
	 *            pathToFolder - The relative directory path to the folder in
	 *            the installation root. For example, 'src/someDirectory',
	 *            'test/someDirectory'.
	 * @param {Function}
	 *            filter - function to filter files
	 * @param {Function}
	 *            sorter - function to sort files
	 * @returns {Array<file.File>} - Expected file list
	 */
	function listFiles(pathToFolder, filter, sorter) {
		if (!commons.ensure(pathToFolder)) {
			log.debug('ns_wrapper_file.js: pathToFolder', 'Path is null.');
			return;
		}

		var columns = [
				helper.column('internalid').sort(search.Sort.ASC).create(),
				helper.column('internalid').reference('file').create() ];

		var folderNames = pathToFolder.split('/');
		folderNames = folderNames.filter(function(element) {
			return commons.ensure(element);
		});
		var filters = [ helper.filter('name').is(
				folderNames[folderNames.length - 1]) ];

		var searchFiles = search.create({
			type : search.Type.FOLDER,
			columns : columns,
			filters : filters
		});

		var folderAbsolutePath = toAbsolutePath(folderNames.join('/'));
		var folders = helper.resultset(searchFiles.run());
		var expectedFiles = [];
		var preFolderId = -1, hasFoundExpectedFolder = false;

		for (var i = 0; i < folders.length; i++) {
			var folderId = folders[i].getValue('internalid');
			if (!hasFoundExpectedFolder && preFolderId === folderId) {
				continue;
			}
			if (hasFoundExpectedFolder && preFolderId !== folderId) {
				break;
			}
			var fileId = folders[i].getValue({
				name : 'internalid',
				join : 'file'
			});
			if (!commons.ensure(fileId)) { // It is an empty folder
				continue;
			}
			var loadedFile = file.load({
				id : fileId
			});
			if (hasFoundExpectedFolder
					|| getParentPath(loadedFile.path) === folderAbsolutePath) {
				if (!commons.ensure(filter) || filter(loadedFile)) {
					expectedFiles.push(loadedFile);
				}
				hasFoundExpectedFolder = true;
			}
			preFolderId = folderId;
		}
		log.debug('ns_wrapper_file.js: loadedFiles', JSON
				.stringify(expectedFiles));

		return commons.ensure(sorter) ? expectedFiles.sort(sorter)
				: expectedFiles;
	}

	function getParentPath(path) {
		return path.substring(0, path.lastIndexOf('/'));
	}

	var wrapper = {
		toAbsolutePath : toAbsolutePath,
		load : load,
		listFiles : listFiles,
		create : create
	};

	Object.defineProperty(wrapper, 'Type', {
		enumerable : true,
		get : function() {
			return file.Type;
		}
	});

	Object.defineProperty(wrapper, 'Encoding', {
		enumerable : true,
		get : function() {
			return file.Encoding;
		}
	});

	return wrapper;

});
