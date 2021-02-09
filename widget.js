Com.Frog.Utils.require(
    '//package/widgets/2E3636692001B28FC76F4F34DAC60A0730A2A13CF36A730A/assets/styles/main.css',
    '//package/widgets/2E3636692001B28FC76F4F34DAC60A0730A2A13CF36A730A/assets/views/main.ejs',
    '//package/widgets/2E3636692001B28FC76F4F34DAC60A0730A2A13CF36A730A/widget.ejs'
).then(function() {
    Com.Frog.Controllers.Widget.extend('Widget.Folder', {
    }, {
        prefs: {
            title: {
               "type": "text",
               "label": "Folder Title",
               "defaultValue": "Folder",
               "placeholder": "Type your folder title here"
            },
            subtitle: {
               "type": "text",
               "label": "Folder Subtitle",
               "defaultValue": "",
               "placeholder": "Type your folder subtitle here"
            },
            folder_icon: {
                type: 'upload',
                label: "Select a Folder Icon",
                showDiscover: false,
                showClipboard: false,
                filter: ['image'],
                view: 'mini',
                sources: ['native']
            },
            files: {
                type: 'hidden',
                label: "Data Store",
                defaultValue: "{}"
            },
        },

        packageID: '2E3636692001B28FC76F4F34DAC60A0730A2A13CF36A730A',




        /**
         * @var {Object} files memory based data store this will be persisted to the data store on save.
         */
        files: {},




        /**
         * @var {boolean} fileListOpen indicates the status of the file list
         */
        fileListOpen: false,




        /**
         * Constructor. Runs when the widget is first loaded.
         *
         * @method init
         */
        init: function() {
        }, //end init()




        /**
         * Event fired by the Site Controller.
         *
         * @event 'widget.live'
         * @return {void}
         */
        'widget.live': function(el, ev, data) {
            var widget = this;

            widget.element.html(
                widget.view('main.ejs')
            );

            widget.setIcon();
            widget.setTitles();
            widget.loadFiles()
            widget.renderFiles();
        }, // end widget.live()




        /**
         * Event fired by the Site Controller.
         * Tells the widget that the site is in Edit Mode.
         *
         * @event 'widget.edit'
         * @return {void}
         */
        'widget.edit': function(el, ev, data) {
            var widget = this;

            widget.element.html(
                widget.view('./widget.ejs')
            );

            widget.setIcon();
            widget.setTitles();
            widget.loadFiles()
            widget.renderFiles();

            var addFileButton = $('<button class="btn btn-primary">Add File</button>');
            var toolbar = widget.element.find('.folder-buttons');
            toolbar.append(addFileButton);

            addFileButton.on('click', function(ev) {
                $('.os_core:first').trigger('os.app.upload', {
                    "data": {
                        "upload_type": "asset",
                        "site_uuid": widget.options.site_uuid,
                        "focusApp": widget.element.closest('div.app_dialog'),
                        "callback": function(result) {
                            if (result.files && result.files.length) {
                                $.each(result.files, function(i, file) {
                                    widget.files[file.uuid] = {
                                        name: file.attachment.name,
                                        ext: file.attachment.file.mime.ext,
                                        url:file.external_url,
                                        datetime:file.attachment.updated
                                    };
                                });
                                widget.saveFiles()
                                widget.renderFiles();
                            }
                        }
                    }
                });
            });
        }, // end widget.edit()




        /**
         * Event fired by the Site Controller. 
         * Tells the widget that something has been changed during editing.
         *
         * @event 'widget.updated'
         * @return {void}
         */
        'widget.updated': function(el, ev, data) {
            var widget = this;

            widget.setIcon();
            widget.setTitles();
        }, //end widget.updated()



        /**
         * slide up/down the file list when the icon is clicked.
         * 
         * @return {void}
         */
        '.folder-icon {click}': function() {
            var widget = this;
            var fileListContainer = widget.element.find('.folder-filelist');

            if(widget.fileListOpen) {
                fileListContainer.slideUp("slow");
                widget.fileListOpen = false;
            } else {
                fileListContainer.slideDown("slow");
                widget.fileListOpen = true;
            }    
        }, // end folder-icon.click()



        /**
         * slide up/down the file list when the title is clicked.
         * 
         * @return {void}
         */
        '.folder-title {click}': function() {
            var widget = this;
            var fileListContainer = widget.element.find('.folder-filelist');

            if(widget.fileListOpen) {
                fileListContainer.slideUp("slow");
                widget.fileListOpen = false;
            } else {
                fileListContainer.slideDown("slow");
                widget.fileListOpen = true;
            }
            
        }, // end folder-title.click()



        /**
         * renders the file list.
         * 
         * @return {void}
         */
        renderFiles: function() {
            var widget = this;
            var fileListContainer = widget.element.find('.folder-filelist');
            var fileList = $('<ul></ul>');

            fileListContainer.empty();

            $.each(widget.files, function(uuid, file) {
                if(widget.files.hasOwnProperty(uuid) && file !== undefined) {
                    var icon = widget.getFileIcon(file.ext, null);

                    var fileListItem = $('<li></li>');
                    var fileListItemIcon = $('<div class="file-icon '+ $.EJS.clean(icon) +'"></div>');
                    var fileListItemLink = $('<a href="'+$.EJS.clean(file.url)+'">'+$.EJS.clean(file.name)+'</a>');
                    
                    if(widget.state === 'edit') {
                        fileListItemLink = $('<input type="text" value="'+$.EJS.clean(file.name)+'" />')
                    }

                    fileListItem.append(fileListItemIcon);
                    fileListItem.append(fileListItemLink);

                    if(widget.state === 'edit') {
                        var saveFileNameBtn = $('<div data-file-uuid="'+ $.EJS.clean(uuid) +'" class="action icon-save" title="Save Filename"></div>');
                        var fileListItemRemoveBtn = $('<div data-file-uuid="'+ $.EJS.clean(uuid) +'" class="action icon-remove" title="Remove File"></div>');

                        saveFileNameBtn.on('click', function(ev){
                            var fileUUID = $(this).attr('data-file-uuid');
                            widget.files[fileUUID].name = fileListItemLink.val();

                            widget.saveFiles();
                        });

                        fileListItemRemoveBtn.on('click', function(ev) {
                            var fileUUID = $(this).attr('data-file-uuid');

                            // remove file from data store
                            widget.files[fileUUID] = undefined;

                            // remove all events from file action button.
                            saveFileNameBtn.off();
                            fileListItemRemoveBtn.off();

                            widget.saveFiles();
                            widget.renderFiles();
                        });

                        fileListItem.append(saveFileNameBtn);
                        fileListItem.append(fileListItemRemoveBtn);
                    }

                    fileList.append(fileListItem);
                } // end if

            }); // end foreach
            
            fileListContainer.append(fileList);
        }, // end renderFiles()




        /**
         * get built in icon class based on files extionsion.
         * 
         * @param {string} ext   File extension without a preceding fullstop.
         * 
         * @param {callback} err Error callback this can be used to set a default icon on error.
         *                       Example: getFileIcon(obj, function(){return "error icon class"});
         * 
         * @return {string|null}
         */
        getFileIcon(ext, err) {
            if(typeof ext !== 'string') {
                return err('Expected Type of String');
            }

            switch(ext) {
                case 'jpg':  return 'os-icon-ext-jpg small';
                case 'png':  return 'os-icon-ext-png small';
                case 'txt':  return 'os-icon-ext-txt small';
                case 'mp4':  return 'os-icon-ext-video small';
                case 'pdf':  return 'os-icon-ext-pdf small';
                case 'zip':  return 'os-icon-ext-zip small';
                case 'xls':
                case 'xslx': return 'os-icon-ext-xls small';
                case 'doc':
                case 'docx': return 'os-icon-ext-doc small';
                case 'ppt':
                case 'pptx': return 'os-icon-ext-pptx small';
                
                default: return 'os-icon-ext small';
            }
        }, // end getMimeIcon()



        /**
         * set folder title 
         * 
         * @return {void}
         */
        setTitles: function() {
            var widget = this;
            var title = widget.element.find('.folder-title');
            title.text(widget.prefs.title.value);
            var subtitle = widget.element.find('.folder-subtitle');
            subtitle.text(widget.prefs.subtitle.value);
        }, // end setTitles()



        /**
         * set icon image
         * 
         * @return {void}
         */
        setIcon: function() {
            var widget = this;
            var icon = widget.element.find('.folder-icon');
            if(widget.prefs.folder_icon.value !== undefined && widget.prefs.folder_icon.value !== '') {
                icon.attr('src', widget.prefs.folder_icon.value);
            }
        }, // end setIcon()



        /**
         * load the file data from the data store
         * 
         * @return {void}
         */
        loadFiles: function() {
            var widget = this;
            widget.files = JSON.parse(widget.prefs.files.value);
        }, // end loadFiles()



        /**
         * save the file data to the data store
         * 
         * @return {void}
         */
        saveFiles: function() {
            var widget = this;

            widget.prefs.files.value = JSON.stringify(widget.files);
            var editor_panel = widget.element.closest('.sites_core').find('ol.sites-editor-prefs-list:eq(1)');
            var files_pref = editor_panel.find("input[name='files']");
            files_pref.val(JSON.stringify(widget.files));
            console.log(JSON.stringify(widget.files));
        }, // end saveFiles()




    }); // end Com.Frog.Controllers.Widget

}); // end promise
