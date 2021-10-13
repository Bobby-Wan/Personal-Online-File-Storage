//ADD drag and drop files (extra)

var current_directory = '/';
var allowedFileTypes = [];

function showMessage(message, isAlert){
  const userMessage = document.getElementById('user-message');
  if(!userMessage){
    console.error('Could not find message element');
    return;
  }
  if(isAlert){
    userMessage.style.background = 'salmon';
  }
  else{
    userMessage.style.background = 'greenyellow';
  }

  userMessage.style.visibility = 'visible';
  userMessage.innerHTML = message;

  setTimeout(()=>{
    userMessage.style.visibility = 'hidden';
  }, 3000);
}

const selectFiles = () => {
  let input = document.getElementById('file-upload-input');

  if(!input){
    showMessage('Problem with selecting file');
    return;
  }

  input.click();
}

const uploadFiles = () => {
  let input = document.getElementById('file-upload-input');

  if(!input || !input.files[0]){
    showMessage('Please select files to upload');
    return;
  }

  var xhr = new XMLHttpRequest(),
      fd = new FormData();
  
  const files = input.files;

  for(let i=0;i<files.length;++i) {
      fd.append("uploads", files[i]);
  }
  showMessage('Sending Files');
  xhr.onload = (response)=>{
    if(xhr.response.code && xhr.response.code === 0){
      showMessage('Files uploaded!');
    }
  }
  xhr.open('POST', `/upload-files?dir=${current_directory}`, true );
  xhr.send(fd);
}

function escapeSelector(s){
  return s.replace( /(:|\.|\[|\])/g, "\\$1" );
}

const uploadButtonClicked = () =>{
  document.getElementById("file-upload-form").submit();
}

function colorDirectories(){
  let links = document.getElementsByName('file-link');
  links.forEach(x=>{
    if(x.dataset.type === '1'){
      console.log('dir');
      x.style.background = 'lightgreen';

    }
    else{
      x.style.background = 'lightblue';
    }
  });
}

const setupFileLinks = ()=>{
  let fileLinks = document.getElementsByName('file-link');
  fileLinks.forEach((link)=>{
    link.addEventListener('dblclick', function(e){
        let a = document.createElement('a');
        a.href = `/download?filepath=${current_directory}${link.innerHTML}`;
        a.click();
    });
  });
};

window.onload = ()=>{
  setupFileLinks();
  setActiveDirectory('/');
  colorDirectories();
 };

$(function() {
  $.contextMenu({
      selector: '.context-menu', 
      callback: function(key, options) {
          handleMenuAction(key, options);
      },
      items: {
          "sep1": "---------",
          "open": {name: "Open", icon: "open"},
          "rename":{name:"Rename"},
          "delete": {name: "Delete", icon: "delete"},
          "sep2": "---------"
      }
  });
    
});

function rename(id, newName){
  if($("#"+ escapeSelector(id)).length === 0){
    showMessage('Invalid file to rename.', true);
    return;
  }

  //ADD better error handling
  $.post(`/rename?path=${current_directory}`, {'oldName':id,'newName':newName}, function(data){
    if(data && data.hasOwnProperty('code') && data.code === 0){
      $('#'+id).attr('id', newName);
      $('#'+newName).text(newName);
    }
  },"json").fail(function(response){
    console.log('error');
    console.log(response);
  });
}

function base64ToArrayBuffer(data) {
  var binaryString = window.atob(data);
  var binaryLen = binaryString.length;
  var bytes = new Uint8Array(binaryLen);
  for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
  }
  return bytes;
};

async function open(id){
  let clickedElement = $("#"+escapeSelector(id))
  if(clickedElement.length === 0){
    showMessage('Could not locate file.', true);
    return;
  }

  let url = `/open?path=${current_directory}${id}`;
  let fileType = clickedElement.data('type');
  if(fileType === 1){
    url = url.concat('&isDirectory=true');
  }
  
  fetch(url, {
    method:'GET'
  })
  .then(async response => {
    //not directory
    if(fileType === '0'){
      let fileData = await response.text();
      let arrayBuffer = base64ToArrayBuffer(fileData);
      let blob = new Blob([arrayBuffer], {
        //MODIFY for all formats
        type: response.headers.get('content-type')
      });
      var url = window.URL || window.webkitURL;
      let bloburl = url.createObjectURL(blob);
  
      let a = document.createElement('a');
      a.href = bloburl;
      a.target = '_blank';
      a.click();
      url.revokeObjectURL(bloburl);
      a.remove();
    }
    //directory
    else{
      if(response.status === 200){
        let files = await response.json();

        $('#main-container').remove('.file-links');
        for(let i=0;i<files.length;++i){
          let a = $(`<a id='${file[i].name}' name='file-link' data-type='${file[i].type}' class="link-type${file[i].type} btn btn-primary click-button context-menu">${file[i].name}</a>`);
          $('#main-container').append(a);
        }
      }
      else{

      }
    }
    
  });
}

function handleMenuAction(action, options){
  if(options.$trigger && options.$trigger.length>0 && options.$trigger[0].id){
    switch(action){
      case 'rename':
        let newName = prompt('New name:');
        if(newName){
          if($('#'+newName).length > 0){
            alert('File name already exists in this directory');
            return;
          }
          rename(options.$trigger[0].id, newName);
        }
        break;
      case 'open':
        open(options.$trigger[0].id);
        break;
      case 'delete':
        deleteFile(options.$trigger[0].id);
        break;
      default:
        return;
    }
  }
}

function setActiveDirectory(newDirectory){
  if(!newDirectory){
    console.log('invalid new active directory');
  }
  current_directory = newDirectory;
  $('#active-directory').html(newDirectory);
}


async function deleteFile(id){
  if($("#"+escapeSelector(id)).length === 0){
    showMessage('Could not locate file.', true);
    return;
  }
  let options = {
    path: current_directory+id
  };
  let bodyString = JSON.stringify(options);

  fetch('/delete', {
    method:'POST',
    headers:{
      'content-type':'application/json'
    },
    body:bodyString
  })
  .then(async response => {
    let res;
    try{
      res = await response.json();
    }
    catch(err){
      showMessage('Something went wrong. Try reloading page.', true);
      return;
    }
    if(res && res.message){
      if(res.code === 0){
        showMessage(res.message, false);
        $("#"+escapeSelector(id)).remove();
      }
      else{
        showMessage(res.message, true);
      }
    }
  });
}

function createDirectory(){
  let name = prompt('Name');

  if(!name){
    showMessage('Invalid directory name', true);
    return;
  }

  let options = {
    path: current_directory+name
  };
  fetch('/create?directory=false',{
    method:'POST',
    headers:{
      'content-type':'application/json'
    },
    body:JSON.stringify(options)
  })
  .then(async response =>{
    if(response.status === 200){
      let a = $(`<a id='${name}' name='file-link' data-type='1' class=" link-type2 btn btn-primary click-button context-menu">${name}</a>`);
      $('#main-container').append(a);
    }
    else{
      //ADD cases
      showMessage('Directory not created', true);
    }
  });
}
