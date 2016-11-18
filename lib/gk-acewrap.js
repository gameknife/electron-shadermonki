/**
 * Created by kaimingyi on 2016/11/18.
 */
const fs = require('fs-promise');
const Promise = require("bluebird");
const path = require("path");

class AceEditorWindow {
    constructor( elementId )
    {
        this.elementToken = elementId;

        {
            let container = document.getElementById(this.elementToken);
            let title = container.previousElementSibling;
            if(title === null)
            {
                title = container.nextElementSibling;
            }
            if(title !== null)
            {
                this.elementTitle = title;
            }
        }

        this.editor = ace.edit(elementId);
        this.editor.setTheme('ace/theme/twilight');
        let GLSLMode = ace.require("ace/mode/glsl").Mode;
        this.editor.session.setMode(new GLSLMode());
        this.callback = null;
        this.autoUpdate = true;

        this.editingFiletoken = "";

        let ref = this;


        this.loadCoroutine = Promise.coroutine(function* (url) {
            let source = yield fs.readFile(url);
            if (source === null) {
                console.warn('error : ' + err);
                return;
            }
            let text = source.toString();
            ref.editor.setValue(text);
            ref.editor.clearSelection();

            ref.elementTitle.textContent = path.basename(url);

        });

        this.saveCoroutine = Promise.coroutine(function* (url) {
            yield fs.writeFile(url, ref.editor.getValue());
        });

        // intereaction intialize

        // change

        this.editor.getSession().on('change', function(e) {
            let text = ref.editor.getValue();
            if(ref.callback != null)
            {
                ref.callback(text);
            }
            ref.elementTitle.className = 'title-bar-modify';
        });

        this.editor.commands.addCommand({
            name: 'save to',
            bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
            exec: function(editor) {
                ref.saveFile();
            },
            readOnly: true // false if this command should not apply in readOnly mode
        });


        // drop
        let holder = document.getElementById(elementId);
        holder.ondrop = function( ev ) {

            ev.preventDefault();
            var filetoken = ev.dataTransfer.getData("restoken");

            let type = 0;
            let resobj = resMgr.gResmgr.get_res(filetoken);
            if( resobj !== null )
            {
                type = resobj.get_type();

                if(type === resMgr.RESTYPE.TEXT)
                {
                    // save and load

                    // save
                    ref.saveFile();

                    // load coroutine
                    ref.loadFile(resobj.filetoken);
                }
            }
        }

        holder.ondragover = function (ev) {
            ev.preventDefault();
        }
    }

    loadFile(filetoken)
    {
        this.editingFiletoken = filetoken;
        this.loadCoroutine(this.editingFiletoken);
    }

    saveFile() {
        this.saveCoroutine(this.editingFiletoken);
        this.elementTitle.className = 'title-bar-saved';
    };


    autoUpdate( isAuto )
    {

    }

    setChangeCallback( callbackfun )
    {
        this.callback = callbackfun;
    }
}

module.exports = { AceEditorWindow };