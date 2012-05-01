

function target(id,ip, scanlist,report_callback,recon_mode){
	/*
	ip = ip adres of target
	scanlist = array of urls to scan on ip
	report_callback, funtion to execute when we are done
	recon_mode, boolean, when set to true scanning will stop when img_onload was succesfull, set to falls to run all items in scanlist (exploit mode)
	*/
	
	this.SetDeathTimeout=function(secs){death_timeout=secs;}
	
	this.Scan = target_scan;
	var current_scanlistItem=0;
	var death_timeout=3; //default arp failure
	var stat_urltrycount=0;
	var stat_urlomitcount=0;
	var response_times=[];
	
	function img_onload(img, _id, start_time){
		var end_time=getTimeSecs() - start_time;
		end_time = Math.round(end_time,0);
		handle_result(1,img, end_time);
	}
	function img_onerror(img, _id, start_time) {
		var end_time=getTimeSecs() - start_time;
		end_time = Math.round(end_time,0);
		handle_result(0,img, end_time);
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
			report_callback(id,ip,0,'DONE', scanlist[current_scanlistItem], stat_urltrycount + "/" + stat_urlomitcount,0);
		}
		
	}
	function handle_result(result,img,time_taken){

		var stopscanning=0;
		
		response_times.push(time_taken); //keep statistics to trap dead ips

		stat_urltrycount=stat_urltrycount+1;

		if (result ==1){
		//image retrieval was a succes.
			if (scanlist[current_scanlistItem]["DEPTRIGGER"]==0){stopscanning=1;}
			report_callback(id,ip,1,"HIT",scanlist[current_scanlistItem],stat_urltrycount + "/" + stat_urlomitcount,time_taken);
		}else{
		//failure also yields viable info
		//e.g.: arp takes 3 seconds, if it fails before that we know that the ip is in use
			if (isDeadHost(response_times,death_timeout, stat_urltrycount)==true){
				stopscanning==1 //dead, don't scan further
				report_callback(id,ip,0,'DEAD',scanlist[current_scanlistItem],stat_urltrycount + "/" + stat_urlomitcount, time_taken);				
			}else{;
				report_callback(id,ip,0,'UNKNOWN', scanlist[current_scanlistItem],stat_urltrycount + "/" + stat_urlomitcount,time_taken);
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
		var start_time= getTimeSecs();
		objImage.onload = function(){img_onload(this,_id,start_time)}
		objImage.onerror= function(){img_onerror(this,_id,start_time)}
		//objImage.onabort= function(){img_onerror(this,_id,getTimeSecs())}
		objImage.src=lsURL;
	}

}

function getTimeSecs(){
	var d = new Date();
	var t_hour = d.getHours();     // Returns hours
	var t_min = d.getMinutes();    // Returns minutes
	var t_sec = d.getSeconds();    // Returns seconds
	var t_milli = d.getMilliseconds() /1000;    // Returns seconds
	var result = ((t_hour*60)+t_min)*60 + t_sec + t_milli;
	return result;
}

function isDeadHost(response_times,death_timeout, stat_urltrycount){
	//tries to determine wether a host is dead, normal response time should be ~3 seconds for non existing ips
	//as this is the arp timeout
	//unfortunatly firefox and chrome seem to behave strangely, second scan round, the first item is tagged at ~1  second....
	//subsequent requests follow normal patter again
	//se we have to implement a system that takes accounts for more then one request.
	//we'll take a death count o 3 trespasses
	var deathcount = 0;
	
	if (stat_urltrycount >= 4){return false};  //added this for devices with really bad webservers, e.g.: my netgear readynas doesn't really like 10 consequtive requests and gets to a crawl :/ 

	for (x=0; x< response_times.length; x++){
		if (response_times[x]>= death_timeout){
			deathcount=deathcount+1;
			if (deathcount = 3){
				return true;
			}
		}
	}
	return false;
}



//mark file as loaded
main_filesloaded=main_filesloaded+1;



