var main_SCANURLS=null;
var main_filesloaded=0;
function _run(){
	//load necessary files and then start main routine delayed
	
	main_files2load=4;
	loadjs("scanlist.js");
	loadjs("settings.js");
	loadjs("target.js")
	loadjs("scanner.js");
	
	timed_run()
}

function timed_run(){
	if (main_filesloaded < main_files2load){
		//waiting for all scripts to load
		setTimeout("timed_run()",100);
	}else{
		if (scanlist_isloaded==0){ //we need to retrieve urls
			scanlist_init()
			setTimeout("timed_run()",100);
		}else{
			if(scanlist_isloaded==-1){ //loading
				setTimeout("timed_run()",100);
			}else{
				//libraries loaded, urllist loaded, time to go
				_scan(settings_range);
			}
		}
	}
}



function loadjs(filename){
  var fileref=document.createElement('script')
  fileref.setAttribute("type","text/javascript")
  fileref.setAttribute("src", filename)
  document.getElementsByTagName("body")[0].appendChild(fileref)
}


//triggers everything
_run();


