markdownEditorState = {
    WRITE: 0,
    PREVIEW: 1,
    HISTORY: 2,
}

Dropzone.autoDiscover = false;
document.addEventListener('DOMContentLoaded', function(event) {     
    if (document.cookie && document.cookie !== '') {
        var value = "; " + document.cookie;
        var parts = value.split("; " + 'csrftoken' + "=");
        if (parts.length == 2) {
            markdownME.csrftoken = parts.pop().split(";").shift();
        }
    }
    var editors = document.querySelectorAll('div.markdownme-widget');
    for (var i = 0; i < editors.length; i++) {
        var editor = editors[i];
        editor.textarea = editor.querySelector('.markdownme-textarea');
        editor.preview = editor.querySelector('.markdownme-preview');
        editor.currentState = markdownEditorState.WRITE;
        var markdownId = document.getElementsByName('markdown_identifier')[i].value;
        if (markdownME.fileUploadAllowed === true) {
            editor.dropzone = editor.querySelector('.dropzone');
            editor.dropzone = new Dropzone(editor.dropzone, { url: markdownME.uploadUrl });
            editor.dropzone.options.autoProcessQueue = true;
            editor.dropzone.options.uploadMultiple = false;
            editor.dropzone.options.parallelUploads = 5;
            editor.dropzone.options.maxFilesize = markdownME.maxFilesize;
            editor.dropzone.options.maxFiles = markdownME.maxFiles;
            editor.dropzone.options.maxThumbnailFilesize = 10;
            editor.dropzone.options.acceptedFiles = markdownME.allowedFileTypes;
            editor.dropzone.options.addRemoveLinks = true;
            editor.dropzone.options.params = { markdown_identifier: markdownId };
            editor.dropzone.options.headers = { 'X-CSRFToken': markdownME.csrftoken };
            editor.dropzone.on('removedfile', function(file) {
                var request = new XMLHttpRequest();
                request.open('POST', markdownME.deleteUrl, true);
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                request.setRequestHeader("X-CSRFToken", markdownME.csrftoken);
                request.send('filename='+file.previewElement.querySelector('[data-dz-name]').innerHTML+'&markdown_identifier='+markdownId);
            });
            editor.dropzone.on('complete', function(file) {
                file.previewElement.addEventListener('click', function() {
                    // file.name could be used here, but its the original uploaded file name, and this can be changed by the server
                    editor.insertMarkdownLink(file.previewElement.querySelector('[data-dz-name]').innerHTML, file.markdownLink);
                });
            });
            editor.dropzone.on('success', function(file, data) {
                var returnedFileUrl = data.url;
                file.previewElement.querySelector('[data-dz-name]').innerHTML = returnedFileUrl.substring(returnedFileUrl.lastIndexOf('/')+1);
                file.markdownLink = returnedFileUrl;

            });
            
            var requestFiles = new XMLHttpRequest();
            requestFiles.open('GET', markdownME.fileListUrl + '?markdown_identifier='+markdownId, true);
            requestFiles.onload = function() {
                if (requestFiles.status >= 200 && requestFiles.status < 300) {
                    var data = JSON.parse(requestFiles.responseText);
                    for(var i = 0; i < data.files.length; i++)
                    {
                        var file = data.files[i];
                        var mockFile = {name: file.url.substring(file.url.lastIndexOf('/')+1), size: file.size}; 
                        editor.dropzone.emit('addedfile', mockFile);
                        editor.dropzone.createThumbnailFromUrl(mockFile, file.url);
                        editor.dropzone.emit('complete', mockFile);
                        mockFile.markdownLink = file.url;
                    }
                }
            };
            requestFiles.send();   
        }
        
        if (markdownME.historyAllowed) {
            editor.history = editor.querySelector('.markdownme-history');
            var requestHistory = new XMLHttpRequest();
            requestHistory.open('GET', markdownME.historyUrl + '?markdown_identifier=' + markdownId, true);
            requestHistory.onload = function() {
                if (requestHistory.status >= 200 && requestHistory.status < 300) {
                    var data = JSON.parse(requestHistory.responseText);
                    var list = editor.querySelector('.markdownme-toolbar-history-select');
                    editor.historyEntries = [];
                    for (var i = 0; i < data.entries.length; i++) {
                        var entry = data.entries[i];
                        var node = document.createElement('option');
                        node.setAttribute('value', i);
                        node.appendChild(document.createTextNode(entry['date']));
                        list.appendChild(node);
                        editor.historyEntries[i] = entry['text'];
                    }
                    if (editor.historyEntries.length === 0) {
                        editor.historyAvailable = false;
                        
                    }
                    else {
                        editor.historyAvailable = true;
                    }
                } 
                else {
                    editor.historyAvailable = false;
                }
                
                if (editor.historyAvailable === false) {
                    editor.querySelector('.markdownme-toolbar-history-select').classList.add('markdownme-hidden'); 
                    editor.querySelector('.markdownme-toolbar-button-revert').classList.add('markdownme-hidden');
                    editor.querySelector('.markdownme-toolbar-button-history').classList.add('markdownme-hidden');
                }
            };
            requestHistory.send();
            
            editor.changeEditingState = function(state) {
                var historySelect = editor.querySelector('.markdownme-toolbar-history-select'); 
                var historyRevert = editor.querySelector('.markdownme-toolbar-button-revert');
                var historyButton = editor.querySelector('.markdownme-toolbar-button-history');
                var previewButton = editor.querySelector('.markdownme-toolbar-button-preview');
                if (markdownME.fileUploadAllowed === true) {
                    var dropzone = editor.querySelector('.dropzone');
                }
                editor.currentState = state;
                switch(state)
                {
                    case markdownEditorState.WRITE:
                    {
                        editor.preview.classList.add('markdownme-hidden');
                        editor.textarea.classList.remove('markdownme-hidden');
                        editor.history.classList.add('markdownme-hidden');
                        historySelect.classList.add('markdownme-hidden');
                        historyRevert.classList.add('markdownme-hidden');
                        historyButton.classList.remove('markdownme-toolbar-button-selected');
                        previewButton.classList.remove('markdownme-toolbar-button-selected');
                        if (markdownME.fileUploadAllowed === true) {
                            dropzone.classList.remove('markdownme-hidden');
                        }
                        break;
                    }
                    case markdownEditorState.PREVIEW:
                    {
                        editor.preview.classList.remove('markdownme-hidden');
                        editor.textarea.classList.add('markdownme-hidden');
                        editor.history.classList.add('markdownme-hidden');
                        historySelect.classList.add('markdownme-hidden');
                        historyRevert.classList.add('markdownme-hidden');
                        historyButton.classList.remove('markdownme-toolbar-button-selected');
                        previewButton.classList.add('markdownme-toolbar-button-selected');
                        if (markdownME.fileUploadAllowed === true) {
                            dropzone.classList.add('markdownme-hidden');
                        }
                        break;
                    }
                    case markdownEditorState.HISTORY:
                    {
                        editor.preview.classList.add('markdownme-hidden');
                        editor.textarea.classList.add('markdownme-hidden');
                        editor.history.classList.remove('markdownme-hidden');
                        historySelect.classList.remove('markdownme-hidden');
                        historyRevert.classList.remove('markdownme-hidden');
                        historyButton.classList.add('markdownme-toolbar-button-selected');
                        previewButton.classList.remove('markdownme-toolbar-button-selected');
                        if (markdownME.fileUploadAllowed === true) {
                            dropzone.classList.add('markdownme-hidden');
                        }
                        break;
                    }
                }
            }
            
            editor.diffHistory = function() {
                if (editor.historyEntries.length === 0)
                    return
                    
                var historyTextDiv = editor.querySelector('.markdownme-history-previous');
                var currentText = editor.textarea.value.replace(/\r/g, '');
                var historyText = editor.historyEntries[editor.querySelector('.markdownme-toolbar-history-select').value].replace(/\r/g, '');
                if (markdownME.twoPaneHistory) {
                    var currentTextDiv = editor.querySelector('.markdownme-history-current');
                    currentTextDiv.innerHTML = currentText.replace(/\r?\n/g, '<br>');
                }
                var differ = new Diff();
                var diff = differ.diff_main(currentText, historyText);
                differ.diff_cleanupSemantic(diff);
                historyTextDiv.innerHTML = differ.diff_prettyHtml(diff);
            }
        
            editor.querySelector('.markdownme-toolbar-button-history').addEventListener('click', function() {
                if (editor.currentState != markdownEditorState.HISTORY)
                {
                    editor.changeEditingState(markdownEditorState.HISTORY);
                    editor.diffHistory();
                }
                else
                {
                    editor.changeEditingState(markdownEditorState.WRITE);
                }
            });
        
                    
            editor.querySelector('.markdownme-toolbar-button-revert').addEventListener('click', function() {
                editor.textarea.value = editor.historyEntries[editor.querySelector('.markdownme-toolbar-history-select').value];
                editor.changeEditingState(markdownEditorState.WRITE);
            });
            
                    
            if (markdownME.twoPaneHistory) {
                editor.querySelector('.markdownme-history-current').addEventListener('scroll', function() {
                    var currentDiv = editor.querySelector('.markdownme-history-current');
                    var historyDiv = editor.querySelector('.markdownme-history-previous');
                    historyDiv.scrollTop = historyDiv.scrollHeight * currentDiv.scrollTop / currentDiv.scrollHeight;
                });
            }
            
            editor.querySelector('.markdownme-toolbar-history-select').addEventListener('change', function() {
                editor.diffHistory();
            });
        } 
        else {
            editor.historyAvailable = false;
            editor.changeEditingState = function(state) {
                var previewButton = editor.querySelector('.markdownme-toolbar-button-preview');
                if (markdownME.fileUploadAllowed === true) {
                    var dropzone = editor.querySelector('.dropzone');
                }
                editor.currentState = state;
                switch(state)
                {
                    case markdownEditorState.WRITE:
                    {
                        editor.preview.classList.add('markdownme-hidden');
                        editor.textarea.classList.remove('markdownme-hidden');
                        previewButton.classList.remove('markdownme-toolbar-button-selected');
                        if (markdownME.fileUploadAllowed === true) {
                            dropzone.classList.remove('markdownme-hidden');
                        }
                        break;
                    }
                    case markdownEditorState.PREVIEW:
                    {
                        editor.preview.classList.remove('markdownme-hidden');
                        editor.textarea.classList.add('markdownme-hidden');
                        previewButton.classList.add('markdownme-toolbar-button-selected');
                        if (markdownME.fileUploadAllowed === true) {
                            dropzone.classList.add('markdownme-hidden');
                        }
                        break;
                    }
                    case markdownEditorState.HISTORY:
                    {
                        break;
                    }
                }
            }
        }
        
        
        editor.insertMarkdownLink = function(fileName, markdownLink) {
            if (markdownLink) {
                var extension = markdownLink.substr(markdownLink.lastIndexOf('.') + 1);
                if (extension === 'png' || extension === 'bmp' || extension === 'gif' || extension === 'jpg' || extension === 'jpeg' || extension === 'ico')
                    editor.insertAroundSelection('', '![' + fileName + '](' + markdownLink + ')');
                else
                    editor.insertAroundSelection('', '[' + fileName + '](' + markdownLink + ')');
            }
        }
        
        editor.insertAroundSelection = function(beforeValue, afterValue) {
            if (editor.textarea.selectionStart || editor.textarea.selectionStart == '0') {
                var startPos = editor.textarea.selectionStart;
                var endPos = editor.textarea.selectionEnd;
                var isFirefox = typeof InstallTrigger !== 'undefined';
                
                if (isFirefox) {
                    editor.textarea.value = editor.textarea.value.substring(0, startPos)
                        + beforeValue
                        + editor.textarea.value.substring(startPos, endPos)
                        + afterValue
                        + editor.textarea.value.substring(endPos, editor.textarea.value.length);
                    editor.textarea.dispatchEvent(new Event('change', { 'bubbles': true }))
                }
                else {
                    editor.textarea.focus();
                    document.execCommand("insertText", false, beforeValue + editor.textarea.value.substring(startPos, endPos) + afterValue);
                }
                
                editor.textarea.selectionStart = endPos + beforeValue.length + afterValue.length;
                editor.textarea.selectionEnd = editor.textarea.selectionStart;
                // nasty solution for a link template insertion, but saves defining another function
                if (afterValue === '](http://)') {
                    editor.textarea.selectionStart -= 1;
                    editor.textarea.selectionEnd -= 1;
                }
            } else {
                editor.textarea.value += beforeValue + afterValue;
            }
            
            //blur and focus to trigger history buffer update, not working on all browsers though
            if (! (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)) { 
                editor.textarea.blur();
                editor.textarea.focus();
            }
        };
        
        editor.insertList = function(isOrdered) {
            if (editor.textarea.selectionStart || editor.textarea.selectionStart == '0') {
                var startLinePosition = editor.textarea.value.substring(0, editor.textarea.selectionStart).lastIndexOf('\n') + 1;
                var selectedText = editor.textarea.value.substring(startLinePosition, editor.textarea.selectionEnd);
                var newText = selectedText;
                if (isOrdered === true) {
                    newText = '1. ' + newText;
                    var counter = 1;
                    newText = newText.replace(/\n/g, function() { 
                        return '\n' + ++counter + '. ';
                    });
                }
                else {
                    newText = '- ' + newText;
                    newText = newText.replace(/\n/g, '\n- ');
                }

                var isFirefox = typeof InstallTrigger !== 'undefined';
                
                if (isFirefox) {
                    editor.textarea.value = editor.textarea.value.substring(0, startLinePosition)
                        + newText
                        + editor.textarea.value.substring(startLinePosition + newText.length, editor.textarea.value.length);
                    editor.textarea.dispatchEvent(new Event('change', { 'bubbles': true }))
                }
                else {
                    editor.textarea.focus();
                    editor.textarea.selectionStart = startLinePosition;
                    editor.textarea.selectionEnd = startLinePosition + selectedText.length;
                    document.execCommand("insertText", false, newText);
                }
                
                editor.textarea.selectionStart = startLinePosition + newText.length;
                editor.textarea.selectionEnd = editor.textarea.selectionStart;
            }
            
            //blur and focus to trigger history buffer update, not working on all browsers though
            if (! (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)) { 
                editor.textarea.blur();
                editor.textarea.focus();
            }
        }
        
        editor.toolbarHotkeyHandler = function(e) {
            if (document.activeElement === editor.textarea && e.ctrlKey && !e.altKey && !e.shiftKey) {
                switch (e.keyCode)
                {
                    // CTRL + B
                    case 66:
                        editor.insertAroundSelection('**', '**');
                        break;
                    // CTRL + I
                    case 73:
                        editor.insertAroundSelection('_', '_');
                        break;
                }
            }
        };
        editor.addEventListener('keyup', editor.toolbarHotkeyHandler, false);
        
        editor.querySelector('.markdownme-toolbar-button-bold').addEventListener('click', function() {
            editor.insertAroundSelection('**', '**');
        }, false);
        
        editor.querySelector('.markdownme-toolbar-button-italic').addEventListener('click', function() {
            editor.insertAroundSelection('_', '_');
        }, false);
        
        editor.querySelector('.markdownme-toolbar-button-unordered-list').addEventListener('click', function() {
            editor.insertList(false);
        }, false);
        
        editor.querySelector('.markdownme-toolbar-button-ordered-list').addEventListener('click', function() {
            editor.insertList(true);
        }, false);
        
        editor.querySelector('.markdownme-toolbar-button-link').addEventListener('click', function() {
            editor.insertAroundSelection('[', '](http://)');
        }, false);
        
        editor.querySelector('.markdownme-toolbar-button-preview').addEventListener('click', function() {
            if (editor.currentState != markdownEditorState.PREVIEW)
            {
                var converter = new showdown.Converter({strikethrough: 'true'});
                if (markdownME.iframePreview) {
                    var previewContainer = editor.querySelector('.markdownme-preview');
                    var oldIframe = editor.querySelector('.markdownme-preview-iframe');
                    //recreate the iframe in case of redirection in the preview
                    previewContainer.removeChild(oldIframe);
                    var iframe = document.createElement("iframe");
                    iframe.classList = oldIframe.classList;
                    if (markdownME.safePreview) {
                        iframe.setAttribute("sandbox", "allow-same-origin");
                    }
                    previewContainer.appendChild(iframe);
                    //iframe.srddoc not supported by IE, hence the write method
                    iframe.contentWindow.document.open();
                    iframe.contentWindow.document.write(converter.makeHtml(editor.textarea.value));
                    iframe.contentWindow.document.close();
                } 
                else {
                    var previewDiv = editor.querySelector('.markdownme-preview-div');
                    previewDiv.innerHTML = converter.makeHtml(editor.textarea.value);
                }
                editor.changeEditingState(markdownEditorState.PREVIEW);
            }
            else
            {
                editor.changeEditingState(markdownEditorState.WRITE);
            }
        }, false);
    }        
});