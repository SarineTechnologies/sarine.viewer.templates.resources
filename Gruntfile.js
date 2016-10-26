module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);

    var appConfig = {
        widgetName: null,
        dir: 'dist',
        fsTargetDir: '',
        fsSourceDir: '',
        fsResourceDir: '',
        codeWidgetPath: './'
    };

    var fullConfig = {
        project: appConfig,
        version: {},
        copy: {
            dist_resources: {
                flatten: true,
                src: [
                    '<%= project.fsResourceDir %>/en-US/*.json'
                ],
                dest: '<%= project.fsTargetDir %>/resources/en-US/',
                expand: true
            },
            dist_js: {
                flatten: true,
                src: [
                    '<%= project.fsSourceDir %>/*.js'
                ],
                dest: '<%= project.fsTargetDir %>/js/',
                expand: true
            },
            dist_vendor: {
                flatten: true,
                src: [
                    '<%= project.fsSourceDir %>/vendor/*.js'
                ],
                dest: '<%= project.fsTargetDir %>/js/vendor',
                expand: true
            },
            dist_package_file: {
                flatten: true,
                src: [
                    'package.json'
                ],
                dest: '<%= project.fsTargetDir %>',
                expand: true
            },
            dist_assets1: {
                flatten: true,
                src: [
                    'tmp/app.bundle.js',
                    'tmp/app.bundle.min.js',
                    'tmp/app.bundle.min.js.map',
                    '<%= project.fsSourceDir %>/widgetConfig.js',
                    '<%= project.fsSourceDir %>/version.json'
                ],
                dest: '<%= project.fsTargetDir %>/',
                expand: true
            },
            dist_assets2: {
                src: ['app/fonts/**', 'app/img/**'],
                dest: "<%= project.fsTargetDir %>/",
                expand: true,
                rename: function (dest, src) {
                    return dest + src.replace('app\/', '');
                }
            }
        },
        clean: {
            tmp: ['tmp']
        },
        template: {
            shell: {
                options: {
                    data: appConfig
                },
                files: {}
            }
        },
        push: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                releaseBranch: false,
                add: true,
                addFiles: ['.'], // '.' for all files except ingored files in .gitignore
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json'], // '-a' for all files
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin',
                npm: false,
                npmTag: 'Release v%VERSION%',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            }
        },
        appcache: {
            options: {
                // Task-specific options go here.
                basePath: '<%= project.fsTargetDir %>'
            },
            target1: {
                dest: '<%= project.fsTargetDir %>/app.appcache',
                cache: {
                    patterns: [
                        '<%= project.fsTargetDir %>/img/**/*',
                        '<%= project.fsTargetDir %>/fonts/**/*',
                        '<%= project.fsTargetDir %>/app.bundle.min.js',
                        '<%= project.fsTargetDir %>/widget.min.css',
                        '<%= project.fsTargetDir %>/dashboard.min.css',
                        '<%= project.fsTargetDir %>/responsive.min.css'
                    ]
                },
                network: '*'
            }
        }
    };

    /**
    * Examples:
    * grunt build:r:w2.1 
    * grunt build:r and choose widget number
    */ 
    grunt.registerTask('build', 'Build widget for production', function () {
        appConfig.fsSourceDir = 'app/js';
        appConfig.fsTargetDir = 'app/dist';
        appConfig.fsResourceDir = 'app/resources';
        fullConfig.version = grunt.file.readJSON(__dirname  + '/package.json');
        appConfig.version = fullConfig.version;

        grunt.config.init(fullConfig);

        conditionalExec([
            {task: 'clean',                 exec: 1},
            {task: 'copy:dist_js',     exec: 1},
            {task: 'copy:dist_vendor',     exec: 1},
            {task: 'copy:dist_package_file',     exec: 1},
            {task: 'copy:dist_assets1',     exec: 1},
            {task: 'copy:dist_assets2',     exec: 1},
            {task: 'copy:dist_resources',     exec: 1},
            {task: 'clean',                 exec: 1},
            //{task: 'appcache',              exec: 1},
        ]);
    });

    grunt.registerTask('unusedimages', 'Find and delete unused images', function () {
        var assets = [],
            linksInUse = [],
            options = {
                filter: 'isFile',
                cwd: 'app/dist/' + this.args[0],
                expand: true
            },
            searchImgPattern = ['img/**/*'],
            searchInFiles = [
                'index.html',
                '*.css'
            ],
            unused;

        // Get list of images
        grunt.file.expand(options, searchImgPattern).forEach(function(file) {
            assets.push(file);
        });

        // Find images in content
        grunt.file.expand(options, searchInFiles).forEach(function(file) {
            var content = grunt.file.read(options.cwd + '/' + file);
            assets.forEach(function(asset) {
                if (content.search(asset) !== -1) {
                    linksInUse.push(asset);
                }
            });
        });

        // Output unused images
        unused = grunt.util._.difference(assets, linksInUse);
        unused.forEach(function(el) {
            console.log('Deleting unused image %s', el);
            grunt.file.delete(options.cwd + '/' + el);
        });
        console.log('Deleted %s unused image(s)', unused.length);
        
        // Clean empty folders that left after deleting unused images
        grunt.initConfig({
            cleanempty: {
                options: {
                    files: false,
                    folders: true
                },
                clean_dist: {
                    src: [options.cwd + '/**/*']
                }
            }
        });
        grunt.task.run('cleanempty');
    }); 

    /**
     * 
     * @param {Array} data     Pass the names of tasks and boolean values: [
     *      {task: 'taskName1', exec: true},
     *      {task: 'taskName2', exec: false}
     * ]
     * @returns {void}
     */
    function conditionalExec(data) {
        var i,
            tasklist = [];
        for (i = 0; i < data.length; i++) {
            if (!!data[i].exec) {
                tasklist.push(data[i].task);
            }
        }
        grunt.task.run(tasklist);
    }
};
