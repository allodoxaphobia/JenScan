var scanner_targets=[];
var scanner_result=[];
var scanner_worklist=0;
var scanner_starttime;

function _scan(classc_subnet,scanurls){
	scanner_starttime = _getTimeSecs();
	
	for (var x=1; x< 255; x++){
		scanner_targets.push(new target(x-1,classc_subnet + x,scanlist_loadurls(),target_callback));
		scanner_targets[scanner_targets.length-1].Scan();
		scanner_worklist=scanner_worklist+1;
	}
	
	showlog();
}

function target_callback(id,lsip,liresult,lstype,loScanlistItem){
	if (scanner_targets[id]==null){return false;}
	var newbatch=[];
	
	switch(lstype){	
		case "DEAD":
			killtarget(id);
			break;
		case "HIT":
			overwriteresult(lsip + '|' + loScanlistItem["LABEL"]);
			if (loScanlistItem["DEPTRIGGER"]!=1){killtarget(id);}
			break;
		case "UNKNOWN":
			overwriteresult(lsip + '|UNKNOWN');
			break;
		case "DONE":
			overwriteresult(lsip + '|UNKNOWN');
			killtarget(id);
			break;
	}
}


function prepnewbatch(id, newbatch){
	scanner_targets[id].append(newbatch);
}

function killtarget(id){
	scanner_targets[id]=null;
	scanner_worklist=scanner_worklist-1;
}

function showlog(){

	console.clear();
	
	var runtime =  _getTimeSecs() - scanner_starttime;
	
	console.log("Running for " + runtime + " seconds. Scanning " + scanner_worklist + " items.");
	
	if (scanner_result.length>0){
		for (var x=0; x < scanner_result.length; x++){
			console.log(scanner_result[x]);
		}
	}
	if (scanner_worklist>0){
		setTimeout(showlog,3000);
	}else{
		console.log("--DONE--");
	}
	
}


function overwriteresult(newresult){
	//checks if entry already exists in result table
	//if so will only upddate if the new result is not an UNKNOWN as it is the least informative option
	//if not, will add to result lis
	var exists=false;
	for (var x=0;x < scanner_result.length ; x++){
		//console.log(scanner_result[x].split('|')[0] + '|' + newresult.split('|')[0]);
		if (scanner_result[x].split('|')[0] == newresult.split('|')[0]){
			exists=true;
			if(newresult.split('|')[1] != "UNKNOWN"){scanner_result[x]=newresult}
		}
	}
	
	if (exists==false){scanner_result.push(newresult);}
}

function _getTimeSecs(){
	var d = new Date();
	var t_hour = d.getHours();     // Returns hours
	var t_min = d.getMinutes();    // Returns minutes
	var t_sec = d.getSeconds();    // Returns seocnds
	var result = ((t_hour*60)+t_min)*60 + t_sec;
	return result;
}