function preLoadOverlayForGif(){for(var e=0;e<5;e++)imgs[e]=loadImage("assets/imgSet1/0"+e+".png")}function getFrameForGif(){var e=createGraphics(640,480);cnv.loadPixels(),e.image(cnv,0,0,640,480),e.image(imgs[sequenceStep],-20,-20,680,520),gif.addFrame(e.canvas,{delay:0})}function generateGif(){gif.render(),null!=downloadUrl&&URL.revokeObjectURL(downloadUrl),console.log("preparing gif"),gif.on("finished",function(e){downloadUrl=URL.createObjectURL(e),console.log("download url:"+downloadUrl)})}function downloadGif(e,t){consoleDebug&&console.log("start gif download");var o=document.createElement("a");o.setAttribute("href",e),o.setAttribute("download",t);var s=document.createEvent("MouseEvents");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,0,null),o.dispatchEvent(s)}function openGifInNewWindow(){window.open(downloadUrl)}function resetGif(){null!=downloadUrl&&URL.revokeObjectURL(downloadUrl),gif=new GIF(gifParameters)}function startPrediction(){doPrediction=!0,consoleDebug&&console.log("start prediction"),drawDomDebug&&select("#status").html("start prediction")}function clearLabel(e){knnClassifier.clearLabel(e),updateCounts()}function clearAllLabels(){knnClassifier.clearAllLabels(),updateCounts()}function saveModel(){consoleDebug&&console.log("saving knnClassifier"),knnClassifier.save("knn_model_"+getTimeStamp()),drawDomDebug&&select("#status").html("knnClassifier model saved")}function loadDataset(){knnClassifier.load("./assets/model.json",updateCounts),consoleDebug&&console.log("loaded knnClassifier"),drawDomDebug&&select("#status").html("knnClassifier model loading")}function addExample(e){if(poses.length>0){var t=poses[selectedPosId].pose.keypoints.map(e=>[e.score,e.position.x,e.position.y]);knnClassifier.addExample(t,e),updateCounts()}}function modelReady(){}function classify(){if(knnClassifier.getNumLabels()<=0)console.error("There is no examples in any label");else if(poses.length>0){var e=poses[selectedPosId].pose.keypoints.map(e=>[e.score,e.position.x,e.position.y]);knnClassifier.classify(e,gotResults),waitingForResult=!0}else consoleDebug&&console.log("no pose to classify")}function gotResults(e,t){if(e&&console.error(e),t.confidencesByLabel){var o=t.confidencesByLabel;t.label&&(drawDomDebug&&select("#result").html(t.label),drawDomDebug&&select("#confidence").html(`${100*o[t.label]} %`));for(let e=0;e<classId.length;e++)trainingView&&select("#confidence"+classId[e]).html(`${o[classId[e]]?100*o[classId[e]]:0} %`),confLevels[e]=100*o[classId[e]]}waitingForResult=!1}function updateCounts(){var e=knnClassifier.getCountByLabel();for(let t=0;t<classId.length;t++)trainingView&&select("#example"+classId[t]).html(e[classId[t]]||0)}var video,poseDebugDraw=!1,selectedPosDraw=!0,trainingView=!1,excludeFace=!0,knnClassifier=ml5.KNNClassifier();let poseNet,poses=[],poseNetOptions={imageScaleFactor:.1,outputStride:8,flipHorizontal:!0,minConfidence:0,maxPoseDetections:0,detectionType:"multi",multiplier:.5};var cnv,videoCanvas,canvasW=640,canvasH=480,scaleCanvas=1.5,windowWidthMin=1300,outerFrame=20,cameraResW=640,cameraResH=480,selectedPosStrokeWeight=6,doPrediction=!1,waitingForResult=!1,isFreaze=!1,selectedPosId=0,lastMillis=0,frameRateCounter=0,frameRateCount=0,classId=["Z","A","B","C","D","E"],confLevels=[],userMode=0,sequenceStep=0,sequenceTotalSteps=4;let conf=0;var trainingClass,gif,videoFrameCount=0,loopFrameCount=0,doTraining=!1,videoIsRunning=!1,trainingPoseScoreThreshold=.7,imagePath="assets/imgSet1/",feedbackSet="a",gifParameters={workers:1,repeat:0,quality:5,debug:!0,width:640,height:480,workerScript:"js/libs/gif.worker.js"},imgs=[],downloadUrl=null;function preload(){}function setup(){noLoop(),preloadOverlayImg()}function startP5(){consoleDebug&&console.log("start setup");for(let e=0;e<classId.length;e++)confLevels[e]=0;consoleDebug&&console.log("init camera"),(videoCanvas=createCanvas(cameraResW,cameraResH)).parent("videoContainer"),(video=createCapture(VIDEO)).size(cameraResW,cameraResH),video.hide(),consoleDebug&&console.log("init display canvas"),windowWidth>windowWidthMin&&(consoleDebug&&console.log("scale canvas factor 1.5"),canvasW*=scaleCanvas,canvasH*=scaleCanvas,outerFrame*=scaleCanvas,selectedPosStrokeWeight*=scaleCanvas,$(".levels").each(function(){$(this).removeClass("levels"),$(this).addClass("levels_large")}),$("#resetButton").removeClass("resetIcon"),$("#resetButton").addClass("resetIcon_large"),$(".centerButton").each(function(){$(this).removeClass("centerButton"),$(this).addClass("centerButton_large")}),$("#gifButtonFrame").removeClass("gifButtonClass"),$("#gifButtonFrame").addClass("gifButtonClass_large")),cnv=createCanvas(canvasW,canvasH),pixelDensity(1),cnv.style("z-index","-1"),centerCanvas(),centerOverlay(),consoleDebug&&console.log("init posNet"),initPoseNet(),drawDomDebug&&$(".debugText").each(function(){$(this).css("display","block")}),trainingView?$("#trainingDiv").load("js/prototype/trainAndDebug/trainingsDiv.html"):(consoleDebug&&console.log("load model and start prediction"),loadDataset(),startPrediction(),gif=new GIF(gifParameters),preLoadOverlayForGif(),bindButtons(),setTimeout(function(){showMenu()},1e3)),loop()}function bindButtons(){$("#resetButton").click(function(){stopAndShowMenu()}),$("#buttonMode1").click(function(){fadeOutMenu(),startSequence(1)}),$("#buttonMode2").click(function(){fadeOutMenu(),startSequence(2)}),$("#gifButton").click(function(){downloadGif(downloadUrl,"IoSW"),openGifInNewWindow()})}function initPoseNet(){drawDomDebug&&select("#status").html("init openPosNet"),null!=poseNet&&(poses=[],poseNet.removeAllListeners()),(poseNet=ml5.poseNet(video,modelReady,poseNetOptions)).on("pose",function(e){poses=e})}function draw(){drawDomDebug&&printFrameRate(),videoIsRunning&&(loopFrameCount++,drawDomDebug&&(document.getElementById("debug3").innerHTML="loop-frames: "+loopFrameCount+"; video-frames: "+int(25*video.time())),video.time()==video.duration()&&stopVideo()),translate(width,0),scale(-1,1),null!=video&&(tint(255,255),image(video,0,0,width,height),filter(GRAY)),poses.length>0?(drawDomDebug&&(document.getElementById("debug1").innerHTML="poses detected: "+poses.length),selectedPosId=getCenterPos(),excludeFace&&removeBodyPartsFromPose(selectedPosId),selectedPosDraw&&drawSelectedPose(selectedPosId),poseDebugDraw&&drawOtherPoses(selectedPosId),doTraining&&(poses[selectedPosId].pose.score>=trainingPoseScoreThreshold&&(consoleDebug&&console.log("adding class: "+trainingClass),addExample(trainingClass)),videoFrameCount++),1==doPrediction&&0==waitingForResult&&classify()):drawDomDebug&&(document.getElementById("debug1").innerHTML="no pose detected"),translate(width,0),scale(-1,1),0==trainingView&&sequence()}function windowResized(){null!=cnv&&(centerCanvas(),centerOverlay())}function centerCanvas(){var e=(windowWidth-width)/2,t=(windowHeight-height)/2;cnv.position(e,t)}function centerOverlay(){$("#overlayImage").css("width",width+2*outerFrame+"px"),$("#overlayImage").css("height",height+2*outerFrame+"px"),$("#overlayImage").css("left",cnv.position().x-outerFrame),$("#overlayImage").css("top",cnv.position().y-outerFrame)}function getCenterPos(){var e=0,t=cameraResW/2;for(let a=0;a<poses.length;a++){var o=0,s=0;let r=poses[a].pose;for(let e=0;e<r.keypoints.length;e++){let t=r.keypoints[e];t.score>.2&&(o+=t.position.x,s++)}var n=abs(o/s-cameraResW/2);n<t&&(t=n,e=a)}return drawDomDebug&&(document.getElementById("debug2").innerHTML="selected pose score: "+poses[e].pose.score.toFixed(2)),e}function removeBodyPartsFromPose(e){let t=poses[e];var o=["nose","leftEye","rightEye","leftEar","rightEar","leftKnee","rightKnee","leftAnkle","rightAnkle"];let s=t.pose.keypoints,n=[];for(let e=0;e<s.length;e++){let t=s[e].part;for(var a=!1,r=0,i=o.length;r<i;r++)if(-1!==t.indexOf(o[r])){a=!0;break}a||append(n,s[e])}t.pose.keypoints=n,poses[e]=t}function drawSelectedPose(e){let t,o,s,n,a=poses[e].skeleton;noFill(),100===conf?stroke(255,82,30):stroke(255,255,255),strokeWeight(selectedPosStrokeWeight);for(let e=0;e<a.length;e++){let r=a[e][0],i=a[e][1];if(videoIsRunning)line(r.position.x,r.position.y,i.position.x,i.position.y);else{let e=r.position.x*(canvasW/cameraResW),a=i.position.x*(canvasW/cameraResW),c=r.position.y*(canvasW/cameraResW),l=i.position.y*(canvasW/cameraResW),u=(e+a)/2,d=(c+l)/2,p=.66*e+.33*a,g=.66*c+.33*l,f=.33*e+.66*a,m=.33*c+.66*l,S=.75*e+.25*a,v=.75*c+.25*l,h=.25*e+.75*a,w=.25*c+.75*l,b=map(conf,0,100,30,0);if("leftShoulder"===r.part&&"rightShoulder"===i.part||"leftShoulder"===i.part&&"rightShoulder"===r.part||"leftHip"===r.part&&"rightHip"===i.part||"leftHip"===i.part&&"rightHip"===r.part||"leftHip"===r.part&&"leftShoulder"===i.part||"leftHip"===i.part&&"leftShoulder"===r.part||"rightHip"===r.part&&"rightShoulder"===i.part||"rightHip"===i.part&&"rightShoulder"===r.part){if("leftShoulder"===r.part&&"rightShoulder"===i.part||"leftShoulder"===i.part&&"rightShoulder"===r.part)beginShape(),curveVertex(e,c),curveVertex(e,c),curveVertex(random(S-b,S+b),random(v-b,v+b)),curveVertex(random(S-b,S+b),random(v-b,v+b)),curveVertex(u,d),curveVertex(u,d),endShape(),beginShape(),curveVertex(a,l),curveVertex(a,l),curveVertex(random(h-b,h+b),random(w-b,w+b)),curveVertex(random(h-b,h+b),random(w-b,w+b)),curveVertex(u,d),curveVertex(u,d),endShape(),t=(e+a)/2,o=(c+l)/2;else if("leftHip"===r.part&&"rightHip"===i.part||"leftHip"===r.part&&"rightHip"===i.part){beginShape(),curveVertex(e,c),curveVertex(e,c),curveVertex(random(S-b,S+b),random(v-b,v+b)),curveVertex(random(S-b,S+b),random(v-b,v+b)),curveVertex(u,d),curveVertex(u,d),endShape(),beginShape(),curveVertex(a,l),curveVertex(a,l),curveVertex(random(h-b,h+b),random(w-b,w+b)),curveVertex(random(h-b,h+b),random(w-b,w+b)),curveVertex(u,d),curveVertex(u,d),endShape();let r=.66*t+.33*(s=(e+a)/2),i=.66*o+.33*(n=(c+l)/2),p=.33*t+.66*s,g=.33*o+.66*n;beginShape(),curveVertex(t,o),curveVertex(t,o),curveVertex(random(r-b,r+b),random(i-b,i+b)),curveVertex(random(r-b,r+b),random(i-b,i+b)),curveVertex(random(f-b,p+b),random(g-b,g+b)),curveVertex(random(f-b,p+b),random(g-b,g+b)),curveVertex(s,n),curveVertex(s,n),endShape()}}else beginShape(),curveVertex(e,c),curveVertex(e,c),curveVertex(random(p-b,p+b),random(g-b,g+b)),curveVertex(random(p-b,p+b),random(g-b,g+b)),curveVertex(random(f-b,f+b),random(m-b,m+b)),curveVertex(random(f-b,f+b),random(m-b,m+b)),curveVertex(a,l),curveVertex(a,l),endShape()}}}function drawOtherPoses(e){drawKeypoints(e),drawSkeleton(e)}function drawKeypoints(e){fill(255,255,0),noStroke();for(let t=0;t<poses.length;t++)if(t!=e){let e=poses[t].pose;for(let t=0;t<e.keypoints.length;t++){let o=e.keypoints[t];o.score>.2&&ellipse(o.position.x,o.position.y,5,5)}}}function drawSkeleton(e){stroke(255,255,0),strokeWeight(1);for(let t=0;t<poses.length;t++)if(t!=e){let e=poses[t].skeleton;for(let t=0;t<e.length;t++){let o=e[t][0],s=e[t][1];line(o.position.x,o.position.y,s.position.x,s.position.y)}}}function printFrameRate(){if(frameRateCounter+=int(frameRate()),frameRateCount++,millis()>lastMillis+300){lastMillis=millis();var e=frameRateCounter/frameRateCount;drawDomDebug&&(document.getElementById("frameRate").innerHTML="fr: "+int(e)),frameRateCounter=0,frameRateCount=0}}function getTimeStamp(){var e="",t=new Date;return e+=t.getFullYear()+"-",e+=t.getMonth()+1+"-",e+=t.getDate()+"-",e+=t.getHours()+"-",e+=t.getMinutes()+"-",e+=t.getSeconds()}var processStep=0,waitTime=0,lastTime=0,waitForFades=!0,lastMatch=0,minMatchTime=1e3,wasMatching=!1,freazeTime=1e3,speedLevels=[3e3,2e3,1e3],actuallSpeedLevel=0,speedLevelPromts=["Slowly","Speed it up","Move it!"],sequenceLoopCount=0,confStore=0,confStoreCount=0,confMatchLevel=40;function startSequence(e){consoleDebug&&console.log("start sequnece"),drawDomDebug&&select("#status").html("start sequnece"),userMode=e,processStep=1,sequneceStep=0,resetGif(),setTimeout(function(){$("#resetButton").fadeIn(2e3)},3e3)}function sequence(){if(conf=poses.length>0?confLevels[sequenceStep]:0,0==userMode)switch(processStep){case 0:break;default:consoleDebug&&console.log("processStep out of bounds, there is no switch case for this processStep ("+processStep+")")}else if(1==userMode)switch(processStep){case 0:break;case 1:consoleDebug&&console.log("processStep: 1"),waitForFades=!0,sequenceStep=0,showMe("#poseStart",500),fadeInNextSequenceStep(0),waitTime=5e3,lastTime=millis(),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep);break;case 2:lastTime+waitTime<millis()&&(waitForFades=!0,fadeInNextSequenceStep(++sequenceStep),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep));break;case 3:100==conf&&0==waitForFades?0==wasMatching?(wasMatching=!0,lastMatch=millis()):lastMatch+minMatchTime<millis()&&(feedbackFlash(),freaze(),consoleDebug&&console.log("pose conf == 100%! freaze!"),setTimeout(function(){waitForFades=!0,wasMatching=!1,noFreaze(),++sequenceStep<=sequenceTotalSteps?fadeInNextSequenceStep(sequenceStep):processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep)},freazeTime)):wasMatching=!1;break;case 4:consoleDebug&&console.log("processStep:"+processStep),waitForFades=!0,sequenceStep=0,showMe("#poseLoop",500),fadeInNextSequenceStep(0),waitTime=5e3,lastTime=millis(),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep);break;case 5:lastTime+waitTime<millis()&&(waitForFades=!0,fadeInNextSequenceStep(++sequenceStep),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep));break;case 6:100==conf&&0==waitForFades?0==wasMatching?(wasMatching=!0,lastMatch=millis()):lastMatch+minMatchTime<millis()&&(getFrameForGif(),feedbackFlash(),freaze(),consoleDebug&&console.log("pose conf == 100%! freaze!"),setTimeout(function(){waitForFades=!0,wasMatching=!1,noFreaze(),++sequenceStep<=sequenceTotalSteps?fadeInNextSequenceStep(sequenceStep):(processStep++,generateGif()),consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep)},freazeTime)):wasMatching=!1;break;case 7:consoleDebug&&console.log("processStep:"+processStep),waitForFades=!0,sequenceStep=0,showMe("#poseEnd",500),fadeInNextSequenceStep(0),waitTime=5e3,lastTime=millis(),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep);break;case 8:lastTime+waitTime<millis()&&(consoleDebug&&console.log(" --\x3e end of training one"),stopAndShowMenu());break;default:consoleDebug&&console.log("processStep out of bounds, there is no switch case for this processStep ("+processStep+")")}else if(2==userMode)switch(processStep){case 0:break;case 1:consoleDebug&&console.log("processStep: 1"),waitForFades=!0,sequenceStep=0,showMe("#moveStart",500),fadeInNextSequenceStep(0),waitTime=5e3,lastTime=millis(),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep);break;case 2:lastTime+waitTime<millis()&&(waitForFades=!0,processStep++,sequenceStep=1,actuallSpeedLevel=0,confStore=0,confStoreCount=0,sequenceLoopCount=0,nextWorkOutStep(),motivationPromt(speedLevelPromts[actuallSpeedLevel]),consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep));break;case 3:if(lastTime+waitTime<millis())if(++sequenceStep<=sequenceTotalSteps)nextWorkOutStep();else{sequenceStep=0,sequenceLoopCount++;var e=confStore/confStoreCount;drawDomDebug&&(document.getElementById("debug3").innerHTML="confAverage: "+e),consoleDebug&&console.log("confAverage: "+e),e>confMatchLevel?(actuallSpeedLevel++,sequenceLoopCount=0,consoleDebug&&console.log("speed it up to speed level: "+actuallSpeedLevel),actuallSpeedLevel>=speedLevels.length?(processStep++,consoleDebug&&console.log("your allready reached top level, your are done! nice job!")):motivationPromt(speedLevelPromts[actuallSpeedLevel])):5==sequenceLoopCount?motivationPromt("Match the pose!"):10==sequenceLoopCount?motivationPromt("Your're not trying, are you?"):15==sequenceLoopCount&&motivationPromt("Better start over with warm up"),confStore=0,confStoreCount=0}else confStore+=conf,confStoreCount++;break;case 4:consoleDebug&&console.log("processStep:"+processStep),waitForFades=!0,sequenceStep=0,showMe("#moveEnd",500),fadeInNextSequenceStep(0),waitTime=5e3,lastTime=millis(),processStep++,consoleDebug&&console.log("processStep: "+processStep+"; sequenceStep:"+sequenceStep);break;case 5:lastTime+waitTime<millis()&&(consoleDebug&&console.log(" --\x3e end of training one"),stopAndShowMenu());break;default:consoleDebug&&console.log("processStep out of bounds, there is no switch case for this processStep ("+processStep+")")}else consoleDebug&&console.log("userMode out of bounds, there is no sequence switch case for this userMode")}function showMenu(){nextOverLay(0),$("#modeButtons").fadeIn(1500),downloadUrl&&$("#gifButtonFrame").fadeIn(1500)}function fadeOutMenu(){$("#modeButtons").fadeOut(500),$("#gifButtonFrame").fadeOut(500)}function stopAndShowMenu(){showMenu(),userMode=0,processStep=0,sequneceStep=0,$("#resetButton").fadeOut(500)}function fadeInNextSequenceStep(e){consoleDebug&&console.log("fade in Sequence-step "+e),1==userMode?(setTimeout(function(){$("#pose"+e).fadeIn(500)},0),setTimeout(function(){$("#pose"+e).fadeOut(500),waitForFades=!1},2e3),setTimeout(function(){nextOverLay(e)},600)):2==userMode?(waitForFades=!1,nextOverLay(e)):consoleDebug&&console.log("userMode out of bounds, there is no overLay fading style for this userMode")}function nextOverLay(e){$("#backImg").attr("src",$("#frontImg").attr("src")),$("#backImg").css("display","inline"),setTimeout(function(){$("#frontImg").css("display","none"),$("#frontImg").attr("src",imagePath+"0"+e+".png"),$("#backImg").fadeOut(800),$("#frontImg").fadeIn(400)},50)}function nextWorkOutStep(){waitForFades=!0,$("#backImg").attr("src",$("#frontImg").attr("src")),$("#backImg").css("display","inline"),setTimeout(function(){$("#frontImg").css("display","none"),$("#frontImg").attr("src",imagePath+"0"+sequenceStep+".png"),$("#backImg").fadeOut(100),$("#frontImg").fadeIn(100)},50),waitTime=speedLevels[actuallSpeedLevel],lastTime=millis()}function feedbackOverLay(e){$("#backImg").attr("src",$("#frontImg").attr("src")),$("#backImg").css("display","inline"),$("#frontImg").css("display","none"),$("#frontImg").attr("src",imagePath+"0"+e+feedbackSet+".png"),$("#backImg").fadeOut(100),$("#frontImg").fadeIn(100)}function feedbackFlash(){$("#feedbackImg").fadeIn(10),setTimeout(function(){$("#feedbackImg").fadeOut(100)},400)}function motivationPromt(e){$("#moveState").html(e),setTimeout(function(){$("#moveState").fadeIn(400)},100),setTimeout(function(){$("#moveState").fadeOut(400)},3300)}function showMe(e,t){setTimeout(function(){$(e).fadeIn(t)},t),setTimeout(function(){$(e).fadeOut(t)},3300+t)}function preloadOverlayImg(){var e="<img src='"+imagePath+"00"+feedbackSet+".png'>";for(let t=0;t<=sequenceTotalSteps;t++)e=e.concat("<img src='"+imagePath+"0"+t+".png'>");$("#preloader").html(e),$("#feedbackImg").attr("src",imagePath+"00"+feedbackSet+".png")}function toggleFreaze(){isFreaze?(loop(),isFreaze=!1):(noLoop(),isFreaze=!0)}function freaze(){noLoop()}function noFreaze(){loop()}