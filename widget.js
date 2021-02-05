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
               "defaultValue": "Folder Title",
               "placeholder": "Type your folder title here"
            },
            subtitle: {
               "type": "text",
               "label": "Folder Subtitle",
               "defaultValue": "subtitle",
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
                type: 'textarea',
                label: "Data Store",
                defaultValue: "{}"
            },
        },

        packageID: '2E3636692001B28FC76F4F34DAC60A0730A2A13CF36A730A',

        baseUrl: null,
        dataStoreUUID: null,
        files: {},
        fileListOpen: false,

        iconClasses: {
            'pdf': 'os-icon-ext-pdf small',
            'jpg': 'os-icon-ext-jpg small',
        },

        /**
         * Constructor. Runs when the widget is first loaded.
         *
         * @method init
         */
        init: function() {
            var widget = this;
            
            widget.baseURL = Frog.Utilities.getBaseUrl();
            if(widget.options.siteType === 'preview') {
                widget.baseURL = widget.baseURL + 
                    '/app/staging/widget/2E3636692001B28FC76F4F34DAC60A0730A2A13CF36A730A';
            }
        }, //end init()

        /**
         * Event fired by the Site Controller.
         *
         * @event 'widget.live'
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
         * Event fired by the Site Controller. Tells the widget that the site is in Edit Mode.
         *
         * @event 'widget.edit'
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
            var toolbar = widget.element.find('#folder-buttons');
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
         * Event fired by the Site Controller. Tells the widget that something has been changed during editing.
         *
         * @event 'widget.updated'
         */
        'widget.updated': function(el, ev, data) {
            var widget = this;
            
            widget.setIcon();
            widget.setTitles();
        }, //end widget.updated()

        '#folder {click}': function() {
            var widget = this;
            var fileListContainer = widget.element.find('#folder-filelist');

            if(widget.fileListOpen) {
                fileListContainer.slideUp("slow");
                widget.fileListOpen = false;
            } else {
                fileListContainer.slideDown("slow");
                widget.fileListOpen = true;
            }
            
        },

        renderFiles: function() {
            var widget = this;
            var fileListContainer = widget.element.find('#folder-filelist');
            var fileList = $('<ul></ul>');

            fileListContainer.empty();

            $.each(widget.files, function(uuid, file) {
                var fileListItem = $('<li></li>');
                var fileListItemIcon = $('<div class="file-icon '+ widget.iconClasses[file.ext] +'"></div>');
                var fileListItemLink = $('<a href="'+file.url+'">'+file.name+'</a>');
                fileListItem.append(fileListItemIcon);
                fileListItem.append(fileListItemLink);

                if(widget.state === 'edit') {
                    var fileListItemRemoveBtn = $('<div id="'+uuid+'" class="file-remove"><i class="ff-cross-mono"></i></div>');

                    fileListItemRemoveBtn.on('click', function(ev) {
                        var fileUUID = $(this).attr('id');
                        delete widget.files[fileUUID]

                        widget.saveFiles()
                        widget.renderFiles();
                    });

                    fileListItem.append(fileListItemRemoveBtn);
                }
                
                fileList.append(fileListItem);
            });
            
            fileListContainer.append(fileList);
        }, // end renderFiles()

        setTitles: function() {
            var widget = this;
            var title = widget.element.find('#folder-title');
            title.text(widget.prefs.title.value);
            var subtitle = widget.element.find('#folder-subtitle');
            subtitle.text(widget.prefs.subtitle.value);
        }, // end setTitles()

        setIcon: function() {
            var widget = this;
            var icon = widget.element.find('#folder-icon');
            if(widget.prefs.folder_icon.value === undefined || widget.prefs.folder_icon.value === '') {
                icon.attr('src', widget.baseURL+'/assets/folder.png');
            } else {
                icon.attr('src', widget.prefs.folder_icon.value);
            }
        }, // end setIcon()

        loadFiles: function() {
            var widget = this;
            widget.files = JSON.parse(widget.prefs.files.value);
        }, // end loadFiles()

        saveFiles: function() {
            var widget = this;

            widget.prefs.files.value = JSON.stringify(widget.files);
            var editor_panel = widget.element.closest('.sites_core').find('ol.sites-editor-prefs-list:eq(1)');
            var files_pref = editor_panel.find("textarea[name='files']");
            files_pref.val(JSON.stringify(widget.files))

        }, // end saveFiles()

    });
});
