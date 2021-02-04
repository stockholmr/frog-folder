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
               "defaultValue": "",
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
            }
        },

        packageID: '2E3636692001B28FC76F4F34DAC60A0730A2A13CF36A730A',

        dataStoreUUID: null,
        files: [],

        /**
         * Constructor. Runs when the widget is first loaded.
         *
         * @method init
         */
        init: function() {
            var widget = this;
            widget.loadFiles(); 
        },

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

            var icon = widget.element.find('#folder-icon');
            icon.attr('src', this.prefs.folder_icon.value);

            var title = widget.element.find('#folder-title');
            title.text(this.prefs.title.value);

            var subtitle = widget.element.find('#folder-subtitle');
            subtitle.text(this.prefs.subtitle.value);

        },

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

            var addFileButton = $('<button class="primary">Add File</button>');
            var toolbar = widget.element.find('#folder-admin');
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
                                    widget.files.push({
                                        uuid: file.uuid,
                                        name: file.attachment.name,
                                        ext: file.attachment.file.mime.ext,
                                        url:file.external_url,
                                        dadded:file.attachment.updated
                                    });
                                });
                                widget.saveFiles();
                            }
                        }
                    }
                });
            });
            
            

        },

        /**
         * Event fired by the Site Controller. Tells the widget that something has been changed during editing.
         *
         * @event 'widget.updated'
         */
        'widget.updated': function(el, ev, data) {
            var widget = this;

            var icon = widget.element.find('#folder-icon');
            icon.attr('src', this.prefs.folder_icon.value);

            var title = widget.element.find('#folder-title');
            title.text(this.prefs.title.value);

            var subtitle = widget.element.find('#folder-subtitle');
            subtitle.text(this.prefs.subtitle.value);
        },


        loadFiles: function() {
            var widget = this;
            FrogOS.fdp({
                url: 'datastore/get',
                type: 'GET',
                path: '/api/fdp/2/',
                data: {
                    target_uuid: widget.options.content_uuid,
                    alias: 'files'
                }
            }).done(function(response) {
                console.log(response);
                if(response.status === 'ok' && response.response.length) {
                    widget.files = response.response;
                }
            });
        },

        saveFiles: function() {
            var widget = this;
            FrogOS.fdp({
                url: 'datastore/create',
                type: 'POST',
                path: '/api/fdp/2/',
                data: {
                    target_uuid: widget.options.content_uuid,
                    data: widget.files,
                    alias: 'files',
                }
            }).done(function(response) {
                console.log(response);
            });
        },
    });
});
