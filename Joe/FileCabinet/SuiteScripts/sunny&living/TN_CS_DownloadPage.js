window.onload = function(){
    document.getElementById("fileloader").onload = function(e){
        var errorMsg = this.contentWindow.document.getElementById("errorMsg");
        if(errorMsg){
            alert(errorMsg.innerHTML);
        }
    };
    document.getElementById("download").onclick = function (e){
        document.getElementById("fileloader").src = this.getAttribute("data-link");
    };
}

window.onunload = function(e){
    var newURL = document.getElementById("download").getAttribute("data-link").replace("download", "removecache");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", newURL);
    xhr.send();
}