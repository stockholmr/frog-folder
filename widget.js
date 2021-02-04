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
        /**
         * Constructor. Runs when the widget is first loaded.
         *
         * @method init
         */
        init: function() {},

        /**
         * Event fired by the Site Controller.
         *
         * @event 'widget.live'
         */
        'widget.live': function(el, ev, data) {
            this.element.html(
                this.view('main.ejs')
            );
        },

        /**
         * Event fired by the Site Controller. Tells the widget that the site is in Edit Mode.
         *
         * @event 'widget.edit'
         */
        'widget.edit': function(el, ev, data) {
            this.element.html(
                this.view('./widget.ejs')
            );
        },

        /**
         * Event fired by the Site Controller. Tells the widget that something has been changed during editing.
         *
         * @event 'widget.updated'
         */
        'widget.updated': function(el, ev, data) {}
    });
});
