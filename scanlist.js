
	//internal vars
	var scanlist_scanurls=[]
	var scanlist_isloaded=0;

	function scanlist_init(){
		scanlist_isloaded=-1;
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open('GET', 'scanlist2.txt');
		xmlhttp.onreadystatechange = scanlist_init_callback;
		xmlhttp.send();	
	}
	function scanlist_init_callback(){
		if (this.readyState == 4 && this.status == 200){
			var lines= this.responseText.split('\n')
			var tmp_data=null
			
			for (var x=0;x<lines.length;x++){
				if (lines[x].substring(0,1) != "#"){
					try{
						tmp_data= lines[x].replace('\r','').split('|');
						if(tmp_data.length==6){
							scanlist_scanurls.push(new Array)
							scanlist_scanurls[scanlist_scanurls.length-1]["ID"]= parseInt(tmp_data[0])
							scanlist_scanurls[scanlist_scanurls.length-1]["LABEL"]=tmp_data[1]
							scanlist_scanurls[scanlist_scanurls.length-1]["IMAGE"]=tmp_data[2]
							scanlist_scanurls[scanlist_scanurls.length-1]["HEIGHT"]= parseInt(tmp_data[3].split(",")[0])
							scanlist_scanurls[scanlist_scanurls.length-1]["WIDTH"]= parseInt(tmp_data[3].split(",")[1])
							scanlist_scanurls[scanlist_scanurls.length-1]["DEPTRIGGER"]= parseInt(tmp_data[4])
							scanlist_scanurls[scanlist_scanurls.length-1]["DEPENDENCY"]= tmp_data[5]
						}else{
							console.log('Invalid scan url in scanlist.txt: ' + lines[x])
						}
					}
					catch(err){
						console.log('Invalid scan url in scanlist.txt: ' + lines[x])				
					}
					
				}
			}
		}
		scanlist_isloaded=1;
	}
	
	function scanlist_loadurls(){
		var tmpurls=[];
		for (var x=0; x < scanlist_scanurls.length; x++){
				tmpurls.push(scanlist_scanurls[x])
		}
		return tmpurls;
	}
	
	
	function scanlist_removeObsoleteItems(urllist, curritem,result){
		for(var x = curritem["ID"]; x < urllist.length; x++){
			//Starting at current item until end of list
			if (urllist[x] != null){
				if (urllist[x]["DEPENDENCY"] != ""){
					if( result==0 && urllist[x]["DEPENDENCY"]==curritem["ID"]){urllist[x]=null;}
					if( result==1 && urllist[x]["DEPENDENCY"]=="!"+curritem["ID"]){urllist[x]=null;}
				}
			}
		}
	}
	function scanlist_loaddependencies(lsID, licontains, lilevel){
		//contains = 1 load all dependencies with this uid set + all from sublevel with no dep set
		//contains = 0 load all dependencies with this !uid set + all from sublevel with no dep set
		
		var tmpurls=[];
		for (var x=0; x < scanlist_scanurls.length; x++){
			if (scanlist_scanurls[x]["LEVEL"]==lilevel + 1 && scanlist_scanurls[x]["DEPENDENCY"]=="" ){
				tmpurls.push(scanlist_scanurls[x])
			}else if(scanlist_scanurls[x]["DEPENDENCY"] == lsID && licontains==1 && scanlist_scanurls[x]["LEVEL"]==lilevel + 1){
				tmpurls.push(scanlist_scanurls[x])
			}else if(scanlist_scanurls[x]["DEPENDENCY"] == "!"+lsID && licontains==0 && scanlist_scanurls[x]["LEVEL"]==lilevel + 1){
				tmpurls.push(scanlist_scanurls[x])
			}
		}
		return tmpurls;		
	}