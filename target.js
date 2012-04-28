

function target(iid,lsip, scanlist,report_callback,recon_mode){
	/*
	ip = ip adres of target
	scanlist = array of urls to scan on ip
	report_callback, funtion to execute when we are done
	recon_mode, boolean, when set to true scanning will stop when img_onload was succesfull, set to falls to run all items in scanlist (exploit mode)
	*/
	
	this.SetDeathTimeout=function(secs){death_timeout=secs;}
	
	this.Scan = target_scan;
	var current_scanlistItem=0;
	var death_timeout=4;
	var stat_urltrycount=0;
	var stat_urlomitcount=0;
	var ip= lsip;
	var id= iid;
	this.IP=ip;
	var start_time;

//Async IMG LOadEvents	
	function CreateDelegate(contextObject, delegateMethod) {return function() { return delegateMethod.apply(contextObject, arguments);}}
	function img_onload(img, _id){
		handle_result(1,img);
	}
	function img_onerror(img, _id) {
		handle_result(0,img);
	}

	function target_scan(){
		if(scanlist[current_scanlistItem]==null && current_scanlistItem < scanlist.length){
			current_scanlistItem=current_scanlistItem+1;
			stat_urlomitcount = stat_urlomitcount+1;
			target_scan();
		}else if (scanlist[current_scanlistItem]!=null && current_scanlistItem < scanlist.length){
			var lsurl = scanlist[current_scanlistItem]["PROTO"]+"://" + ip + ":" + scanlist[current_scanlistItem]["PORT"] + "/" + scanlist[current_scanlistItem]["IMAGE"];
			RetrImg(lsurl);
		}else{
			report_callback(id,ip,0,'DONE', scanlist[current_scanlistItem], stat_urltrycount + "/" + stat_urlomitcount);
		}
		
	}
	function handle_result(result,img){
		//console.log("finished:" + img.src);  //Debug only
		var stopscanning=0;
		end_time=getTimeSecs() - start_time;
		stat_urltrycount=stat_urltrycount+1;
		if (result ==1){
		//image retrieval was a succes.
			if (scanlist[current_scanlistItem]["DEPTRIGGER"]==0){stopscanning=1;}
			report_callback(id,ip,1,"HIT",scanlist[current_scanlistItem],stat_urltrycount + "/" + stat_urlomitcount);
		}else{
		//failure also yields viable info
		//e.g.: arp takes 3 seconds, if it fails before that we know that the ip is in use
			if (end_time >= death_timeout  && scanlist[current_scanlistItem]["ID"]==0){
				stopscanning==1 //dead, don't scan further
				report_callback(id,ip,0,'DEAD',scanlist[current_scanlistItem],stat_urltrycount + "/" + stat_urlomitcount);				
			}else{;
				report_callback(id,ip,0,'UNKNOWN', scanlist[current_scanlistItem],stat_urltrycount + "/" + stat_urlomitcount);
			}
		}
		
		if (stopscanning==0){
			scanlist_removeObsoleteItems(scanlist,scanlist[current_scanlistItem],result);
			current_scanlistItem = current_scanlistItem+1;
			target_scan() //scan next image
		}
	}
	
	function RetrImg(lsURL,_id){
		objImage = new Image();
		/*
		objImage.onload = CreateDelegate(objImage, img_onload); 
		objImage.onerror = CreateDelegate(objImage, img_onerror); 
		objImage.onabort = CreateDelegate(objImage, img_onerror); 
		*/
		//console.log("Started: " + lsURL); //debug only
		objImage.onload = function(){img_onload(this,_id)}
		objImage.onerror= function(){img_onerror(this,_id)}
		objImage.onabort= function(){img_onerror(this,_id)}
		start_time=getTimeSecs();
		objImage.src=lsURL; //loads async
	}

}

function getTimeSecs(){
	var d = new Date();
	var t_hour = d.getHours();     // Returns hours
	var t_min = d.getMinutes();    // Returns minutes
	var t_sec = d.getSeconds();    // Returns seocnds
	var result = ((t_hour*60)+t_min)*60 + t_sec;
	return result;
}



